import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task, TaskPage, TaskRequest } from '../../models/task';
import { TaskService, PageableParams } from '../../services/task.service';
import {
  TaskDialog,
  TaskDialogData,
} from '../../components/task-dialog/task-dialog';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-tasks',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  tasks = signal<Task[]>([]);
  taskPage = signal<TaskPage | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  pageSize = 10;
  pageIndex = 0;
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  displayedColumns: string[] = [
    'title',
    'status',
    'priority',
    'createdAt',
    'actions',
  ];

  constructor(
    private readonly taskService: TaskService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: PageableParams = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: this.sortField,
      direction: this.sortDirection,
    };

    this.taskService.getTasks(params).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.taskPage.set(response.data);
          this.tasks.set(response.data.content);
        } else {
          this.error.set(response.message || 'Could not load tasks.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'An error occurred while loading tasks.'
        );
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active || 'createdAt';
    this.sortDirection = sort.direction || 'desc';
    this.pageIndex = 0;
    this.loadTasks();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TaskDialog, {
      width: '540px',
      data: { task: undefined } as TaskDialogData,
    });

    dialogRef.afterClosed().subscribe((result: TaskRequest | undefined) => {
      if (result) {
        this.createTask(result);
      }
    });
  }

  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialog, {
      width: '540px',
      data: { task } as TaskDialogData,
    });

    dialogRef.afterClosed().subscribe((result: TaskRequest | undefined) => {
      if (result) {
        this.updateTask(task.id, result);
      }
    });
  }

  confirmDelete(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '360px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteTask(task.id);
      }
    });
  }

  private createTask(request: TaskRequest): void {
    this.taskService.createTask(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Task created successfully.');
          this.loadTasks();
        } else {
          this.showError(response.message || 'Could not create task.');
        }
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to create task.');
      },
    });
  }

  private updateTask(id: number, request: TaskRequest): void {
    this.taskService.updateTask(id, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Task updated successfully.');
          this.loadTasks();
        } else {
          this.showError(response.message || 'Could not update task.');
        }
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to update task.');
      },
    });
  }

  private deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Task deleted successfully.');
          this.loadTasks();
        } else {
          this.showError(response.message || 'Could not delete task.');
        }
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to delete task.');
      },
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: 'error-snackbar',
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'TODO':
        return 'status-todo';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'DONE':
        return 'status-done';
      default:
        return '';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'DONE':
        return 'Done';
      default:
        return status;
    }
  }

  priorityClass(priority: string): string {
    switch (priority) {
      case 'LOW':
        return 'priority-low';
      case 'MEDIUM':
        return 'priority-medium';
      case 'HIGH':
        return 'priority-high';
      default:
        return '';
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }
}
