import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class Login implements OnInit {

  email = '';
  password = '';
  error = '';

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/records']);
    }
  }

  submit(): void {
    this.error = '';

    this.auth.login(this.email.trim(), this.password.trim()).subscribe({
      next: (res) => {
        this.auth.saveSession(res);
        this.router.navigate(['/records']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
      }
    });
  }
}
