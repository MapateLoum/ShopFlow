import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sellers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand"><div class="brand-logo">⚙️</div><span>Admin ShopFlow</span></div>
      <nav class="admin-nav">
        <a routerLink="/admin/dashboard" class="nav-item">📊 Dashboard</a>
        <a routerLink="/admin/sellers" class="nav-item active">👥 Vendeurs</a>
      </nav>
      <button class="logout-btn" (click)="logout()">🚪 Déconnexion</button>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <h2>Gestion des vendeurs</h2>
        <div class="filter-tabs">
          <button *ngFor="let f of filters" class="tab" [class.active]="activeFilter() === f.value" (click)="activeFilter.set(f.value)">
            {{f.label}} <span class="count">{{countByStatus(f.value)}}</span>
          </button>
        </div>
      </header>

      <div class="content animate-fade-in">
        <div class="empty" *ngIf="filtered().length === 0"><p>Aucun vendeur dans cette catégorie</p></div>

        <div class="sellers-grid">
          <div class="seller-card" *ngFor="let s of filtered()">
            <div class="seller-header">
              <div class="avatar">{{s.name.charAt(0)}}</div>
              <div class="seller-info">
                <strong>{{s.name}}</strong>
                <small>{{s.email}}</small>
                <small>{{s.phone}}</small>
              </div>
              <span class="badge badge-{{s.status.toLowerCase()}}">
                {{s.status === 'PENDING' ? 'En attente' : s.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}}
              </span>
            </div>

            <div class="store-info" *ngIf="s.store">
              <div class="store-row">
                <span>🏪</span>
                <span>{{s.store.name}}</span>
              </div>
              <div class="store-row">
                <span>🔗</span>
                <a [href]="'/boutique/' + s.store.slug" target="_blank">/boutique/{{s.store.slug}}</a>
              </div>
            </div>

            <div class="seller-actions">
              <small class="joined">Inscrit le {{s.createdAt | date:'dd/MM/yyyy'}}</small>
              <div class="action-btns">
                <button *ngIf="s.status !== 'ACTIVE'" class="btn-activate" (click)="activate(s.id)">✅ Activer</button>
                <button *ngIf="s.status === 'ACTIVE'" class="btn-suspend" (click)="suspend(s.id)">⛔ Suspendre</button>
              </div>
            </div>
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
    .logout-btn { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(220,38,38,0.2); color: #f87171; border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; cursor: pointer; }
    .logout-btn:hover { background: #dc2626; color: white; }
    .admin-main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; }
    .admin-topbar { background: white; border-bottom: 1px solid var(--border); padding: 16px 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .admin-topbar h2 { font-size: 18px; }
    .filter-tabs { display: flex; gap: 8px; }
    .tab { padding: 8px 16px; border-radius: 99px; border: 2px solid var(--border); background: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 6px; }
    .tab.active { border-color: var(--primary); background: var(--primary); color: white; }
    .count { background: rgba(255,255,255,0.2); border-radius: 99px; padding: 1px 7px; font-size: 11px; }
    .tab:not(.active) .count { background: var(--bg); color: var(--text-secondary); }
    .content { padding: 28px; }
    .empty { text-align: center; padding: 60px; color: var(--text-secondary); }
    .sellers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .seller-card { background: white; border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    .seller-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .avatar { width: 44px; height: 44px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 18px; flex-shrink: 0; }
    .seller-info { flex: 1; }
    .seller-info strong { display: block; font-size: 15px; font-weight: 600; }
    .seller-info small { display: block; color: var(--text-secondary); font-size: 12px; }
    .store-info { background: var(--bg); border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
    .store-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .store-row a { color: var(--primary); text-decoration: none; }
    .seller-actions { display: flex; justify-content: space-between; align-items: center; }
    .joined { font-size: 12px; color: var(--text-muted); }
    .action-btns { display: flex; gap: 8px; }
    .btn-activate { background: #d1fae5; color: #065f46; border: none; border-radius: var(--radius-sm); padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .btn-activate:hover { background: #059669; color: white; }
    .btn-suspend { background: #fee2e2; color: #dc2626; border: none; border-radius: var(--radius-sm); padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .btn-suspend:hover { background: #dc2626; color: white; }
    @media (max-width: 768px) { .admin-sidebar { display: none; } .admin-main { margin-left: 0; } }
  `]
})
export class AdminSellersComponent implements OnInit {
  sellers = signal<any[]>([]);
  activeFilter = signal('ALL');

  filters = [
    { label: 'Tous', value: 'ALL' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'Actifs', value: 'ACTIVE' },
    { label: 'Suspendus', value: 'SUSPENDED' },
  ];

  constructor(private adminService: AdminService, private auth: AuthService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() { this.adminService.getAllSellers().subscribe({ next: (res) => this.sellers.set(res.sellers) }); }

  filtered() {
    if (this.activeFilter() === 'ALL') return this.sellers();
    return this.sellers().filter(s => s.status === this.activeFilter());
  }

  countByStatus(status: string) {
    if (status === 'ALL') return this.sellers().length;
    return this.sellers().filter(s => s.status === status).length;
  }

  activate(id: string) {
    this.adminService.activateSeller(id).subscribe({
      next: () => { this.snack.open('Vendeur activé ! Email de bienvenue envoyé.', '✓', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: () => this.snack.open('Erreur', '✕', { duration: 2000, panelClass: 'snack-error' }),
    });
  }

  suspend(id: string) {
    if (!confirm('Suspendre ce vendeur ?')) return;
    this.adminService.suspendSeller(id).subscribe({
      next: () => { this.snack.open('Vendeur suspendu', '', { duration: 2000 }); this.load(); },
    });
  }

  logout() { this.auth.logout(); }
}
