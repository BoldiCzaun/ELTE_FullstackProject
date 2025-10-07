import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  private router = inject(Router);
  private authServive = inject(AuthService);
  
  protected loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  protected emailError = signal('');
  protected passwordError = signal('');
  protected loginError = signal('');

  protected onSubmit() {
    this.loginError.set("");

    const email = this.loginForm.get('email');
    const password = this.loginForm.get('password');

    if(!email || !password) {
      console.log("email or password was null");
      return;
    }

    // lehetne megnezni hogy ures vagy nem valid email
    // de technically ures se valid email
    this.emailError.set(email.errors ? "Nem valid email!": "");
    this.passwordError.set(password.errors ? "Ures jelszo!" : "");

    if(email.errors || password.errors) {
      return;
    }

    const emailValue = email?.value;
    const passwordValue  = password?.value;

    if(emailValue && passwordValue) {
      this.authServive.tryLogin(
        emailValue, 
        passwordValue
      ).subscribe(success => {
        if(success) {
          this.router.navigate(['/']);
          return;
        }

        this.loginError.set("Helytelen email vagy jelszo!");
      });
    }
  }
}
