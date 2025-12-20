import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class Auth {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.api}/login`, { email, password });
  }

  // backend roles -> assignment roles
  mapRole(backendRole: string): string {
    if (backendRole === 'clerk') return 'Salesperson';
    if (backendRole === 'manager') return 'StoreManager';
    if (backendRole === 'admin') return 'SystemAdmin';
    return backendRole;
  }

  saveSession(res: any) {
    localStorage.setItem('role', this.mapRole(res.role));
    localStorage.setItem('email', res.email ?? '');
    localStorage.setItem('name', res.name ?? '');
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('role');
  }

  role(): string {
    return localStorage.getItem('role') || '';
  }
}
