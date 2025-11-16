import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../auth-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  protected authService = inject(AuthService);
  protected userName = signal("");
  protected user = toSignal(this.authService.user);
  protected role = toSignal(this.authService.role);
  private router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe(()=>this.router.navigate(['/login']));
  }

  toAdmin() {
    this.router.navigate(['/admin']);
  }

  toCreateCourses() {
    this.router.navigate(['/courses/new']);
  }

  toPickCourses() {
    this.router.navigate(['/courses']);
  }
}
