import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshRequest$: ReturnType<AuthService['refreshToken']> | null = null;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // The login endpoint answers bad credentials with 401; treating that as an
  // expired session would clobber the form's own error handling.
  const isAuthRequest = req.url.includes('/auth/');

  const token = authService.getToken();
  if (token && !req.url.startsWith('http')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 403 means authenticated but not permitted, which is not a reason to
      // end the session.
      if (error.status === 401 && !isAuthRequest && authService.hasRefreshToken()) {
        refreshRequest$ ??= authService.refreshToken().pipe(
          shareReplay(1),
          finalize(() => {
            refreshRequest$ = null;
          })
        );

        return refreshRequest$.pipe(
          switchMap((response) => {
            const refreshedToken = response.data?.token;
            if (!response.success || !refreshedToken) {
              return throwError(() => error);
            }
            return next(
              req.clone({
                setHeaders: {
                  Authorization: `Bearer ${refreshedToken}`,
                },
              })
            );
          }),
          catchError((refreshError) => {
            const returnUrl = router.url;
            authService.clearSession();
            router.navigate(['/login'], {
              queryParams:
                returnUrl &&
                returnUrl !== '/' &&
                !returnUrl.startsWith('/login')
                  ? { returnUrl }
                  : {},
            });
            return throwError(() => refreshError);
          })
        );
      }

      if (error.status === 401 && !isAuthRequest) {
        const returnUrl = router.url;
        authService.clearSession();
        router.navigate(['/login'], {
          queryParams:
            returnUrl && returnUrl !== '/' && !returnUrl.startsWith('/login')
              ? { returnUrl }
              : {},
        });
      }
      return throwError(() => error);
    })
  );
};
