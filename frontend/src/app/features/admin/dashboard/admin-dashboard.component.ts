import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">⚙️</div>
        <span>Admin ShopFlow</span>
      </div>
      <nav class="admin-nav">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">📊 Dashboard</a>
        <a routerLink="/admin/sellers" routerLinkActive="active" class="nav-item">👥 Vendeurs</a>
      </nav>
      <button class="logout-btn" (click)="logout()">🚪 Déconnexion</button>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <h2>Dashboard Admin</h2>
        <span class="admin-badge">Super Admin</span>
      </header>

      <div class="admin-content animate-fade-in">
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let s of statCards()">
            <div class="stat-icon">{{s.icon}}</div>
            <div>
              <div class="stat-value">{{s.value}}</div>
              <div class="stat-label">{{s.label}}</div>
            </div>
          </div>
        </div>

        <div class="quick-links">
          <h3>Actions rapides</h3>
          <div class="links-grid">
            <a routerLink="/admin/sellers" class="quick-link">
              <span>👥</span>
              <div>
                <strong>Gérer les vendeurs</strong>
                <p>Valider, suspendre ou activer des comptes vendeurs</p>
              </div>
            </a>
            <a href="/" target="_blank" class="quick-link">
              <span>🏪</span>
              <div>
                <strong>Voir la plateforme</strong>
                <p>Visiter la page d'accueil publique</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .admin-sidebar { width: 240px; background: #1a1a2e; display: flex; flex-direction: column; padding: 24px 16px; position: fixed; top: 0; left: 0; bottom: 0; }
    .sidebar-brand { display: flex; align-items: center; gap: 10px; color: white; font-weight: 700; font-size: 16px; margin-bottom: 32px; padding: 8px; }
    .brand-logo { font-size: 24px; }
    .admin-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; font-weight: 500; transition: var(--transition); }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); color: white; }
    .logout-btn { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(220,38,38,0.2); color: #f87171; border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .logout-btn:hover { background: #dc2626; color: white; }
    .admin-main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; }
    .admin-topbar { height: 64px; background: white; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; }
    .admin-topbar h2 { font-size: 18px; }
    .admin-badge { background: rgba(108,99,255,0.1); color: var(--primary); padding: 4px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; }
    .admin-content { padding: 28px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: white; border-radius: var(--radius-lg); padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    .stat-icon { font-size: 32px; }
    .stat-value { font-size: 24px; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); }
    .stat-label { font-size: 13px; color: var(--text-secondary); }
    .quick-links h3 { font-size: 18px; margin-bottom: 16px; }
    .links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .quick-link { background: white; border-radius: var(--radius-lg); padding: 24px; display: flex; align-items: flex-start; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); text-decoration: none; transition: var(--transition); }
    .quick-link:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .quick-link span { font-size: 28px; flex-shrink: 0; }
    .quick-link strong { display: block; color: var(--text-primary); font-size: 15px; margin-bottom: 4px; }
    .quick-link p { color: var(--text-secondary); font-size: 13px; }
    @media (max-width: 768px) { .admin-sidebar { display: none; } .admin-main { margin-left: 0; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  statCards = signal<any[]>([]);

  constructor(private adminService: AdminService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (res) => {
        const s = res.stats;
        this.statCards.set([
          { icon: '👥', value: s.totalSellers, label: 'Vendeurs total' },
          { icon: '✅', value: s.activeSellers, label: 'Vendeurs actifs' },
          { icon: '🏪', value: s.totalStores, label: 'Boutiques actives' },
          { icon: '🛒', value: s.totalOrders, label: 'Commandes total' },
          { icon: '💰', value: `${s.totalRevenue?.toLocaleString()} FCFA`, label: 'Volume total' },
        ]);
      },
    });
  }

  logout() { this.auth.logout(); }
}
