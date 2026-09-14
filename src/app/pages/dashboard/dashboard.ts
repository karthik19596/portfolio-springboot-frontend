import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { forkJoin } from 'rxjs';
import { Task, TaskStats } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatListModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly isAdmin = computed(() => {
    const role = this.user()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  });

  stats = signal<TaskStats | null>(null);
  recentTasks = signal<Task[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  readonly statCards = computed<StatCard[]>(() => {
    const current = this.stats();
    if (!current) return [];
    return [
      {
        label: 'Total Tasks',
        value: current.total,
        icon: 'assignment',
        accent: 'total',
      },
      { label: 'To Do', value: current.todo, icon: 'radio_button_unchecked', accent: 'todo' },
      {
        label: 'In Progress',
        value: current.inProgress,
        icon: 'autorenew',
        accent: 'progress',
      },
      { label: 'Done', value: current.done, icon: 'check_circle', accent: 'done' },
    ];
  });

  /** Shares a single denominator so the bars stay visually comparable. */
  readonly priorityBars = computed(() => {
    const current = this.stats();
    if (!current) return [];
    const rows = [
      { label: 'High', value: current.highPriority, accent: 'high' },
      { label: 'Medium', value: current.mediumPriority, accent: 'medium' },
      { label: 'Low', value: current.lowPriority, accent: 'low' },
    ];
    const max = Math.max(...rows.map((row) => row.value), 1);
    return rows.map((row) => ({
      ...row,
      percent: Math.round((row.value / max) * 100),
    }));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      stats: this.taskService.getStats(),
      recent: this.taskService.getTasks({
        page: 0,
        size: 5,
        sort: 'createdAt',
        direction: 'desc',
      }),
    }).subscribe({
      next: ({ stats, recent }) => {
        this.loading.set(false);
        if (stats.success) this.stats.set(stats.data);
        if (recent.success) this.recentTasks.set(recent.data.content);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'Could not load your dashboard right now.'
        );
      },
    });
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

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }
}
