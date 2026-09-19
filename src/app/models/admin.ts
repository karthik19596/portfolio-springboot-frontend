import { Task } from './task';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface AdminUserUpdateRequest {
  username: string;
  email: string;
  role: AdminUser['role'];
}

export interface AdminUserCreateRequest extends AdminUserUpdateRequest {
  password: string;
}

export interface AdminTask extends Task {
  userId: number;
  username: string;
}
