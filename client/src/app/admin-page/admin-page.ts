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
protected teacherCreationForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  protected creationError = signal('');

  private userService = inject(UserService);
  private refresh$ = new BehaviorSubject<void>(undefined);
  private userList$ = this.refresh$.pipe(switchMap(() => this.userService.getUsers("Teacher")));
  protected users = toSignal(this.userList$);

  protected onSubmit() {
    const email = this.teacherCreationForm.get('email');
    const name = this.teacherCreationForm.get('name');
    const password = this.teacherCreationForm.get('password');

    // todo: error handling
    if(!email || !password) {
      console.log("email or password was null");
      return;
    }
    
    if(email.errors || password.errors) {
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