import {Component, EventEmitter, inject, Output, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from '../user-service';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '../auth-service';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register-page',
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage {
  @Output() onRegister: EventEmitter<any> = new EventEmitter();

  protected authService = inject(AuthService);
  protected user = toSignal(this.authService.user);

  public emailError = signal('');
  public nameError = signal('');
  public passwordError = signal('');
  public creationError = signal('');

  protected userCreationForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  private userService = inject(UserService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  protected onSubmit() {
    this.creationError.set('');
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');

    const email = this.userCreationForm.get('email');
    const name = this.userCreationForm.get('name');
    const password = this.userCreationForm.get('password');

    if(!email || !password || !name) {
      console.log("email or password was null");
      return;
    }

    this.nameError.set(name.errors ? "Üres név!": "");
    this.emailError.set(email.errors ? "Nem valid email!": "");
    this.passwordError.set(password.errors ? "Ures jelszo!" : "");

    if(email.errors || password.errors || name.errors) {
      return;
    }

    const emailValue = email?.value;
    const nameValue = name?.value;
    const passwordValue  = password?.value;

    if(emailValue && nameValue && passwordValue) {
      this.userService.store(
        emailValue,
        nameValue,
        passwordValue,
        'Teacher'
      ).subscribe(success => {
        if(success) {
          this.onRegister.emit();
          return;
        }

        this.creationError.set("Hiba fiók készitéskor!");
      });
    }
  }
}
