import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { Observable } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return new Observable<boolean>(obs => {
      authService.checkAdmin().subscribe(
          data => {
            if(!data) {
              router.navigate(['/login']);
            }
            
            obs.next(data)
          }
      );
    });
};
