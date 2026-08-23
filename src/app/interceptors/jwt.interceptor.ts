import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
      if (error.status === 401 && !isAuthRequest) {
        const returnUrl = router.url;
        // clearSession, not signOut: the token was just rejected, so calling
        // the revoke endpoint would only produce another 401.
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
