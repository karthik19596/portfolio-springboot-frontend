import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  AdminTask,
  AdminUser,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
} from '../../models/admin';
import { AdminService } from '../../services/admin.service';
import { TaskRequest } from '../../models/task';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly users = signal<AdminUser[]>([]);
  readonly tasks = signal<AdminTask[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly editingUserId = signal<number | null>(null);
  readonly editingUser = signal<AdminUser | null>(null);
  readonly showAddUser = signal(false);
  readonly creatingUser = signal(false);
  readonly addUserError = signal<string | null>(null);
  readonly newUserForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER' as AdminUser['role'], Validators.required],
  });
  readonly showAddTask = signal(false);
  readonly creatingTask = signal(false);
  readonly addTaskError = signal<string | null>(null);
  readonly newTaskForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    assignedUserId: [null as number | null, Validators.required],
    status: ['TODO' as AdminTask['status'], Validators.required],
    priority: ['MEDIUM' as AdminTask['priority'], Validators.required],
  });
  readonly editingTaskId = signal<number | null>(null);
  readonly editingTask = signal<AdminTask | null>(null);

  readonly userColumns = ['username', 'email', 'role', 'status', 'createdAt', 'actions'];
  readonly taskColumns = ['title', 'owner', 'status', 'priority', 'createdAt', 'actions'];

  constructor(
    private readonly adminService: AdminService,
    private readonly snackBar: MatSnackBar,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    let completed = 0;
    const loaded = (): void => {
      completed += 1;
      if (completed === 2) this.loading.set(false);
    };

    this.adminService.getUsers().subscribe({
      next: (response) => {
        if (response.success) this.users.set(response.data);
        else this.error.set(response.message);
        loaded();
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Could not load users.');
        loaded();
      },
    });

    this.adminService.getTasks().subscribe({
      next: (response) => {
        if (response.success) this.tasks.set(response.data.content);
        else this.error.set(response.message);
        loaded();
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Could not load tasks.');
        loaded();
      },
    });
  }

  openAddUser(): void {
    this.newUserForm.reset({ username: '', email: '', password: '', role: 'USER' });
    this.addUserError.set(null);
    this.showAddUser.set(true);
  }

  cancelAddUser(): void {
    this.showAddUser.set(false);
    this.addUserError.set(null);
  }

  createUser(): void {
    this.addUserError.set(null);
    if (this.newUserForm.invalid) {
      this.newUserForm.markAllAsTouched();
      return;
    }

    const value = this.newUserForm.getRawValue();
    const request: AdminUserCreateRequest = {
      username: value.username!,
      email: value.email!,
      password: value.password!,
      role: value.role!,
    };
    this.creatingUser.set(true);
    this.adminService.createUser(request).subscribe({
      next: (response) => {
        this.creatingUser.set(false);
        if (response.success) {
          this.users.update((users) => [response.data, ...users]);
          this.cancelAddUser();
          this.showMessage('User created.');
        } else {
          this.addUserError.set(response.message);
        }
      },
      error: (error) => {
        this.creatingUser.set(false);
        this.addUserError.set(error.error?.message || 'Could not create user.');
      },
    });
  }

  openAddTask(): void {
    this.newTaskForm.reset({
      title: '',
      description: '',
      assignedUserId: null,
      status: 'TODO',
      priority: 'MEDIUM',
    });
    this.addTaskError.set(null);
    this.showAddTask.set(true);
  }

  cancelAddTask(): void {
    this.showAddTask.set(false);
    this.addTaskError.set(null);
  }

  createTask(): void {
    this.addTaskError.set(null);
    if (this.newTaskForm.invalid) {
      this.newTaskForm.markAllAsTouched();
      return;
    }
    const value = this.newTaskForm.getRawValue();
    this.creatingTask.set(true);
    this.adminService.createTask({
      title: value.title!,
      description: value.description ?? '',
      assignedUserId: value.assignedUserId!,
      status: value.status!,
      priority: value.priority!,
    }).subscribe({
      next: (response) => {
        this.creatingTask.set(false);
        if (response.success) {
          this.tasks.update((tasks) => [response.data, ...tasks]);
          this.cancelAddTask();
          this.showMessage('Task assigned.');
        } else {
          this.addTaskError.set(response.message);
        }
      },
      error: (error) => {
        this.creatingTask.set(false);
        this.addTaskError.set(error.error?.message || 'Could not assign task.');
      },
    });
  }

  startEditUser(user: AdminUser): void {
    this.editingUserId.set(user.id);
    this.editingUser.set({ ...user });
  }

  cancelEditUser(): void {
    this.editingUserId.set(null);
    this.editingUser.set(null);
  }

  saveUser(user: AdminUser): void {
    const editedUser = this.editingUser();
    if (!editedUser) return;
    const request: AdminUserUpdateRequest = {
      username: editedUser.username,
      email: editedUser.email,
      role: editedUser.role,
    };

    this.adminService.updateUser(user.id, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.update((users) =>
            users.map((item) => (item.id === user.id ? response.data : item))
          );
          this.showMessage('User updated.');
          this.cancelEditUser();
        }
      },
      error: (error) => this.showMessage(error.error?.message || 'Could not update role.'),
    });
  }

  setEditingRole(role: AdminUser['role']): void {
    this.editingUser.update((user) => (user ? { ...user, role } : user));
  }

  setEditingField(field: 'username' | 'email', value: string): void {
    this.editingUser.update((user) => (user ? { ...user, [field]: value } : user));
  }

  isSuperAdmin(): boolean {
    return this.authService.user()?.role === 'SUPER_ADMIN';
  }

  canManageUser(user: AdminUser): boolean {
    const currentUsername = this.authService.user()?.username;
    if (user.username === currentUsername) return false;
    return this.isSuperAdmin() ||
      (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN');
  }

  deleteUser(user: AdminUser): void {
    if (!window.confirm(`Delete user "${user.username}" and their account?`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.update((users) => users.filter((item) => item.id !== user.id));
          this.showMessage('User deleted.');
        }
      },
      error: (error) => this.showMessage(error.error?.message || 'Could not delete user.'),
    });
  }

  deleteTask(task: AdminTask): void {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    this.adminService.deleteTask(task.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id));
          this.showMessage('Task deleted.');
        }
      },
      error: (error) => this.showMessage(error.error?.message || 'Could not delete task.'),
    });
  }

  updateTask(task: AdminTask, changes: Partial<TaskRequest>): void {
    const request: TaskRequest = {
      title: task.title,
      description: task.description ?? '',
      status: changes.status ?? task.status,
      priority: changes.priority ?? task.priority,
    };
    this.adminService.updateTask(task.id, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.tasks.update((tasks) =>
            tasks.map((item) => (item.id === task.id ? response.data : item))
          );
          this.showMessage('Task updated.');
        }
      },
      error: (error) => this.showMessage(error.error?.message || 'Could not update task.'),
    });
  }

  startEditTask(task: AdminTask): void {
    this.editingTaskId.set(task.id);
    this.editingTask.set({ ...task });
  }

  cancelEditTask(): void {
    this.editingTaskId.set(null);
    this.editingTask.set(null);
  }

  saveTask(task: AdminTask): void {
    const editedTask = this.editingTask();
    if (!editedTask) return;
    const request: TaskRequest = {
      title: editedTask.title,
      description: editedTask.description ?? '',
      status: editedTask.status,
      priority: editedTask.priority,
    };
    this.adminService.updateTask(task.id, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.tasks.update((tasks) =>
            tasks.map((item) => (item.id === task.id ? response.data : item))
          );
          this.showMessage('Task updated.');
          this.cancelEditTask();
        }
      },
      error: (error) => this.showMessage(error.error?.message || 'Could not update task.'),
    });
  }

  setEditingTaskField(field: 'title' | 'description', value: string): void {
    this.editingTask.update((task) => (task ? { ...task, [field]: value } : task));
  }

  setEditingTaskStatus(status: AdminTask['status']): void {
    this.editingTask.update((task) => (task ? { ...task, status } : task));
  }

  setEditingTaskPriority(priority: AdminTask['priority']): void {
    this.editingTask.update((task) => (task ? { ...task, priority } : task));
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3500 });
  }
}
