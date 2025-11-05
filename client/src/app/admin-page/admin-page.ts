import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../user-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import {AuthService} from '../auth-service';
import {RegisterPage} from '../register-page/register-page';

@Component({
  selector: 'app-admin-page',
  imports: [ReactiveFormsModule, RegisterPage],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPage {
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
}
