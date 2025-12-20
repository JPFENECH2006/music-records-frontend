import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stockStatus',
  standalone: true
})
export class StockStatus implements PipeTransform {

  transform(quantity: number): string {
    if (quantity > 3) return 'In Stock';
    if (quantity > 0) return 'Low Stock';
    return 'Out of Stock';
  }
}
