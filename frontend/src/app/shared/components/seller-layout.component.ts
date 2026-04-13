import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
  <div class="layout" [class.sidebar-open]="sidebarOpen()">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-logo">SF</div>
          <span>ShopFlow</span>
        </div>
        <button class="close-btn hide-desktop" (click)="sidebarOpen.set(false)">✕</button>
      </div>

      <div class="seller-info">
        <div class="avatar">{{userName().charAt(0).toUpperCase()}}</div>
        <div>
          <strong>{{userName()}}</strong>
          <small>Vendeur</small>
        </div>
      </div>

      <nav class="nav">
        <a *ngFor="let item of navItems" [routerLink]="item.path" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
          <span class="nav-icon">{{item.icon}}</span>
          <span>{{item.label}}</span>
          <span *ngIf="item.label === 'Notifications' && unreadCount() > 0" class="badge-dot">{{unreadCount()}}</span>
        </a>
      </nav>

      <button class="logout-btn" (click)="logout()">
        <span>🚪</span> Déconnexion
      </button>
    </aside>

    <!-- Overlay mobile -->
    <div class="overlay" *ngIf="sidebarOpen()" (click)="sidebarOpen.set(false)"></div>

    <!-- Main content -->
    <div class="main">
      <header class="topbar">
        <button class="menu-btn hide-desktop" (click)="sidebarOpen.set(true)">☰</button>
        <div class="topbar-right">
          <a routerLink="/seller/notifications" class="notif-btn">
            🔔
            <span *ngIf="unreadCount() > 0" class="notif-badge">{{unreadCount()}}</span>
          </a>
          <a [href]="storeUrl()" target="_blank" class="view-store-btn">Voir ma boutique →</a>
        </div>
      </header>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px; background: white; border-right: 1px solid var(--border);
      display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0;
      z-index: 100; transition: transform 0.3s ease; box-shadow: var(--shadow-sm);
    }
    .sidebar-header { padding: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
    .brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--text-primary); }
    .brand-logo { width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; }
    .close-btn { background: none; border: none; font-size: 18px; cursor: pointer; }
    .seller-info { padding: 16px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
    .avatar { width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 16px; flex-shrink: 0; }
    .seller-info strong { display: block; font-size: 14px; font-weight: 600; }
    .seller-info small { color: var(--text-secondary); font-size: 12px; }
    .nav { flex: 1; padding: 12px 12px; overflow-y: auto; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-md); color: var(--text-secondary); text-decoration: none; font-size: 15px; font-weight: 500; transition: var(--transition); margin-bottom: 4px; position: relative; }
    .nav-item:hover { background: var(--bg); color: var(--text-primary); }
    .nav-item.active { background: rgba(108,99,255,0.1); color: var(--primary); font-weight: 600; }
    .nav-item.active .nav-icon { transform: scale(1.1); }
    .nav-icon { font-size: 20px; width: 24px; text-align: center; flex-shrink: 0; }
    .badge-dot { margin-left: auto; background: var(--primary); color: white; border-radius: 99px; font-size: 11px; font-weight: 700; padding: 2px 8px; }
    .logout-btn { display: flex; align-items: center; gap: 10px; margin: 12px; padding: 12px 14px; background: #fee2e2; color: #dc2626; border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .logout-btn:hover { background: #dc2626; color: white; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
    .main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; min-height: 100vh; }
    .topbar { height: 64px; background: white; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 50; }
    .menu-btn { background: none; border: none; font-size: 22px; cursor: pointer; padding: 8px; }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .notif-btn { position: relative; font-size: 20px; text-decoration: none; }
    .notif-badge { position: absolute; top: -4px; right: -6px; background: #dc2626; color: white; border-radius: 99px; font-size: 10px; font-weight: 700; padding: 1px 5px; }
    .view-store-btn { background: rgba(108,99,255,0.1); color: var(--primary); border: none; border-radius: var(--radius-md); padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .content { flex: 1; padding: 28px 24px; }
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .layout.sidebar-open .sidebar { transform: translateX(0); }
      .main { margin-left: 0; }
      .content { padding: 20px 16px; }
    }
  `]
})
export class SellerLayoutComponent {
  sidebarOpen = signal(false);
  unreadCount = signal(0);
  private auth = inject(AuthService);
  private notifService = inject(NotificationService);

  navItems = [
    { path: '/seller/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/seller/products', icon: '📦', label: 'Produits' },
    { path: '/seller/orders', icon: '🛒', label: 'Commandes' },
    { path: '/seller/store-settings', icon: '🏪', label: 'Ma boutique' },
    { path: '/seller/notifications', icon: '🔔', label: 'Notifications' },
  ];

  userName() { return this.auth.currentUser()?.name || 'Vendeur'; }
  storeUrl() { return `/boutique/${this.auth.currentUser()?.store?.slug || ''}`; }

  constructor() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notifService.getAll().subscribe({
      next: (res) => this.unreadCount.set(res.notifications.filter((n: any) => !n.isRead).length),
      error: () => {},
    });
  }

  logout() { this.auth.logout(); }
}
