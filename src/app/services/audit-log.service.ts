import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { AuditLog } from '../models/audit-log';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiUrl: string
  ) {}

  getAuditLogs(): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.apiUrl}/admin/audit-logs`);
  }
}
