import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuditLog } from '../../models/audit-log';
import { AuditLogService } from '../../services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.scss',
})
export class AuditLogs implements OnInit {
  logs = signal<AuditLog[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  displayedColumns: string[] = [
    'timestamp',
    'action',
    'entityType',
    'entityId',
    'username',
    'details',
  ];

  constructor(private readonly auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set(null);

    this.auditLogService.getAuditLogs().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.logs.set(response.data);
        } else {
          this.error.set(response.message || 'Could not load audit logs.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'An error occurred while loading audit logs.'
        );
      },
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  actionIcon(action: string): string {
    switch (action.toUpperCase()) {
      case 'CREATE':
      case 'CREATED':
        return 'add_circle';
      case 'UPDATE':
      case 'UPDATED':
        return 'edit';
      case 'DELETE':
      case 'DELETED':
        return 'delete';
      default:
        return 'history';
    }
  }

  actionColor(action: string): string {
    switch (action.toUpperCase()) {
      case 'CREATE':
      case 'CREATED':
        return 'primary';
      case 'UPDATE':
      case 'UPDATED':
        return 'accent';
      case 'DELETE':
      case 'DELETED':
        return 'warn';
      default:
        return '';
    }
  }
}
