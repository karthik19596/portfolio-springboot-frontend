import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly user = this.authService.user;

  readonly features: Feature[] = [
    {
      icon: 'lock',
      title: 'JWT Authentication',
      description:
        'Stateless login backed by Spring Security, with BCrypt-hashed passwords and token expiry handling.',
    },
    {
      icon: 'task_alt',
      title: 'Task Management',
      description:
        'Create, edit, and delete tasks with status and priority, scoped so you only ever see your own.',
    },
    {
      icon: 'admin_panel_settings',
      title: 'Role-Based Access',
      description:
        'USER and ADMIN roles enforced on both the API and the router, not just hidden in the UI.',
    },
    {
      icon: 'insights',
      title: 'Dashboard Insights',
      description:
        'Live counts by status and priority with a completion rate, served from a dedicated stats endpoint.',
    },
    {
      icon: 'history',
      title: 'Audit Trail',
      description:
        'Every create, update, and delete is recorded to MongoDB and reviewable by administrators.',
    },
    {
      icon: 'sort',
      title: 'Paging & Sorting',
      description:
        'Server-side pagination and sorting so the task list stays fast as the data grows.',
    },
  ];

  readonly techStack: string[] = [
    'Java 17',
    'Spring Boot 3.3',
    'Spring Security',
    'JWT',
    'JPA / Hibernate',
    'MySQL',
    'MongoDB',
    'Angular 22',
    'Angular Material',
    'Docker',
  ];
}
