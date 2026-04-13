import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getMyStore() {
    return this.http.get<any>(`${this.api}/store/me`);
  }

  updateStore(formData: FormData) {
    return this.http.put<any>(`${this.api}/store/me`, formData);
  }

  getStoreBySlug(slug: string) {
    return this.http.get<any>(`${this.api}/public/stores/${slug}`);
  }

  getAllStores() {
    return this.http.get<any>(`${this.api}/public/stores`);
  }
}
