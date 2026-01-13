import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

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

  // UI STATE
  showDeleteModal = false;
  selectedRecordId: number | null = null;
  successMessage = '';

  constructor(
    public rs: Records,
    public auth: Auth,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRecords();

    this.route.queryParams.subscribe(p => {
      if (p['status'] === 'added') {
        this.successMessage = 'New record added successfully.';
      }
      if (p['status'] === 'updated') {
        this.successMessage = 'Record updated successfully.';
      }
    });
  }

  loadRecords(): void {
    this.rs.getAll().subscribe(r => this.records = r);
  }

  // =============================
  // DELETE FLOW (GUI CONFIRM)
  // =============================

  askDelete(id: number): void {
    this.selectedRecordId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedRecordId = null;
  }

  confirmDelete(): void {
    if (!this.selectedRecordId) return;

    this.rs.delete(this.selectedRecordId).subscribe(() => {
      this.successMessage = 'Record deleted successfully.';
      this.showDeleteModal = false;
      this.selectedRecordId = null;
      this.loadRecords();
    });
  }

  // =============================
  // STOCK LABEL
  // =============================

  stockLabel(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 3) return 'Low Stock';
    return 'In Stock';
  }

  // =============================
  // GENRE COLOUR MAPPING
  // =============================

  getGenreColorHex(genre: string): string {
    switch (genre) {
      case 'Rock': return 'FFD1E8';
      case 'Reggae': return 'C7F0BD';
      case 'Alternative': return 'D6E4FF';
      default: return 'FFFFFF';
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

    for (let c = 0; c < 6; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        };
      }
    }

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
