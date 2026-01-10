import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Records } from '../../services/records';
import { Header } from '../header/header';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, RouterLink],
  templateUrl: './record-update.html'
})
export class RecordUpdate implements OnInit {

  id!: number;
  formats: string[] = [];
  genres: string[] = [];

  // 🌍 SAME country codes as ADD
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
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

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

      // 👇 split phone
      countryCode: ['+356', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]],

      email: ['', [Validators.required, Validators.email]]
    });

    this.rs.formats().subscribe(f => this.formats = f);
    this.rs.genres().subscribe(g => this.genres = g);

    this.rs.get(this.id).subscribe(r => {
      const phone = r.customer?.contactNumber || '';

      // 🧠 split +code from number
      let countryCode = '+356';
      let localNumber = phone;

      if (phone.startsWith('+')) {
        const match = this.countryCodes.find(c => phone.startsWith(c.code));
        if (match) {
          countryCode = match.code;
          localNumber = phone.replace(match.code, '');
        }
      }

      this.form.patchValue({
        title: r.title,
        artist: r.artist,
        format: r.format,
        genre: r.genre,
        releaseYear: String(r.releaseYear),
        price: String(r.price),
        stockQuantity: String(r.stockQuantity),

        customerId: r.customer?.customerId,
        firstName: r.customer?.firstName,
        lastName: r.customer?.lastName,

        countryCode,
        contactNumber: localNumber,

        email: r.customer?.email
      });
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const v = this.form.value;
    const fullContactNumber = `${v.countryCode}${v.contactNumber}`;

    this.rs.update(this.id, {
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
