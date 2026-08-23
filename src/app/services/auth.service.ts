import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  UserProfile,
} from '../models/auth';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'portfolio_token';
  private readonly userKey = 'portfolio_user';

  private readonly currentUser = signal<User | null>(this.loadUser());
  readonly user = this.currentUser.asReadonly();

  private readonly authenticated = signal<boolean>(this.hasValidToken());
  readonly isAuthenticated = this.authenticated.asReadonly();

  private readonly currentProfile = signal<UserProfile | null>(null);
  readonly profile = this.currentProfile.asReadonly();

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

  loadProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http
      .get<ApiResponse<UserProfile>>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.currentProfile.set(response.data);
          }
        })
      );
  }

  /**
   * Asks the API to revoke the token, then drops it locally. The request is
   * fire-and-forget: the local session must end even if the call fails, and
   * the token is worthless to us either way.
   */
  signOut(): void {
    if (this.getToken()) {
      this.http
        .post<ApiResponse<void>>(`${this.apiUrl}/auth/logout`, {})
        .subscribe({ error: () => undefined });
    }
    this.clearSession();
  }

  /** Drops local session state without contacting the API. */
  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUser.set(null);
    this.currentProfile.set(null);
    this.authenticated.set(false);
  }

  /** Epoch milliseconds at which the stored token stops being accepted. */
  getExpiresAt(): number | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;
    const payload = this.decodeTokenPayload(token);
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(this.tokenKey);
    if (!token || this.isTokenExpired(token)) return null;
    return token;
  }

  /**
   * Re-checks the stored token against its `exp` claim and clears the session
   * if it has lapsed. Route guards run outside Angular's reactive graph, so the
   * signals need an explicit sync point rather than reacting on their own.
   */
  refreshAuthState(): boolean {
    const valid = this.hasValidToken();
    if (!valid && this.authenticated()) {
      this.clearSession();
    }
    return valid;
  }

  private saveAuth(auth: AuthResponse): void {
    localStorage.setItem(this.tokenKey, auth.token);
    const user: User = { username: auth.username, role: auth.role };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
    this.authenticated.set(true);
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

  private hasValidToken(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(this.tokenKey);
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeTokenPayload(token);
    // An unreadable token is worthless to the API, so treat it as expired.
    if (!payload || typeof payload.exp !== 'number') return true;
    return payload.exp * 1000 <= Date.now();
  }

  private decodeTokenPayload(token: string): { exp?: number } | null {
    const segments = token.split('.');
    if (segments.length !== 3) return null;

    try {
      const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );
      const binary = atob(padded);
      const json = decodeURIComponent(
        Array.from(binary, (char) =>
          '%' + char.charCodeAt(0).toString(16).padStart(2, '0')
        ).join('')
      );
      return JSON.parse(json) as { exp?: number };
    } catch {
      return null;
    }
  }
}
