import {
  Component,
  DestroyRef,
  Inject,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SessionExpiryDialogData {
  expiresAt: number;
}

export type SessionExpiryResult = 'dismiss' | 'logout';

@Component({
  selector: 'app-session-expiry-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './session-expiry-dialog.html',
  styleUrl: './session-expiry-dialog.scss',
})
export class SessionExpiryDialog implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private readonly remainingMs = signal(0);

  readonly countdown = computed(() => {
    const totalSeconds = Math.max(0, Math.ceil(this.remainingMs() / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor(
    private readonly dialogRef: MatDialogRef<
      SessionExpiryDialog,
      SessionExpiryResult
    >,
    @Inject(MAT_DIALOG_DATA) private readonly data: SessionExpiryDialogData
  ) {}

  ngOnInit(): void {
    this.tick();
    const timer = setInterval(() => this.tick(), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  dismiss(): void {
    this.dialogRef.close('dismiss');
  }

  logoutNow(): void {
    this.dialogRef.close('logout');
  }

  private tick(): void {
    this.remainingMs.set(this.data.expiresAt - Date.now());
  }
}
