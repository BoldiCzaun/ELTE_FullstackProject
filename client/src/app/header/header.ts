import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../auth-service';
import { toSignal } from '@angular/core/rxjs-interop';

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

  login(): void {
    this.authService.tryLogin("test@example.com", "password").subscribe(() => {
      let value = this.authService.user.getValue();
      console.log(value);
      if(value == null) return;

      this.userName.set(value.name);
    });
  }

  logout(): void {
    this.authService.logout().subscribe(()=>{});
  }
}
