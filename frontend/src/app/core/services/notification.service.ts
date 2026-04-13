import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<any>(`${this.api}/notifications`); }
  markRead(id: string) { return this.http.patch<any>(`${this.api}/notifications/${id}/read`, {}); }
  markAllRead() { return this.http.patch<any>(`${this.api}/notifications/read-all`, {}); }
}
