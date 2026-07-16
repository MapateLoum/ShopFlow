import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PollingService } from '../../../core/services/polling.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="tracking-page">
    <div class="tracking-card" *ngIf="order() as o; else loadingTpl">
      <div class="store-line">
        <div class="store-logo" [style.background]="o.store.primaryColor">
          <img *ngIf="o.store.logoUrl" [src]="o.store.logoUrl">
          <span *ngIf="!o.store.logoUrl">{{o.store.name.charAt(0)}}</span>
        </div>
        <div>
          <strong>{{o.store.name}}</strong>
          <a [routerLink]="['/boutique', o.store.slug]" class="store-link">Voir la boutique</a>
        </div>
      </div>

      <a
        routerLink="/mes-commandes"
        [queryParams]="historyToken ? { token: historyToken } : {}"
        class="all-orders-link"
      >← Voir toutes mes commandes</a>

      <h1>Commande #{{o.id.slice(-6).toUpperCase()}}</h1>
      <p class="order-date">Passée le {{o.createdAt | date:'dd MMMM yyyy à HH:mm'}}</p>

      <!-- Statut paiement -->
      <div class="payment-banner payment-{{o.paymentStatus.toLowerCase()}}">
        <span class="payment-icon">{{paymentIcon(o.paymentStatus)}}</span>
        <div>
          <strong>{{paymentLabel(o.paymentStatus)}}</strong>
          <p>{{paymentHint(o.paymentStatus)}}</p>
        </div>
      </div>

      <!-- Timeline statut commande -->
      <div class="timeline" *ngIf="o.status !== 'CANCELLED'">
        <div
          class="timeline-step"
          *ngFor="let s of statusSteps; let i = index"
          [class.done]="stepIndex(o.status) >= i"
          [class.current]="stepIndex(o.status) === i"
        >
          <div class="dot"></div>
          <span>{{statusLabel(s)}}</span>
        </div>
      </div>
      <div class="cancelled-banner" *ngIf="o.status === 'CANCELLED'">
        ✕ Cette commande a été annulée
      </div>

      <!-- Articles -->
      <div class="items-block">
        <h3>Articles ({{o.items.length}})</h3>
        <div class="item-row" *ngFor="let it of o.items">
          <img *ngIf="it.product?.imageUrl" [src]="it.product?.imageUrl" class="item-img">
          <div class="item-info">
            <span>{{it.product?.name}}</span>
            <small>x{{it.quantity}}</small>
          </div>
          <strong>{{(it.unitPrice * it.quantity).toLocaleString()}} FCFA</strong>
        </div>
        <div class="total-row">
          <strong>Total</strong>
          <strong>{{o.totalAmount.toLocaleString()}} FCFA</strong>
        </div>
      </div>

      <p class="refresh-note">Cette page se met à jour automatiquement — pas besoin de recharger.</p>
    </div>

    <ng-template #loadingTpl>
      <div class="tracking-card" *ngIf="!notFound()">
        <div class="skeleton" style="height:24px;width:60%;margin-bottom:12px;"></div>
        <div class="skeleton" style="height:16px;width:40%;margin-bottom:24px;"></div>
        <div class="skeleton" style="height:80px;width:100%;"></div>
      </div>
      <div class="tracking-card" *ngIf="notFound()">
        <div class="not-found">
          <span>🔍</span>
          <h2>Commande introuvable</h2>
          <p>Vérifiez le lien reçu par email, ou contactez le vendeur.</p>
        </div>
      </div>
    </ng-template>
  </div>
  `,
  styles: [`
    .tracking-page { min-height: 100vh; background: #f8f9fb; display: flex; justify-content: center; padding: 40px 16px; }
    .tracking-card { background: white; border-radius: var(--radius-lg, 16px); box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08)); border: 1px solid var(--border, #eee); max-width: 560px; width: 100%; padding: 32px; height: fit-content; }
    .store-line { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
    .store-logo { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; overflow: hidden; flex-shrink: 0; }
    .store-logo img { width: 100%; height: 100%; object-fit: cover; }
    .store-line strong { display: block; font-size: 15px; }
    .store-link { font-size: 13px; color: #6C63FF; text-decoration: none; }
    .store-link:hover { text-decoration: underline; }
    .all-orders-link { display: inline-block; font-size: 13px; color: #999; text-decoration: none; margin-bottom: 16px; }
    .all-orders-link:hover { color: #6C63FF; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .order-date { color: #888; font-size: 13px; margin: 0 0 24px; }

    .payment-banner { display: flex; gap: 14px; align-items: flex-start; border-radius: 14px; padding: 16px; margin-bottom: 28px; }
    .payment-banner strong { display: block; font-size: 15px; margin-bottom: 2px; }
    .payment-banner p { margin: 0; font-size: 13px; opacity: 0.85; }
    .payment-icon { font-size: 22px; }
    .payment-unpaid { background: #f3f4f6; color: #4b5563; }
    .payment-awaiting_verification { background: #fef3c7; color: #92400e; }
    .payment-paid { background: #d1fae5; color: #065f46; }
    .payment-refunded { background: #fee2e2; color: #991b1b; }

    .timeline { display: flex; justify-content: space-between; margin-bottom: 32px; position: relative; }
    .timeline::before { content: ''; position: absolute; top: 7px; left: 20px; right: 20px; height: 2px; background: #eee; z-index: 0; }
    .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; position: relative; z-index: 1; }
    .dot { width: 16px; height: 16px; border-radius: 50%; background: #e5e7eb; border: 3px solid white; box-shadow: 0 0 0 1px #e5e7eb; }
    .timeline-step.done .dot { background: #6C63FF; box-shadow: 0 0 0 1px #6C63FF; }
    .timeline-step span { font-size: 11px; color: #999; text-align: center; }
    .timeline-step.done span, .timeline-step.current span { color: #333; font-weight: 600; }
    .cancelled-banner { background: #fee2e2; color: #991b1b; padding: 14px; border-radius: 12px; text-align: center; font-weight: 600; margin-bottom: 28px; }

    .items-block h3 { font-size: 14px; margin: 0 0 12px; color: #666; }
    .item-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
    .item-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-info span { font-size: 14px; }
    .item-info small { color: #999; font-size: 12px; }
    .total-row { display: flex; justify-content: space-between; padding-top: 14px; font-size: 16px; }

    .refresh-note { text-align: center; font-size: 12px; color: #bbb; margin-top: 24px; }

    .skeleton { background: #f0f0f0; border-radius: 8px; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

    .not-found { text-align: center; padding: 20px 0; }
    .not-found span { font-size: 40px; display: block; margin-bottom: 12px; }
    .not-found h2 { font-size: 18px; margin: 0 0 8px; }
    .not-found p { color: #888; font-size: 14px; margin: 0; }
  `]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order = signal<any>(null);
  notFound = signal(false);
  statusSteps = STATUS_STEPS;
  historyToken: string | null = null;
  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private polling: PollingService,
  ) {}

  ngOnInit() {
    this.historyToken = sessionStorage.getItem('shopflow_order_history_token');

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound.set(true); return; }

    // Actualisation silencieuse toutes les 5s : le client voit le statut
    // changer tout seul dès que le vendeur confirme le paiement ou avance la commande
    this.sub = this.polling.poll<any>(`${environment.apiUrl}/orders/${id}/track`, 5000).subscribe({
      next: (res) => this.order.set(res.order),
      error: () => this.notFound.set(true),
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  stepIndex(status: string) {
    return STATUS_STEPS.indexOf(status);
  }

  statusLabel(s: string) {
    const m: any = { PENDING: 'En attente', CONFIRMED: 'Confirmée', SHIPPING: 'En livraison', DELIVERED: 'Livrée' };
    return m[s] || s;
  }

  paymentLabel(s: string) {
    const m: any = {
      UNPAID: 'En attente de paiement',
      AWAITING_VERIFICATION: 'Paiement en cours de vérification',
      PAID: 'Paiement confirmé',
      REFUNDED: 'Remboursé',
    };
    return m[s] || s;
  }

  paymentHint(s: string) {
    const m: any = {
      UNPAID: "Le vendeur n'a pas encore reçu de confirmation de paiement.",
      AWAITING_VERIFICATION: 'Le vendeur vérifie la réception sur son compte Wave — généralement rapide.',
      PAID: 'Votre paiement a bien été reçu par le vendeur.',
      REFUNDED: 'Cette commande a été remboursée.',
    };
    return m[s] || '';
  }

  paymentIcon(s: string) {
    const m: any = { UNPAID: '⏳', AWAITING_VERIFICATION: '🔎', PAID: '✅', REFUNDED: '↩️' };
    return m[s] || '•';
  }
}