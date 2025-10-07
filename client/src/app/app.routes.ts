import { Routes } from '@angular/router';
import { AdminPage } from './admin-page/admin-page';
import { LoginPage } from './login-page/login-page';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginPage,
        title: "Bejelentkezés"
    },
    {
        path: 'admin',
        component: AdminPage,
        title: "Adminisztrátor nézet"
    }
];
