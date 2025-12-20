import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (route.data?.['roles'].includes(auth.role())) {
    return true;
  }

  router.navigate(['/records']);
  return false;
};
