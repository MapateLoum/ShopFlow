import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getMyProducts() {
    return this.http.get<any>(`${this.api}/products`);
  }

  createProduct(formData: FormData) {
    return this.http.post<any>(`${this.api}/products`, formData);
  }

  updateProduct(id: string, formData: FormData) {
    return this.http.put<any>(`${this.api}/products/${id}`, formData);
  }

  deleteProduct(id: string) {
    return this.http.delete<any>(`${this.api}/products/${id}`);
  }
}
