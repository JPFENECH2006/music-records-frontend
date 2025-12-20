import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class Login {
  email = '';
  password = '';
  error = '';

  constructor(private auth: Auth, private router: Router) {}

  submit() {
    this.error = '';

    const email = this.email.trim();
    const password = this.password.trim();

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.auth.saveSession(res);
        this.router.navigate(['/records']);
      },
      error: (err) => {
        // backend returns { message: 'Invalid email or password.' }
        this.error = err?.error?.message || 'Login failed';
      }
    });
  }
}
