import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const authService = inject(AuthService);
  const urlTree = router.parseUrl('/login');

  if(!authService.user.getValue()) {
    return new RedirectCommand(urlTree, { skipLocationChange: true });
  }

  return true;
};
