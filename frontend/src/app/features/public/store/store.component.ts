import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreService } from '../../../core/services/store.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="store-page" *ngIf="store(); else loading">
    <!-- Header boutique -->
    <div class="store-header">
      <!-- ✅ Wrapper relatif pour positionner le logo sur la bannière -->
      <div class="banner-wrap">
        <div class="banner" [style.background]="store().primaryColor + '22'">
          <img *ngIf="store().bannerUrl" [src]="store().bannerUrl" [alt]="store().name" class="banner-img">
        </div>
        <!-- Logo positionné en absolu, au bas de la bannière -->
        <div class="store-logo" [style.background]="store().primaryColor">
          <img *ngIf="store().logoUrl" [src]="store().logoUrl" [alt]="store().name">
          <span *ngIf="!store().logoUrl">{{store().name.charAt(0)}}</span>
        </div>
      </div>

      <div class="header-content">
        <div class="store-meta">
          <h1>{{store().name}}</h1>
          <p>{{store().description}}</p>
        </div>
        <div class="cart-btn-wrap">
          <button class="cart-btn" (click)="showCart.set(true)" [style.background]="store().primaryColor">
            🛒 Panier <span class="cart-count" *ngIf="cartCount() > 0">{{cartCount()}}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Produits -->
    <div class="store-body container">
      <div class="products-header">
        <h2>Nos produits <span>({{store().products?.length}})</span></h2>
      </div>

      <div class="products-grid">
        <div class="product-card" *ngFor="let p of store().products">
          <div class="product-img">
            <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.name">
            <div *ngIf="!p.imageUrl" class="no-img">📦</div>
            <span class="out-badge" *ngIf="p.stock === 0">Épuisé</span>
          </div>
          <div class="product-body">
            <h3>{{p.name}}</h3>
            <p>{{p.description}}</p>
            <div class="product-footer">
              <strong [style.color]="store().primaryColor">{{p.price.toLocaleString()}} FCFA</strong>
              <button class="add-btn" [style.background]="store().primaryColor" (click)="addToCart(p)" [disabled]="p.stock === 0">
                {{inCart(p.id) ? '✓ Ajouté' : '+ Ajouter'}}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty" *ngIf="!store().products?.length">
        <p>🏪 La boutique n'a pas encore de produits</p>
      </div>
    </div>

    <!-- Panier sidebar -->
    <div class="cart-overlay" *ngIf="showCart()" (click)="showCart.set(false)"></div>
    <div class="cart-drawer" [class.open]="showCart()">
      <div class="cart-header">
        <h3>Mon panier</h3>
        <button class="close-cart" (click)="showCart.set(false)">✕</button>
      </div>

      <div class="cart-empty" *ngIf="cart().length === 0">
        <p>🛒 Votre panier est vide</p>
      </div>

      <div class="cart-items" *ngIf="cart().length > 0">
        <div class="cart-item" *ngFor="let item of cart()">
          <div class="ci-img">
            <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.name">
            <span *ngIf="!item.imageUrl">📦</span>
          </div>
          <div class="ci-info">
            <strong>{{item.name}}</strong>
            <small>{{item.price.toLocaleString()}} FCFA × {{item.qty}}</small>
          </div>
          <div class="ci-controls">
            <button (click)="decreaseQty(item)">−</button>
            <span>{{item.qty}}</span>
            <button (click)="increaseQty(item)">+</button>
          </div>
          <button class="ci-remove" (click)="removeFromCart(item.id)">🗑️</button>
        </div>
      </div>

      <div class="cart-footer" *ngIf="cart().length > 0">
        <div class="cart-total">
          <span>Total</span>
          <strong [style.color]="store().primaryColor">{{cartTotal().toLocaleString()}} FCFA</strong>
        </div>
        <button class="checkout-btn" [style.background]="store().primaryColor" (click)="showCheckout.set(true); showCart.set(false)">
          Passer commande →
        </button>
      </div>
    </div>

    <!-- Formulaire commande -->
    <div class="modal-overlay" *ngIf="showCheckout()" (click)="showCheckout.set(false)">
      <div class="checkout-modal" (click)="$event.stopPropagation()">
        <div class="checkout-header">
          <h3>Finaliser la commande</h3>
          <button (click)="showCheckout.set(false)">✕</button>
        </div>
        <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
          <div class="checkout-summary">
            <div *ngFor="let item of cart()" class="summary-item">
              <span>{{item.name}} × {{item.qty}}</span>
              <span>{{(item.price * item.qty).toLocaleString()}} FCFA</span>
            </div>
            <div class="summary-total">
              <strong>Total</strong>
              <strong [style.color]="store().primaryColor">{{cartTotal().toLocaleString()}} FCFA</strong>
            </div>
          </div>
          <div class="field"><label>Nom complet *</label><input formControlName="clientName" placeholder="Votre nom"></div>
          <div class="field"><label>Email *</label><input formControlName="clientEmail" type="email" placeholder="votre@email.com"></div>
          <div class="field"><label>Téléphone</label><input formControlName="clientPhone" placeholder="+221 77 000 00 00" type="tel"></div>

          <div class="wave-info" *ngIf="store().waveBusinessNumber">
            <div class="wave-header">💳 Paiement Wave Business</div>
            <p>Envoyez <strong>{{cartTotal().toLocaleString()}} FCFA</strong> au numéro :</p>
            <div class="wave-number">{{store().waveBusinessNumber}}</div>
            <p class="wave-note">Passez d'abord la commande, puis effectuez le paiement Wave.</p>
          </div>

          <button class="btn-primary w-full" [style.background]="store().primaryColor" type="submit" [disabled]="checkoutForm.invalid || ordering()">
            {{ordering() ? 'Traitement...' : 'Confirmer la commande 🛒'}}
          </button>
        </form>
      </div>
    </div>
  </div>

  <ng-template #loading>
    <div class="loading-page">
      <div class="spinner"></div>
      <p>Chargement de la boutique...</p>
    </div>
  </ng-template>

  <!-- Success -->
  <div class="success-overlay" *ngIf="orderSuccess()">
    <div class="success-card animate-fade-in-up">
      <div class="success-icon">🎉</div>
      <h2>Commande confirmée !</h2>
      <p>Merci pour votre commande. Le vendeur a été notifié et vous contactera bientôt.</p>
      <button class="btn-primary" [style.background]="store()?.primaryColor" (click)="orderSuccess.set(false)">Continuer les achats</button>
    </div>
  </div>
  `,
  styles: [`
    .store-page { min-height: 100vh; background: var(--bg); }
    .store-header { margin-bottom: 0; }

    /* ✅ CORRECTION : wrapper relatif pour positionner le logo */
    .banner-wrap { position: relative; padding-bottom: 50px; }
    .banner { height: 200px; position: relative; overflow: hidden; }
    .banner-img { width: 100%; height: 100%; object-fit: cover; }

    /* ✅ Logo en absolu, centré à gauche (style profil) au bas de la bannière */
    .store-logo {
      position: absolute;
      bottom: 0;
      left: 5%;
      width: 80px;
      height: 80px;
      border-radius: 20px;
      border: 4px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 28px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: var(--shadow-md);
    }
    .store-logo img { width: 100%; height: 100%; object-fit: cover; }

    /* header-content n'a plus besoin de gérer le logo */
    .header-content { background: white; padding: 12px 5% 20px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .store-meta { flex: 1; }
    .store-meta h1 { font-size: 22px; margin-bottom: 4px; }
    .store-meta p { color: var(--text-secondary); font-size: 14px; }
    .cart-btn-wrap { margin-left: auto; }
    .cart-btn { color: white; border: none; border-radius: var(--radius-md); padding: 12px 20px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; position: relative; }
    .cart-count { background: white; color: #333; border-radius: 99px; font-size: 11px; font-weight: 800; padding: 2px 7px; }
    .store-body { padding: 32px 5%; }
    .products-header { margin-bottom: 24px; }
    .products-header h2 { font-size: 20px; }
    .products-header span { color: var(--text-secondary); font-weight: 400; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
    .product-card { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border); transition: var(--transition); }
    .product-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
    .product-img { height: 180px; background: var(--bg); position: relative; }
    .product-img img { width: 100%; height: 100%; object-fit: cover; }
    .no-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .out-badge { position: absolute; top: 10px; right: 10px; background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .product-body { padding: 16px; }
    .product-body h3 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
    .product-body p { color: var(--text-secondary); font-size: 13px; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; }
    .product-footer strong { font-size: 15px; font-weight: 700; }
    .add-btn { color: white; border: none; border-radius: var(--radius-sm); padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .add-btn:hover { opacity: 0.85; }
    .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; padding: 60px; color: var(--text-secondary); }
    .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 150; }
    .cart-drawer { position: fixed; top: 0; right: -400px; width: 380px; height: 100vh; background: white; z-index: 200; display: flex; flex-direction: column; transition: right 0.3s ease; box-shadow: var(--shadow-lg); }
    .cart-drawer.open { right: 0; }
    .cart-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .cart-header h3 { font-size: 18px; }
    .close-cart { background: none; border: none; font-size: 20px; cursor: pointer; }
    .cart-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
    .cart-items { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .cart-item { display: flex; align-items: center; gap: 12px; background: var(--bg); border-radius: var(--radius-md); padding: 12px; }
    .ci-img { width: 48px; height: 48px; border-radius: 10px; overflow: hidden; background: var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; }
    .ci-img img { width: 100%; height: 100%; object-fit: cover; }
    .ci-info { flex: 1; }
    .ci-info strong { display: block; font-size: 13px; font-weight: 600; }
    .ci-info small { color: var(--text-secondary); font-size: 12px; }
    .ci-controls { display: flex; align-items: center; gap: 8px; }
    .ci-controls button { width: 26px; height: 26px; border: 1px solid var(--border); background: white; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
    .ci-controls span { font-size: 14px; font-weight: 600; min-width: 20px; text-align: center; }
    .ci-remove { background: none; border: none; cursor: pointer; font-size: 16px; }
    .cart-footer { padding: 20px 24px; border-top: 1px solid var(--border); }
    .cart-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 16px; }
    .cart-total strong { font-size: 18px; font-family: var(--font-display); }
    .checkout-btn { width: 100%; color: white; border: none; border-radius: var(--radius-md); padding: 14px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: flex-end; justify-content: center; }
    .checkout-modal { background: white; border-radius: var(--radius-xl) var(--radius-xl) 0 0; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; padding: 28px 24px; }
    .checkout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .checkout-header h3 { font-size: 20px; }
    .checkout-header button { background: none; border: none; font-size: 20px; cursor: pointer; }
    .checkout-summary { background: var(--bg); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; }
    .summary-item { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
    .summary-total { display: flex; justify-content: space-between; padding-top: 10px; font-size: 16px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .field input { width: 100%; padding: 12px 14px; border: 2px solid var(--border); border-radius: var(--radius-md); font-family: var(--font); font-size: 14px; outline: none; transition: var(--transition); }
    .field input:focus { border-color: var(--primary); }
    .wave-info { background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; }
    .wave-header { font-weight: 700; margin-bottom: 8px; color: #166534; }
    .wave-info p { font-size: 13px; color: #166534; margin-bottom: 4px; }
    .wave-number { font-size: 20px; font-weight: 800; color: #166534; text-align: center; padding: 8px; background: white; border-radius: 8px; margin: 8px 0; }
    .wave-note { font-size: 12px; color: #4ade80; }
    .w-full { width: 100%; justify-content: center; }
    .loading-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-secondary); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .success-card { background: white; border-radius: var(--radius-xl); padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; }
    .success-icon { font-size: 64px; margin-bottom: 20px; }
    .success-card h2 { font-size: 24px; margin-bottom: 12px; }
    .success-card p { color: var(--text-secondary); margin-bottom: 28px; line-height: 1.6; }
    @media (max-width: 480px) { .cart-drawer { width: 100%; right: -100%; } .checkout-modal { border-radius: var(--radius-xl) var(--radius-xl) 0 0; } }
  `]
})
export class StoreComponent implements OnInit {
  store = signal<any>(null);
  cart = signal<any[]>([]);
  showCart = signal(false);
  showCheckout = signal(false);
  ordering = signal(false);
  orderSuccess = signal(false);

  cartCount = computed(() => this.cart().reduce((s, i) => s + i.qty, 0));
  cartTotal = computed(() => this.cart().reduce((s, i) => s + i.price * i.qty, 0));

  checkoutForm = this.fb.group({
    clientName: ['', Validators.required],
    clientEmail: ['', [Validators.required, Validators.email]],
    clientPhone: [''],
  });

  constructor(private route: ActivatedRoute, private storeService: StoreService, private orderService: OrderService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.storeService.getStoreBySlug(slug).subscribe({
      next: (res) => this.store.set(res.store),
      error: () => this.snack.open('Boutique introuvable', '✕', { duration: 3000 }),
    });
  }

  inCart(id: string) { return this.cart().some(i => i.id === id); }

  addToCart(p: any) {
    const existing = this.cart().find(i => i.id === p.id);
    if (existing) {
      this.cart.update(c => c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      this.cart.update(c => [...c, { id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, qty: 1 }]);
    }
  }

  increaseQty(item: any) { this.cart.update(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)); }
  decreaseQty(item: any) {
    if (item.qty <= 1) { this.removeFromCart(item.id); return; }
    this.cart.update(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i));
  }
  removeFromCart(id: string) { this.cart.update(c => c.filter(i => i.id !== id)); }

  placeOrder() {
    if (this.checkoutForm.invalid) return;
    this.ordering.set(true);
    const { clientName, clientEmail, clientPhone } = this.checkoutForm.value;
    const payload = {
      storeId: this.store().id,
      clientName, clientEmail, clientPhone,
      items: this.cart().map(i => ({ productId: i.id, quantity: i.qty })),
    };
    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.cart.set([]);
        this.showCheckout.set(false);
        this.orderSuccess.set(true);
        this.ordering.set(false);
        this.checkoutForm.reset();
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Erreur lors de la commande', '✕', { duration: 3000, panelClass: 'snack-error' });
        this.ordering.set(false);
      },
    });
  }
}