import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';

export const studentGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  console.log(authService.role.value)
  if(authService.role.value != 'Student') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
