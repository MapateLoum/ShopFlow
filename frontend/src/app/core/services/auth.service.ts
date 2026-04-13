import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  currentUser = signal<any>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  private getUserFromStorage() {
    try { return JSON.parse(localStorage.getItem('shopflow_user') || 'null'); }
    catch { return null; }
  }

  getToken(): string | null {
    return localStorage.getItem('shopflow_token');
  }

  getRole(): string | null {
    return this.currentUser()?.role || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ── Seller Auth ──────────────────────────────────────────────────────────────
  register(data: any) {
    return this.http.post(`${this.api}/auth/seller/register`, data);
  }

  verifyOtp(data: { sellerId: string; otp: string }) {
    return this.http.post(`${this.api}/auth/seller/verify-otp`, data);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.api}/auth/seller/login`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('shopflow_token', res.token);
          const user = { ...res.seller, role: 'SELLER' };
          localStorage.setItem('shopflow_user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.api}/auth/seller/forgot-password`, { email });
  }

  verifyResetOtp(data: { sellerId: string; otp: string }) {
    return this.http.post(`${this.api}/auth/seller/verify-reset-otp`, data);
  }

  resetPassword(data: { resetToken: string; newPassword: string }) {
    return this.http.post(`${this.api}/auth/seller/reset-password`, data);
  }

  // ── Admin Auth ───────────────────────────────────────────────────────────────
  adminLogin(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.api}/auth/admin/login`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('shopflow_token', res.token);
          const user = { ...res.admin, role: 'SUPER_ADMIN' };
          localStorage.setItem('shopflow_user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('shopflow_token');
    localStorage.removeItem('shopflow_user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
