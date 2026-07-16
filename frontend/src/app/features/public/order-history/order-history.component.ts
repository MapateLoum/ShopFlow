import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';

const STATUS_LABEL: Record<string, string> = { PENDING: 'En attente', CONFIRMED: 'Confirmée', SHIPPING: 'En livraison', DELIVERED: 'Livrée', CANCELLED: 'Annulée' };
const PAYMENT_LABEL: Record<string, string> = { UNPAID: 'En attente de paiement', AWAITING_VERIFICATION: 'Paiement à vérifier', PAID: 'Payé', REFUNDED: 'Remboursé' };
const PAYMENT_CLASS: Record<string, string> = { UNPAID: 'p-unpaid', AWAITING_VERIFICATION: 'p-awaiting', PAID: 'p-paid', REFUNDED: 'p-refunded' };

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="history-page">

    <!-- Étape 1 : demander le lien par email -->
    <div class="history-card" *ngIf="!token && !sent()">
      <button class="back-btn" (click)="goBack()">← Retour</button>
      <div class="icon-badge">📦</div>
      <h1>Retrouver mes commandes</h1>
      <p class="subtitle">Entrez l'email utilisé lors de vos achats — on vous envoie un lien pour tout revoir, toutes boutiques confondues.</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <input type="email" formControlName="email" placeholder="votre@email.com" class="email-input">
        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || sending()">
          {{sending() ? 'Envoi...' : 'Envoyer le lien'}}
        </button>
      </form>
    </div>

    <!-- Confirmation d'envoi -->
    <div class="history-card" *ngIf="!token && sent()">
      <button class="back-btn" (click)="goBack()">← Retour</button>
      <div class="icon-badge">📬</div>
      <h1>Vérifiez votre boîte mail</h1>
      <p class="subtitle">Si cet email a déjà servi à commander, un lien vient d'être envoyé — valable 30 minutes. Pensez aussi aux spams.</p>
      <button class="btn-outline w-full" (click)="sent.set(false)">Renvoyer / autre email</button>
    </div>

    <!-- Étape 2 : liste des commandes (token présent) -->
    <div class="history-list-wrap" *ngIf="token">
      <div class="history-header">
        <button class="back-btn back-btn-inline" (click)="goBack()">← Retour</button>
        <h1>Mes commandes</h1>
        <p *ngIf="orders() as list">{{list.length}} commande(s)</p>
      </div>

      <div class="history-card" *ngIf="tokenError()">
        <div class="icon-badge">⚠️</div>
        <h2>{{tokenError()}}</h2>
        <a routerLink="/mes-commandes" class="btn-primary w-full" style="text-decoration:none;display:block;text-align:center;box-sizing:border-box;">Redemander un lien</a>
      </div>

      <div class="skeleton-list" *ngIf="loading()">
        <div class="skeleton" *ngFor="let _ of [1,2,3]"></div>
      </div>

      <div class="order-card" *ngFor="let o of orders()">
        <div class="order-top">
          <div class="store-mini">
            <div class="store-logo" [style.background]="o.store.primaryColor">
              <img *ngIf="o.store.logoUrl" [src]="o.store.logoUrl">
              <span *ngIf="!o.store.logoUrl">{{o.store.name.charAt(0)}}</span>
            </div>
            <strong>{{o.store.name}}</strong>
          </div>
          <span class="order-date">{{o.createdAt | date:'dd MMM yyyy'}}</span>
        </div>
        <div class="order-mid">
          <span>#{{o.id.slice(-6).toUpperCase()}} · {{o.items.length}} article(s)</span>
          <strong>{{o.totalAmount.toLocaleString()}} FCFA</strong>
        </div>
        <div class="order-bottom">
          <span class="badge">{{statusLabel(o.status)}}</span>
          <span class="badge" [ngClass]="paymentClass(o.paymentStatus)">{{paymentLabel(o.paymentStatus)}}</span>
          <a [routerLink]="['/commande', o.id]" class="track-link">Suivre →</a>
        </div>
      </div>

      <div class="history-card" *ngIf="!loading() && !tokenError() && orders() && orders()!.length === 0">
        <div class="icon-badge">🛒</div>
        <h2>Aucune commande trouvée</h2>
        <p class="subtitle">Cet email n'a encore rien commandé sur ShopFlow.</p>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .history-page { min-height: 100vh; background: #f8f9fb; display: flex; justify-content: center; padding: 48px 16px; }
    .history-card { position: relative; background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #eee; max-width: 440px; width: 100%; padding: 36px; text-align: center; height: fit-content; margin-bottom: 16px; }
    .back-btn { position: absolute; top: 20px; left: 20px; background: none; border: none; color: #999; font-size: 13px; font-weight: 500; cursor: pointer; padding: 4px 0; }
    .back-btn:hover { color: #6C63FF; }
    .back-btn-inline { position: static; display: block; margin-bottom: 10px; }
    .icon-badge { font-size: 40px; margin-bottom: 16px; }
    .history-card h1 { font-size: 22px; margin: 0 0 10px; }
    .history-card h2 { font-size: 18px; margin: 0 0 8px; }
    .subtitle { color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
    .email-input { width: 100%; padding: 13px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; margin-bottom: 14px; box-sizing: border-box; }
    .email-input:focus { border-color: #6C63FF; }
    .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg,#6C63FF,#4840ab); color: white; font-weight: 600; padding: 13px 20px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline { background: white; color: #6C63FF; font-weight: 600; padding: 12px 20px; border-radius: 10px; border: 2px solid #6C63FF; cursor: pointer; font-size: 14px; }
    .w-full { width: 100%; box-sizing: border-box; }

    .history-list-wrap { max-width: 560px; width: 100%; }
    .history-header { margin-bottom: 20px; }
    .history-header h1 { font-size: 22px; margin: 0 0 2px; }
    .history-header p { color: #888; font-size: 13px; margin: 0; }

    .order-card { background: white; border-radius: 14px; border: 1px solid #eee; padding: 18px 20px; margin-bottom: 12px; }
    .order-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .store-mini { display: flex; align-items: center; gap: 10px; }
    .store-logo { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; overflow: hidden; }
    .store-logo img { width: 100%; height: 100%; object-fit: cover; }
    .order-date { font-size: 12px; color: #999; }
    .order-mid { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #555; margin-bottom: 12px; }
    .order-bottom { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge { font-size: 11px; padding: 4px 10px; border-radius: 99px; background: #f3f4f6; color: #4b5563; font-weight: 600; }
    .p-unpaid { background: #f3f4f6; color: #6b7280; }
    .p-awaiting { background: #fef3c7; color: #92400e; }
    .p-paid { background: #d1fae5; color: #065f46; }
    .p-refunded { background: #fee2e2; color: #991b1b; }
    .track-link { margin-left: auto; font-size: 13px; color: #6C63FF; text-decoration: none; font-weight: 600; }
    .track-link:hover { text-decoration: underline; }

    .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
    .skeleton { height: 90px; border-radius: 14px; background: #eee; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  `]
})
export class OrderHistoryComponent implements OnInit {
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  sending = signal(false);
  sent = signal(false);
  token: string | null = null;
  loading = signal(false);
  tokenError = signal<string | null>(null);
  orders = signal<any[] | null>(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private location: Location,
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) this.loadHistory(this.token);
  }

  goBack() {
    this.location.back();
  }

  submit() {
    if (this.form.invalid) return;
    this.sending.set(true);
    this.orderService.requestOrderHistory(this.form.value.email!).subscribe({
      next: () => { this.sending.set(false); this.sent.set(true); },
      error: () => { this.sending.set(false); this.sent.set(true); }, // même message, pas d'énumération d'emails
    });
  }

  loadHistory(token: string) {
    this.loading.set(true);
    this.orderService.getOrderHistory(token).subscribe({
      next: (res) => { this.orders.set(res.orders); this.loading.set(false); },
      error: (err) => {
        this.tokenError.set(err.error?.message || "Ce lien n'est plus valable.");
        this.loading.set(false);
      },
    });
  }

  statusLabel(s: string) { return STATUS_LABEL[s] || s; }
  paymentLabel(s: string) { return PAYMENT_LABEL[s] || s; }
  paymentClass(s: string) { return PAYMENT_CLASS[s] || ''; }
}