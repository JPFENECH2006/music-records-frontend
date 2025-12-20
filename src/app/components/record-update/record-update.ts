import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Records } from '../../services/records';
import { Header } from '../header/header';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, RouterLink],
  templateUrl: './record-update.html'
})
export class RecordUpdate implements OnInit {

  id!: number;
  formats: string[] = [];
  genres: string[] = [];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private rs: Records,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    // ✅ Initialize form AFTER fb exists
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
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.rs.formats().subscribe(f => this.formats = f);
    this.rs.genres().subscribe(g => this.genres = g);

    this.rs.get(this.id).subscribe(r => {
      this.form.patchValue({
        title: r.title,
        artist: r.artist,
        format: r.format,
        genre: r.genre,
        releaseYear: String(r.releaseYear),      // ✅ FIX
        price: String(r.price),                  // ✅ FIX
        stockQuantity: String(r.stockQuantity),  // ✅ FIX
        customerId: r.customer?.customerId,
        firstName: r.customer?.firstName,
        lastName: r.customer?.lastName,
        contactNumber: r.customer?.contactNumber,
        email: r.customer?.email
      });
    });
  }

  submit() {
    if (this.form.invalid) return;

    const v = this.form.value;

    this.rs.update(this.id, {
      title: v.title,
      artist: v.artist,
      format: v.format,
      genre: v.genre,
      releaseYear: Number(v.releaseYear),   // convert back to number
      price: Number(v.price),
      stockQuantity: Number(v.stockQuantity),
      customer: {
        customerId: v.customerId,
        firstName: v.firstName,
        lastName: v.lastName,
        contactNumber: v.contactNumber,
        email: v.email
      }
    }).subscribe(() => this.router.navigate(['/records']));
  }
}
