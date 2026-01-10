import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Records } from '../../services/records';
import { Header } from '../header/header';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, RouterLink],
  templateUrl: './record-add.html'
})
export class RecordAdd implements OnInit {

  formats: string[] = [];
  genres: string[] = [];

  // 🌍 Country codes (extend anytime)
  countryCodes = [
    { code: '+356', label: 'Malta (+356)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+39', label: 'Italy (+39)' },
    { code: '+49', label: 'Germany (+49)' }
  ];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private rs: Records,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      format: ['', Validators.required],
      genre: ['', Validators.required],
      releaseYear: ['', Validators.required],
      price: ['', Validators.required],
      stockQuantity: ['', Validators.required],

      customerId: ['', [Validators.required, Validators.pattern(/^[0-9]+[A-Za-z]$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],

      // 👇 NEW
      countryCode: ['+356', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]],

      email: ['', [Validators.required, Validators.email]]
    });

    this.rs.formats().subscribe(f => this.formats = f);
    this.rs.genres().subscribe(g => this.genres = g);
  }

  submit(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    // 🔗 Combine country code + number
    const fullContactNumber = `${v.countryCode}${v.contactNumber}`;

    this.rs.add({
      title: v.title,
      artist: v.artist,
      format: v.format,
      genre: v.genre,
      releaseYear: Number(v.releaseYear),
      price: Number(v.price),
      stockQuantity: Number(v.stockQuantity),
      customer: {
        customerId: v.customerId,
        firstName: v.firstName,
        lastName: v.lastName,
        contactNumber: fullContactNumber,
        email: v.email
      }
    }).subscribe(() => this.router.navigate(['/records']));
  }
}
