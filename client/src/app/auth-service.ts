import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

type User = {
  id: number;
  name: string;
  email: string;
}

type LoginResponse = {
  message: string;
  user: User;
  token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authToken: string | null = null;


  constructor(
    private http: HttpClient
  ) {}

  tryLogin() {

  }

  isAuthenticated() {
    return this.authToken != null;
  }
}
