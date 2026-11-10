import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Lets the page open only for signed-in users; others go to /login and come back afterwards.
 * This is a convenience for the user, not the security: the database itself refuses
 * admin data to anyone who is not staff (checked on the server, see AdminService).
 */
export const signedInGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).isSignedIn()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
