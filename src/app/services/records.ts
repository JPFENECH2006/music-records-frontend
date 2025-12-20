import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Record } from '../models/record';

@Injectable({ providedIn: 'root' })
export class Records {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ---- Mapping: backend -> frontend model ----
  private toFrontend(b: any): Record {
    return {
      id: b.id,
      title: b.title,
      artist: b.artist,
      format: b.format,
      genre: b.genre,
      releaseYear: b.releaseYear,
      price: b.price,
      stockQuantity: b.stockQty, // backend uses stockQty
      customer: {
        customerId: b.customerId || '',
        firstName: b.customerFirstName || '',
        lastName: b.customerLastName || '',
        contactNumber: b.customerContact || '',
        email: b.customerEmail || ''
      }
    };
  }

  // ---- Mapping: frontend -> backend ----
  private toBackend(r: Record): any {
    return {
      id: r.id,
      title: r.title,
      artist: r.artist,
      format: r.format,
      genre: r.genre,
      releaseYear: r.releaseYear,
      price: r.price,
      stockQty: r.stockQuantity,
      customerId: r.customer?.customerId || '',
      customerFirstName: r.customer?.firstName || '',
      customerLastName: r.customer?.lastName || '',
      customerContact: r.customer?.contactNumber || '',
      customerEmail: r.customer?.email || ''
    };
  }

  // ---- CRUD ----
  getAll(): Observable<Record[]> {
    return this.http.get<any[]>(`${this.api}/records`)
      .pipe(map(arr => arr.map(x => this.toFrontend(x))));
  }

  get(id: number): Observable<Record> {
    return this.http.get<any>(`${this.api}/records/${id}`)
      .pipe(map(x => this.toFrontend(x)));
  }

  add(record: Record): Observable<Record> {
    return this.http.post<any>(`${this.api}/records`, this.toBackend(record))
      .pipe(map(x => this.toFrontend(x)));
  }

  update(id: number, record: Record): Observable<Record> {
    return this.http.put<any>(`${this.api}/records/${id}`, this.toBackend(record))
      .pipe(map(x => this.toFrontend(x)));
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/records/${id}`);
  }

  // ---- Lookups ----
  formats() {
    return this.http.get<string[]>(`${this.api}/formats`);
  }

  genres() {
    return this.http.get<string[]>(`${this.api}/genres`);
  }
}
