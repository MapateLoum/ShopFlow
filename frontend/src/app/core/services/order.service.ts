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

  confirmPayment(id: string) {
    return this.http.patch<any>(`${this.api}/orders/${id}/confirm-payment`, {});
  }

  rejectPayment(id: string) {
    return this.http.patch<any>(`${this.api}/orders/${id}/reject-payment`, {});
  }

  trackOrder(id: string) {
    return this.http.get<any>(`${this.api}/orders/${id}/track`);
  }

  requestOrderHistory(email: string) {
    return this.http.post<any>(`${this.api}/orders/request-history`, { email });
  }

  getOrderHistory(token: string) {
    return this.http.get<any>(`${this.api}/orders/history`, { params: { token } });
  }
}