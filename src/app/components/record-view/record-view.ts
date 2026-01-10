import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Records } from '../../services/records';
import { StockStatus } from '../../pipes/stock-status-pipe';
import { Header } from '../header/header';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    StockStatus,
    Header,
    RouterLink
  ],
  templateUrl: './record-view.html'
})
export class RecordView implements OnInit {

  record: any;

  constructor(
    private route: ActivatedRoute,
    private rs: Records
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.rs.get(id).subscribe(r => this.record = r);
  }

  stockBadgeClass(quantity: number): string {
    if (quantity === 0) return 'badge bg-danger';
    if (quantity <= 5) return 'badge bg-warning';
    return 'badge bg-success';
  }
}
