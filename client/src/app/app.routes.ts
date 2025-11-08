import { Routes } from '@angular/router';
import { AdminPage } from './admin-page/admin-page';
import { LoginPage } from './login-page/login-page';
import { authGuard } from './auth-guard';
import { MainPage } from './main-page/main-page';
import { adminGuard } from './admin-guard';
import {RegisterPage} from './register-page/register-page';
import { CoursePage } from './course-page/course-page';
import { teacherGuard } from './teacher-guard';
import { CreateCoursePage } from './create-course-page/create-course-page';

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
        path: 'courses/new',
        component: CreateCoursePage,
        title: "Tárgy készités",
        canActivate: [authGuard, teacherGuard]
    },
    {
        path: 'course/:id',
        component: CoursePage,
        title: "Tárgy nézet",
        canActivate: [authGuard, teacherGuard]
    },
    {
        path: 'admin',
        component: AdminPage,
        title: "Adminisztrátor nézet",
        canActivate: [authGuard, adminGuard]
    }
];
