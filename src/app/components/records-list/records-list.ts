import { Header } from '../header/header';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Records } from '../../services/records';
import { Auth } from '../../services/auth';

@Component({
  standalone: true,
  imports: [
    CommonModule,   
    RouterLink,
    Header  
  ],
  templateUrl: './records-list.html'
})
export class RecordsList implements OnInit {

  records: any[] = [];

  constructor(
    public rs: Records,
    public auth: Auth
  ) {}

  ngOnInit() {
    this.rs.getAll().subscribe(r => this.records = r);
  }

  color(genre: string) {
    return genre === 'Rock' ? '#ffe6e6'
         : genre === 'Pop'  ? '#e6f0ff'
         : genre === 'Jazz' ? '#e6ffe6'
         : '#ffffff';
  }

  remove(id: number) {
    if (confirm('Delete record?')) {
      this.rs.delete(id).subscribe(() => this.ngOnInit());
    }
  }
}
