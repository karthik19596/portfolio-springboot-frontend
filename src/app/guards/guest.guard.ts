import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/** Keeps signed-in users out of the public landing page. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.refreshAuthState()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
