import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again later.';

      if (error.error instanceof ProgressEvent) {
        message = 'Network error. Please check your connection or make sure the backend is running.';
      } else if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 0) {
        message = 'Unable to reach the server. Is the backend running?';
      } else if (error.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status === 409) {
        message = 'This action conflicts with existing data.';
      } else if (error.status >= 500) {
        message = 'A server error occurred. Please try again later.';
      }

      // Avoid duplicate snackbars for 401; the JWT interceptor already
      // handles session expiration and redirects to login.
      if (error.status !== 401) {
        snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      }

      return throwError(() => error);
    })
  );
};
