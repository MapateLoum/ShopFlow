import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../../core/services/order.service';
// import { SellerLayoutComponent } from '../../../shared/components/seller-layout.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `

  <div class="orders-page animate-fade-in">
    <div class="page-header">
      <div><h1>Commandes</h1><p>{{orders().length}} commande(s) au total</p></div>
    </div>

    <!-- Filtres -->
    <div class="filters">
      <button *ngFor="let f of filterOptions" class="filter-btn" [class.active]="activeFilter() === f.value" (click)="setFilter(f.value)">
        {{f.label}}
      </button>
    </div>

    <div class="empty" *ngIf="filtered().length === 0">
      <p>🛒 Aucune commande dans cette catégorie</p>
    </div>

    <div class="orders-list" *ngIf="filtered().length > 0">
      <div class="order-card" *ngFor="let order of filtered()">
        <div class="order-top">
          <div class="order-meta">
            <strong class="order-id">#{{order.id.slice(-6).toUpperCase()}}</strong>
            <span class="badge badge-{{order.status.toLowerCase()}}">{{statusLabel(order.status)}}</span>
          </div>
          <span class="order-date">{{order.createdAt | date:'dd/MM/yyyy à HH:mm'}}</span>
        </div>

        <div class="order-client">
          <span>👤 {{order.client?.name}}</span>
          <span>📞 {{order.client?.phone || 'N/A'}}</span>
          <span>📧 {{order.client?.email}}</span>
        </div>

        <div class="order-items">
          <div class="order-item" *ngFor="let item of order.items">
            <img *ngIf="item.product?.imageUrl" [src]="item.product.imageUrl" [alt]="item.product.name">
            <div *ngIf="!item.product?.imageUrl" class="no-img">📦</div>
            <div class="item-info">
              <span>{{item.product?.name}}</span>
              <small>{{item.quantity}} × {{item.unitPrice.toLocaleString()}} FCFA</small>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <strong class="total">Total : {{order.totalAmount.toLocaleString()}} FCFA</strong>
          <div class="status-actions">
            <select [value]="order.status" (change)="updateStatus(order.id, $event)" class="status-select">
              <option *ngFor="let s of statusOptions" [value]="s.value">{{s.label}}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>

  `,
  styles: [`
    .orders-page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 2px; }
    .page-header p { color: var(--text-secondary); font-size: 14px; }
    .filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-btn { padding: 8px 18px; border-radius: 99px; border: 2px solid var(--border); background: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); color: var(--text-secondary); }
    .filter-btn.active { border-color: var(--primary); background: var(--primary); color: white; }
    .empty { text-align: center; padding: 60px; color: var(--text-secondary); }
    .orders-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card { background: white; border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    .order-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .order-meta { display: flex; align-items: center; gap: 10px; }
    .order-id { font-size: 15px; font-family: var(--font-display); }
    .order-date { font-size: 13px; color: var(--text-secondary); }
    .order-client { display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; flex-wrap: wrap; }
    .order-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding: 16px; background: var(--bg); border-radius: var(--radius-md); }
    .order-item { display: flex; align-items: center; gap: 12px; }
    .order-item img, .no-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .no-img { background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .item-info span { display: block; font-size: 14px; font-weight: 500; }
    .item-info small { color: var(--text-secondary); font-size: 12px; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
    .total { font-size: 16px; color: var(--primary); }
    .status-select { padding: 8px 14px; border: 2px solid var(--border); border-radius: var(--radius-md); font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; outline: none; background: white; }
    .status-select:focus { border-color: var(--primary); }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  activeFilter = signal('ALL');

  filterOptions = [
    { label: 'Toutes', value: 'ALL' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'Confirmées', value: 'CONFIRMED' },
    { label: 'En livraison', value: 'SHIPPING' },
    { label: 'Livrées', value: 'DELIVERED' },
  ];

  statusOptions = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmé' },
    { value: 'SHIPPING', label: 'En livraison' },
    { value: 'DELIVERED', label: 'Livré' },
    { value: 'CANCELLED', label: 'Annulé' },
  ];

  constructor(private orderService: OrderService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => this.orders.set(res.orders),
    });
  }

  filtered() {
    if (this.activeFilter() === 'ALL') return this.orders();
    return this.orders().filter(o => o.status === this.activeFilter());
  }

  setFilter(v: string) { this.activeFilter.set(v); }

  updateStatus(id: string, e: Event) {
    const status = (e.target as HTMLSelectElement).value;
    this.orderService.updateStatus(id, status).subscribe({
      next: () => {
        this.snack.open('Statut mis à jour', '✓', { duration: 2000, panelClass: 'snack-success' });
        this.load();
      },
      error: () => this.snack.open('Erreur', '✕', { duration: 2000, panelClass: 'snack-error' }),
    });
  }

  statusLabel(s: string) {
    const m: any = { PENDING: 'En attente', CONFIRMED: 'Confirmé', SHIPPING: 'En livraison', DELIVERED: 'Livré', CANCELLED: 'Annulé' };
    return m[s] || s;
  }
}
