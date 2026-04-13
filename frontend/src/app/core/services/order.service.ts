import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  createOrder(data: any) {
    return this.http.post<any>(`${this.api}/orders`, data);
  }

  getMyOrders() {
    return this.http.get<any>(`${this.api}/orders`);
  }

  getStats() {
    return this.http.get<any>(`${this.api}/orders/stats`);
  }

  updateStatus(id: string, status: string) {
    return this.http.patch<any>(`${this.api}/orders/${id}/status`, { status });
  }
}
