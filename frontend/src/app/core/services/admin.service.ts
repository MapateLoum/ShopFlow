import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getStats() { return this.http.get<any>(`${this.api}/admin/stats`); }
  getAllSellers() { return this.http.get<any>(`${this.api}/admin/sellers`); }
  activateSeller(id: string) { return this.http.patch<any>(`${this.api}/admin/sellers/${id}/activate`, {}); }
  suspendSeller(id: string) { return this.http.patch<any>(`${this.api}/admin/sellers/${id}/suspend`, {}); }
}
