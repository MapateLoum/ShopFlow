import { Component, OnInit, signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
// import { SellerLayoutComponent } from '../../../shared/components/seller-layout.component';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  client?: { name: string };
}

interface Stat {
  icon: string;
  label: string;
  value: string | number;
  trend: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
 
    <div class="dashboard animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Bonjour, {{name()}} 👋</h1>
          <p>Voici un résumé de votre activité aujourd'hui</p>
        </div>
        <a routerLink="/seller/products" class="btn-primary">+ Ajouter un produit</a>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let s of stats()">
          <div class="stat-icon">{{s.icon}}</div>
          <div class="stat-info">
            <span class="stat-value">{{s.value}}</span>
            <span class="stat-label">{{s.label}}</span>
          </div>
          <div class="stat-trend" [class.up]="s.trend > 0">
            {{s.trend > 0 ? '↑' : '↓'}} {{s.trend}}%
          </div>
        </div>
      </div>

      <!-- Dernières commandes -->
      <div class="section-card">
        <div class="section-header">
          <h2>Dernières commandes</h2>
          <a routerLink="/seller/orders" class="see-all">Voir tout →</a>
        </div>
        <div *ngIf="orders().length === 0" class="empty">
          <p>🛒 Aucune commande pour l'instant</p>
          <small>Partagez votre boutique pour recevoir vos premières commandes !</small>
        </div>
        <div class="orders-list" *ngIf="orders().length > 0">
          <div class="order-row" *ngFor="let order of orders().slice(0, 5)">
            <div class="order-info">
              <strong>#{{order.id.slice(-6).toUpperCase()}}</strong>
              <small>{{order.client?.name}} • {{order.createdAt | date:'dd/MM/yyyy HH:mm'}}</small>
            </div>
            <div class="order-amount">{{order.totalAmount.toLocaleString()}} FCFA</div>
            <span class="badge badge-{{order.status.toLowerCase()}}">{{statusLabel(order.status)}}</span>
          </div>
        </div>
      </div>
    </div>
  
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { font-size: 26px; margin-bottom: 4px; }
    .page-header p { color: var(--text-secondary); font-size: 15px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: white; border-radius: var(--radius-lg); padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); transition: var(--transition); }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .stat-icon { font-size: 32px; width: 56px; height: 56px; background: rgba(108,99,255,0.08); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-info { flex: 1; }
    .stat-value { display: block; font-size: 22px; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); }
    .stat-label { font-size: 13px; color: var(--text-secondary); }
    .stat-trend { font-size: 12px; font-weight: 600; color: #dc2626; }
    .stat-trend.up { color: #059669; }
    .section-card { background: white; border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { font-size: 18px; }
    .see-all { color: var(--primary); text-decoration: none; font-size: 14px; font-weight: 600; }
    .empty { text-align: center; padding: 40px 20px; color: var(--text-secondary); }
    .empty p { font-size: 16px; margin-bottom: 8px; }
    .empty small { font-size: 13px; }
    .order-row { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .order-row:last-child { border-bottom: none; }
    .order-info { flex: 1; }
    .order-info strong { display: block; font-size: 14px; font-weight: 600; }
    .order-info small { color: var(--text-secondary); font-size: 12px; }
    .order-amount { font-weight: 700; font-size: 15px; color: var(--primary); }
  `]
})
export class DashboardComponent implements OnInit {
orders = signal<Order[]>([]);
stats = signal<Stat[]>([]);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);

  name() { return this.auth.currentUser()?.name?.split(' ')[0] || 'Vendeur'; }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.orderService.getStats().subscribe({
      next: (res) => {
        const s = res.stats;
        this.stats.set([
          { icon: '💰', label: 'Revenus total', value: `${s.totalRevenue.toLocaleString()} FCFA`, trend: 12 },
          { icon: '🛒', label: 'Commandes total', value: s.totalOrders, trend: 8 },
          { icon: '📅', label: "Commandes aujourd'hui", value: s.todayOrders, trend: 5 },
          { icon: '⏳', label: 'En attente', value: s.pendingOrders, trend: -2 },
        ]);
      },
    });
    this.orderService.getMyOrders().subscribe({
      next: (res) => this.orders.set(res.orders),
    });
  }

  statusLabel(s: string) {
    const m: any = { PENDING: 'En attente', CONFIRMED: 'Confirmé', SHIPPING: 'En livraison', DELIVERED: 'Livré', CANCELLED: 'Annulé' };
    return m[s] || s;
  }
}
