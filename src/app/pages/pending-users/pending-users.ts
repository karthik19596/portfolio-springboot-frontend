import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AdminUser } from '../../models/admin';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-pending-users',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './pending-users.html',
  styleUrl: './pending-users.scss',
})
export class PendingUsers implements OnInit {
  readonly pendingUsers = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly processingIds = signal<Set<number>>(new Set());
  readonly columns = ['username', 'email', 'role', 'createdAt', 'actions'];

  constructor(
    private readonly adminService: AdminService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getPendingUsers().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.pendingUsers.set(response.data);
        } else {
          this.error.set(response.message);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.error?.message || 'Could not load pending users.');
      },
    });
  }

  approve(user: AdminUser): void {
    this.setProcessing(user.id, true);
    this.adminService.approveUser(user.id).subscribe({
      next: (response) => {
        this.setProcessing(user.id, false);
        if (response.success) {
          this.pendingUsers.update((users) => users.filter((u) => u.id !== user.id));
          this.showMessage(`User "${user.username}" approved.`);
        } else {
          this.showMessage(response.message || 'Could not approve user.');
        }
      },
      error: (error) => {
        this.setProcessing(user.id, false);
        this.showMessage(error.error?.message || 'Could not approve user.');
      },
    });
  }

  reject(user: AdminUser): void {
    if (!window.confirm(`Reject user "${user.username}"? They will not be able to log in.`)) {
      return;
    }
    this.setProcessing(user.id, true);
    this.adminService.rejectUser(user.id).subscribe({
      next: (response) => {
        this.setProcessing(user.id, false);
        if (response.success) {
          this.pendingUsers.update((users) => users.filter((u) => u.id !== user.id));
          this.showMessage(`User "${user.username}" rejected.`);
        } else {
          this.showMessage(response.message || 'Could not reject user.');
        }
      },
      error: (error) => {
        this.setProcessing(user.id, false);
        this.showMessage(error.error?.message || 'Could not reject user.');
      },
    });
  }

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  private setProcessing(id: number, processing: boolean): void {
    this.processingIds.update((ids) => {
      const next = new Set(ids);
      if (processing) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3500 });
  }
}
