import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private loggedIn = false;
  private userRole: 'Salesperson' | 'StoreManager' | 'SystemAdmin' | null = null;

  // Called after successful login
  login(role: 'Salesperson' | 'StoreManager' | 'SystemAdmin'): void {
    this.loggedIn = true;
    this.userRole = role;
  }

  logout(): void {
    this.loggedIn = false;
    this.userRole = null;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  role(): string {
    return this.userRole ?? '';
  }
}
