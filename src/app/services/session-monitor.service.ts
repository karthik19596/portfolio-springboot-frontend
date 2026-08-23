import { Injectable, effect, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  SessionExpiryDialog,
  SessionExpiryResult,
} from '../components/session-expiry-dialog/session-expiry-dialog';
import { AuthService } from './auth.service';

/** How long before the token lapses the warning dialog appears. */
const WARNING_LEAD_MS = 60_000;

/**
 * Watches the active token's `exp` claim and ends the session on time.
 * Without this, an idle tab keeps rendering a signed-in shell until the user
 * navigates or fires a request that comes back 401.
 */
@Injectable({ providedIn: 'root' })
export class SessionMonitorService {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  private warningTimer?: ReturnType<typeof setTimeout>;
  private expiryTimer?: ReturnType<typeof setTimeout>;
  private dialogRef?: MatDialogRef<SessionExpiryDialog, SessionExpiryResult>;

  constructor() {
    effect(() => {
      const authenticated = this.authService.isAuthenticated();
      this.clearTimers();
      this.closeDialog();

      if (authenticated) {
        this.schedule();
      }
    });
  }

  private schedule(): void {
    const expiresAt = this.authService.getExpiresAt();
    if (expiresAt === null) return;

    const untilExpiry = expiresAt - Date.now();
    if (untilExpiry <= 0) {
      this.endSession();
      return;
    }

    const untilWarning = untilExpiry - WARNING_LEAD_MS;
    if (untilWarning > 0) {
      this.warningTimer = setTimeout(
        () => this.openWarning(expiresAt),
        untilWarning
      );
    } else {
      this.openWarning(expiresAt);
    }

    this.expiryTimer = setTimeout(() => this.endSession(), untilExpiry);
  }

  private openWarning(expiresAt: number): void {
    if (this.dialogRef) return;

    const ref = this.dialog.open<
      SessionExpiryDialog,
      { expiresAt: number },
      SessionExpiryResult
    >(SessionExpiryDialog, {
      width: '380px',
      data: { expiresAt },
    });

    this.dialogRef = ref;
    ref.afterClosed().subscribe((result) => {
      this.dialogRef = undefined;
      if (result === 'logout') {
        this.endSession();
      }
    });
  }

  private endSession(): void {
    this.clearTimers();
    this.closeDialog();

    const returnUrl = this.router.url;
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams:
        returnUrl && returnUrl !== '/' && !returnUrl.startsWith('/login')
          ? { returnUrl }
          : {},
    });
  }

  private clearTimers(): void {
    clearTimeout(this.warningTimer);
    clearTimeout(this.expiryTimer);
    this.warningTimer = undefined;
    this.expiryTimer = undefined;
  }

  /** Detaches the ref first so the close does not re-enter endSession(). */
  private closeDialog(): void {
    const ref = this.dialogRef;
    this.dialogRef = undefined;
    ref?.close();
  }
}
