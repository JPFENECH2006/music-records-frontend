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
  // STOCK LABEL (BRIEF COMPLIANT)
  // =============================

  stockLabel(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 3) return 'Low Stock';
    return 'In Stock';
  }

  // =============================
  // GENRE → COLOUR MAPPING
  // =============================

  getGenreColorHex(genre: string): string {
    switch (genre) {
      case 'Rock': return 'FFD1E8';        // pink
      case 'Reggae': return 'C7F0BD';      // green
      case 'Alternative': return 'D6E4FF'; // blue
      default: return 'FFFFFF';            // white
    }
  }

  getGenreColorRGB(genre: string): [number, number, number] {
    switch (genre) {
      case 'Rock': return [255, 209, 232];
      case 'Reggae': return [199, 240, 189];
      case 'Alternative': return [214, 228, 255];
      default: return [255, 255, 255];
    }
  }

  // =============================
  // EXPORT EXCEL (GENRE COLOURED)
  // =============================

  exportExcel(): void {
    if (!this.records.length) return;

    const rows = this.records.map(r => ([
      r.id,
      r.customer?.customerId || '',
      r.customer?.lastName || '',
      r.format,
      r.genre,
      this.stockLabel(r.stockQuantity)
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

    // Header styling
    for (let c = 0; c < 6; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // Genre-based row colouring
    for (let r = 1; r < data.length; r++) {
      const genre = data[r][4] as string;

      for (let c = 0; c < 6; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (ws[addr]) {
          ws[addr].s = {
            ...ws[addr].s,
            fill: {
              patternType: 'solid',
              fgColor: { rgb: this.getGenreColorHex(genre) }
            }
          };
        }
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
  // EXPORT PDF (GENRE COLOURED)
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
      this.stockLabel(r.stockQuantity)
    ]));

    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 10 },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const row = data.row.raw as any[];
          const genre = row[4] as string;
          data.cell.styles.fillColor = this.getGenreColorRGB(genre);
        }
      }
    });

    doc.save(`records-${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
