import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

export type User = {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  store(email: string, name: string, password: string, role: string) {
    let formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("role", role);
    return this.http.post("/api/user", formData).pipe(
      map(_ => true),
      catchError(err => {
        console.log("user creation failed", err);
        return of(false);
      })
    );
  }

  getUsers(role: string | null) {
    let url = "/api/users";
    if(role) {
      url += "?role=" + role;
    }

    return this.http.get<User[]>(url).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.log("/api/users failed", err);
        return of(null);
      })
    );
  }
}
