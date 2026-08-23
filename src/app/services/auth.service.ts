import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../models/auth';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'portfolio_token';
  private readonly userKey = 'portfolio_user';

  private readonly currentUser = signal<User | null>(this.loadUser());
  readonly user = this.currentUser.asReadonly();

  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiUrl: string
  ) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.saveAuth(response.data);
          }
        })
      );
  }

  signup(request: SignupRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/signup`, request)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.saveAuth(response.data);
          }
        })
      );
  }

  isUsernameAvailable(username: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/auth/check-username`,
      { params: { username } }
    );
  }

  isEmailAvailable(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/auth/check-email`,
      { params: { email } }
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private saveAuth(auth: AuthResponse): void {
    localStorage.setItem(this.tokenKey, auth.token);
    const user: User = { username: auth.username, role: auth.role };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private loadUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.userKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  private hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.tokenKey);
  }
}
