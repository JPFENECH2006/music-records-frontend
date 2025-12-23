import { Header } from '../header/header';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  ngOnInit() {
    this.rs.getAll().subscribe(r => this.records = r);
  }

  // Keep if you still use it somewhere, but we won't color rows in UI anymore
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

  // ========= EXPORT HELPERS (Genre color coding) =========

  private genreColorHex(genre: string): string {
    // choose stable colors for exports
    const map: Record<string, string> = {
      Rock: '#DCEBFF',
      Pop: '#FFE2EC',
      Jazz: '#E7FFEA',
      Metal: '#E9E9E9',
      Classical: '#FFF4D6',
      HipHop: '#EAE0FF',
      Electronic: '#DFF7FF'
    };

    return map[genre] || '#F3F4F6';
  }

  // Excel needs ARGB: "FFRRGGBB"
  private hexToARGB(hex: string): string {
    const clean = hex.replace('#', '');
    return ('FF' + clean).toUpperCase();
  }

  // PDF needs RGB array [r,g,b]
  private hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return [r, g, b];
  }

  exportExcel() {
    if (!this.records?.length) return;

    const rows = (this.records || []).map((r: any) => ([
      r.id,
      r.customer?.customerId || '',
      r.customer?.lastName || '',
      r.format,
      r.genre
    ]));

    const data = [
      ['ID', 'Customer ID', 'Customer Last Name', 'Format', 'Genre'],
      ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 22 },
      { wch: 12 },
      { wch: 14 }
    ];

    // header style
    for (let c = 0; c < 5; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { bold: true, color: { rgb: 'FF0F172A' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'FFF1F5F9' } },
        alignment: { vertical: 'center', horizontal: 'center' }
      };
    }

    // body style with genre row fill
    for (let i = 0; i < rows.length; i++) {
      const genre = rows[i][4] as string;
      const fillRgb = this.hexToARGB(this.genreColorHex(genre));
      const rIndex = i + 1; // +1 because row 0 is header

      for (let c = 0; c < 5; c++) {
        const addr = XLSX.utils.encode_cell({ r: rIndex, c });
        if (!ws[addr]) continue;

        ws[addr].s = {
          fill: { patternType: 'solid', fgColor: { rgb: fillRgb } },
          alignment: { vertical: 'center', horizontal: c === 0 ? 'center' : 'left' }
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, `records-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  exportPdf() {
    if (!this.records?.length) return;

    const doc = new jsPDF({ orientation: 'landscape' });

    const head = [['ID', 'Customer ID', 'Customer Last Name', 'Format', 'Genre']];

    const body = (this.records || []).map((r: any) => ([
      r.id,
      r.customer?.customerId || '',
      r.customer?.lastName || '',
      r.format,
      r.genre
    ]));

    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const row = data.row.index;
          const genre = body[row][4] as string;
          const [r, g, b] = this.hexToRgb(this.genreColorHex(genre));
          data.cell.styles.fillColor = [r, g, b];
        }
      }
    });

    doc.save(`records-${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
