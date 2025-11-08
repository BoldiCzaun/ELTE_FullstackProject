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
  private userService = inject(UserService);
  private refresh$ = new BehaviorSubject<void>(undefined);
  private userList$ = this.refresh$.pipe(switchMap(() => this.userService.getUsers("Teacher")));
  protected users = toSignal(this.userList$);

  protected onRegister() {
    this.refresh$.next();
  }

  protected delete(id: number) {
    this.userService.delete(id).subscribe(success => {
        if(success) {
          this.refresh$.next();
          return;
        }
      });
  }
}
