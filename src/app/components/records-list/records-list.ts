import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Header } from '../header/header';
import { Records } from '../../services/records';
import { Auth } from '../../services/auth';

// Excel + PDF export libs
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.rs.getAll().subscribe(r => this.records = r);
  }

  remove(id: number): void {
    if (confirm('Delete record?')) {
      this.rs.delete(id).subscribe(() => this.loadRecords());
    }
  }

  // =============================
  // STOCK LOGIC (MATCHES BRIEF)
  // =============================

  stockBadgeClass(quantity: number): string {
    if (quantity === 0) return 'badge bg-danger';   // Out of Stock
    if (quantity <= 3) return 'badge bg-warning';   // Low Stock
    return 'badge bg-success';                      // In Stock
  }

  stockLabel(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 3) return 'Low Stock';
    return 'In Stock';
  }

  // =============================
  // EXPORT EXCEL
  // =============================

  exportExcel(): void {
    if (!this.records.length) return;

    const rows = this.records.map(r => ([
      r.id,
      r.customer?.customerId || '',
      r.customer?.lastName || '',
      r.format,
      r.genre,
      this.stockLabel(r.stockQuantity)   // ✅ FIXED
    ]));

    const data = [
      ['ID', 'Customer ID', 'Customer Last Name', 'Format', 'Genre', 'Stock'],
      ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 22 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 }
    ];

    for (let c = 0; c < 6; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([out], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      `records-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  // =============================
  // EXPORT PDF
  // =============================

  exportPdf(): void {
    if (!this.records.length) return;

    const doc = new jsPDF({ orientation: 'landscape' });

    const head = [['ID', 'Customer ID', 'Last Name', 'Format', 'Genre', 'Stock']];

    const body = this.records.map(r => ([
      r.id,
      r.customer?.customerId || '',
      r.customer?.lastName || '',
      r.format,
      r.genre,
      this.stockLabel(r.stockQuantity)   // ✅ FIXED
    ]));

    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 10 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const label = data.cell.text[0];
          if (label === 'Out of Stock') data.cell.styles.fillColor = [220, 38, 38];
          if (label === 'Low Stock') data.cell.styles.fillColor = [245, 158, 11];
          if (label === 'In Stock') data.cell.styles.fillColor = [22, 163, 74];
        }
      }
    });

    doc.save(`records-${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
