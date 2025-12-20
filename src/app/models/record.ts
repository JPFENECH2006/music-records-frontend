import { Customer } from './customer';

export interface Record {
  id?: number;
  title: string;
  artist: string;
  format: string;
  genre: string;
  releaseYear: number;
  price: number;
  stockQuantity: number;
  customer?: Customer;
}
