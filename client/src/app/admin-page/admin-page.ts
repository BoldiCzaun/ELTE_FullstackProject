import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../user-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-admin-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPage {
  protected emailError = signal('');
  protected nameError = signal('');
  protected passwordError = signal('');
  protected creationError = signal('');

  protected teacherCreationForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  private userService = inject(UserService);
  private refresh$ = new BehaviorSubject<void>(undefined);
  private userList$ = this.refresh$.pipe(switchMap(() => this.userService.getUsers("Teacher")));
  protected users = toSignal(this.userList$);

  protected delete(id: number) {
    this.userService.delete(id).subscribe(success => {
        if(success) {
          this.refresh$.next();
          return;
        }

        this.creationError.set("Hiba fiók törléskor!");
      });
  }

  protected onSubmit() {
    this.creationError.set('');
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');

    const email = this.teacherCreationForm.get('email');
    const name = this.teacherCreationForm.get('name');
    const password = this.teacherCreationForm.get('password');

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
          this.refresh$.next();
          return;
        }

        this.creationError.set("Hiba fiók készitéskor!");
      });
    }
  }
}