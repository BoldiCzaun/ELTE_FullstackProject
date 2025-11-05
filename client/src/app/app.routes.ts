import { Routes } from '@angular/router';
import { AdminPage } from './admin-page/admin-page';
import { LoginPage } from './login-page/login-page';
import { authGuard } from './auth-guard';
import { MainPage } from './main-page/main-page';
import { adminGuard } from './admin-guard';
import {RegisterPage} from './register-page/register-page';

export const routes: Routes = [
    {
        path: '',
        component: MainPage,
        title: "Főoldal",
        canActivate: [authGuard]
    },
    {
        path: 'login',
        component: LoginPage,
        title: "Bejelentkezés"
    },
    {
      path: 'register',
      component: RegisterPage,
      title: "Regisztráció"
    },
    {
        path: 'admin',
        component: AdminPage,
        title: "Adminisztrátor nézet",
        canActivate: [authGuard, adminGuard]
    }
];
