import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { Observable } from 'rxjs';

export const teacherGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if(authService.role.value != 'Teacher') {
    router.navigate(['/']);
    return false;
  }
  
  return true;
};
