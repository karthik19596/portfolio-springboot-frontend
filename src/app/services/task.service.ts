import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Task, TaskPage, TaskRequest } from '../models/task';
import { API_BASE_URL } from './api-config';

export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiUrl: string
  ) {}

  getTasks(params: PageableParams = {}): Observable<ApiResponse<TaskPage>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set(
        'sort',
        `${params.sort},${params.direction ?? 'desc'}`
      );
    }

    return this.http.get<ApiResponse<TaskPage>>(`${this.apiUrl}/tasks`, {
      params: httpParams,
    });
  }

  getTask(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}`);
  }

  createTask(request: TaskRequest): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/tasks`, request);
  }

  updateTask(id: number, request: TaskRequest): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}`, request);
  }

  deleteTask(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/tasks/${id}`);
  }
}
