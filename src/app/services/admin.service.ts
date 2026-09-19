import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import {
  AdminTask,
  AdminUser,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
} from '../models/admin';
import { TaskPage, TaskRequest } from '../models/task';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiUrl: string
  ) {}

  getUsers(): Observable<ApiResponse<AdminUser[]>> {
    return this.http.get<ApiResponse<AdminUser[]>>(`${this.apiUrl}/admin/users`);
  }

  getPendingUsers(): Observable<ApiResponse<AdminUser[]>> {
    return this.http.get<ApiResponse<AdminUser[]>>(`${this.apiUrl}/admin/users/pending`);
  }

  approveUser(id: number): Observable<ApiResponse<AdminUser>> {
    return this.http.post<ApiResponse<AdminUser>>(`${this.apiUrl}/admin/users/${id}/approve`, {});
  }

  rejectUser(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/admin/users/${id}/reject`, {});
  }

  createUser(
    request: AdminUserCreateRequest
  ): Observable<ApiResponse<AdminUser>> {
    return this.http.post<ApiResponse<AdminUser>>(
      `${this.apiUrl}/admin/users`,
      request
    );
  }

  updateRole(id: number, role: AdminUser['role']): Observable<ApiResponse<AdminUser>> {
    return this.http.patch<ApiResponse<AdminUser>>(
      `${this.apiUrl}/admin/users/${id}/role`,
      { role }
    );
  }

  updateUser(
    id: number,
    request: AdminUserUpdateRequest
  ): Observable<ApiResponse<AdminUser>> {
    return this.http.put<ApiResponse<AdminUser>>(
      `${this.apiUrl}/admin/users/${id}`,
      request
    );
  }

  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/admin/users/${id}`);
  }

  getTasks(): Observable<ApiResponse<TaskPage<AdminTask>>> {
    const params = new HttpParams().set('size', '100').set('sort', 'createdAt,desc');
    return this.http.get<ApiResponse<TaskPage<AdminTask>>>(
      `${this.apiUrl}/admin/tasks`,
      { params }
    );
  }

  createTask(request: TaskRequest): Observable<ApiResponse<AdminTask>> {
    return this.http.post<ApiResponse<AdminTask>>(
      `${this.apiUrl}/admin/tasks`,
      request
    );
  }

  updateTask(id: number, request: TaskRequest): Observable<ApiResponse<AdminTask>> {
    return this.http.put<ApiResponse<AdminTask>>(
      `${this.apiUrl}/admin/tasks/${id}`,
      request
    );
  }

  deleteTask(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/admin/tasks/${id}`);
  }
}
