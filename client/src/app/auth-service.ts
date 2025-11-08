import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { User } from './user-service';

type LoginResponse = {
  message: string;
  user: User;
  token: string;
  token_type: string;
  user_role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private user$ = new BehaviorSubject<User | null>(null);
  private role$ = new BehaviorSubject<string | null>(null);
  // ezt a csrf ready dolgokat érdemes ellenőrizni
  // ilyen login/logout fajta muveletek elott
  // (loginhez muszaj)
  private csrfReady: Observable<boolean>;

  constructor() {
    this.csrfReady = this.http.get('/sanctum/csrf-cookie').pipe(
      map(() => true),
      catchError(err => {
        console.error('csrf cookie fail', err);
        return of(false);
      }),
      shareReplay(1)
    );

    this.checkAuth().subscribe(() => {
      this.http.get<User>('/api/user').pipe(
          tap(resp => {
            this.user$.next(resp);
          }),
          catchError(err => {
            console.error('failed to retrieve user while authenticated: ', err);
            this.user$.next(null);
            return of(false);
          })
        );
    });
  }

  get role() {
    return this.role$;
  }

  get user() {
    return this.user$;
  }

  checkAdmin() {
    return this.csrfReady.pipe(
      switchMap(csrfOk => {
        if (!csrfOk) {
          return of(false);
        }
        return this.http.get('/api/user/isAdmin').pipe(
          map(_ => true),
          catchError(err => {
            console.log("not admin", err);
            return of(false);
          })
        );
      })
    );
  }

  private checkAuth() {
    return this.csrfReady.pipe(
      switchMap(csrfOk => {
        if (!csrfOk) {
          console.error("CSRF ERROR!!!");
          return of(false);
        }
        return this.http.get('/api/checkAuth').pipe(
          map(_ => true),
          catchError(err => {
            console.error('checkAuth failed?', err);
            return of(false);
          })
        );
      })
    );
  }

  tryLogin(email: string, password: string) {
    let form = new FormData();
    form.append('email', email);
    form.append('password', password);

    return this.csrfReady.pipe(
      switchMap(csrfOk => {
        if (!csrfOk) {
          console.error("CSRF ERROR!!!");
          return of(false);
        }
        return this.http.post<LoginResponse>('/api/login', form).pipe(
          tap(resp => {
            this.user$.next(resp.user);
            this.role$.next(resp.user_role);
          }),
          map(_ => true),
          catchError(err => {
            console.error('login error', err);
            this.user$.next(null);
            this.role$.next(null);
            return of(false);
          })
        );
      })
    );
  }

  logout() {
    return this.csrfReady.pipe(
      switchMap(csrfOk => {
        if (!csrfOk) {
          console.error("CSRF ERROR!!!");
          return of(false);
        }
        return this.http.post('/logout', null).pipe(
          tap(() => {
            this.user$.next(null);
          }),
          map(_ => true),
          catchError(err => {
            console.error('logout error?', err);
            return of(false);
          })
        );
      })
    );
  }
}
