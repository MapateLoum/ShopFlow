import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreService } from '../../../core/services/store.service';
import { OrderService } from '../../../core/services/order.service';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PollingService } from '../../../core/services/polling.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="store-page" *ngIf="store(); else loading">
    <!-- Header boutique -->
    <div class="store-header">
      <div class="banner-wrap">
        <div class="banner" [style.background]="store().primaryColor + '22'">
          <img *ngIf="store().bannerUrl" [src]="store().bannerUrl" [alt]="store().name" class="banner-img">
        </div>
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

    <!-- ══════════════════════════════════════════
         MODAL CHECKOUT
    ══════════════════════════════════════════ -->
    <div class="modal-overlay" *ngIf="showCheckout()" (click)="showCheckout.set(false)">
      <div class="checkout-modal" (click)="$event.stopPropagation()">

        <!-- En-tête -->
        <div class="checkout-header">
          <div class="checkout-title">
            <div class="checkout-step-badge">Étape {{checkoutStep()}} / 2</div>
            <h3>{{checkoutStep() === 1 ? 'Vos informations' : 'Paiement Wave'}}</h3>
          </div>
          <button class="modal-close-btn" (click)="showCheckout.set(false)">✕</button>
        </div>

        <!-- ── ÉTAPE 1 : Récapitulatif + Formulaire ── -->
        <div *ngIf="checkoutStep() === 1">
          <!-- Récapitulatif commande -->
          <div class="checkout-summary">
            <div class="summary-label">Récapitulatif</div>
            <div *ngFor="let item of cart()" class="summary-item">
              <span class="summary-item-name">{{item.name}} <em>× {{item.qty}}</em></span>
              <span>{{(item.price * item.qty).toLocaleString()}} FCFA</span>
            </div>
            <div class="summary-total">
              <strong>Total à payer</strong>
              <strong class="summary-amount" [style.color]="store().primaryColor">{{cartTotal().toLocaleString()}} FCFA</strong>
            </div>
          </div>

          <!-- Formulaire -->
          <form [formGroup]="checkoutForm" (ngSubmit)="goToPaymentStep()">
            <div class="fields-grid">
              <div class="field">
                <label>Nom complet *</label>
                <input formControlName="clientName" placeholder="Ex : Aminata Diallo">
              </div>
              <div class="field">
                <label>Email *</label>
                <input formControlName="clientEmail" type="email" placeholder="votre@email.com">
              </div>
              <div class="field field-full">
                <label>Téléphone</label>
                <input formControlName="clientPhone" placeholder="+221 77 000 00 00" type="tel">
              </div>
            </div>

            <button
              class="btn-next"
              [style.background]="store().primaryColor"
              type="submit"
              [disabled]="checkoutForm.invalid">
              Continuer vers le paiement →
            </button>
          </form>
        </div>

        <!-- ── ÉTAPE 2 : Instructions Wave ── -->
        <div *ngIf="checkoutStep() === 2" class="wave-step">

          <!-- Carte Wave principale -->
          <div class="wave-card">
            <!-- Logo Wave + titre -->
            <div class="wave-card-header">
              <div class="wave-logo-wrap">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="10" fill="#1BA8F0"/>
                  <path d="M7 16C7 16 10 10 13 16C16 22 19 10 22 16C25 22 25 16 25 16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div>
                  <span class="wave-card-title">Paiement Wave</span>
                  <span class="wave-card-sub">Transfert mobile sécurisé</span>
                </div>
              </div>
              <div class="wave-amount-pill" [style.background]="store().primaryColor">
                {{cartTotal().toLocaleString()}} FCFA
              </div>
            </div>

            <!-- Steps visuels -->
            <div class="wave-steps">
              <div class="wave-step-item">
                <div class="wave-step-num">1</div>
                <div class="wave-step-text">
                  <strong>Ouvrez Wave</strong>
                  <span>Lancez l'application Wave sur votre téléphone</span>
                </div>
              </div>
              <div class="wave-step-divider"></div>
              <div class="wave-step-item">
                <div class="wave-step-num">2</div>
                <div class="wave-step-text">
                  <strong>Envoyez le montant</strong>
                  <span>Transférez exactement <b>{{cartTotal().toLocaleString()}} FCFA</b> au numéro ci-dessous</span>
                </div>
              </div>
              <div class="wave-step-divider"></div>
              <div class="wave-step-item">
                <div class="wave-step-num">3</div>
                <div class="wave-step-text">
                  <strong>Confirmez la commande</strong>
                  <span>Une fois le paiement envoyé, cliquez sur "Confirmer"</span>
                </div>
              </div>
            </div>

            <!-- Numéro Wave mis en avant -->
            <div class="wave-number-block" *ngIf="store().waveBusinessNumber">
              <span class="wave-number-label">Numéro Wave du vendeur</span>
              <div class="wave-number-display">
                <div class="wave-num-icon">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="10" fill="#1BA8F0"/>
                    <path d="M7 16C7 16 10 10 13 16C16 22 19 10 22 16C25 22 25 16 25 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="wave-number-value">{{store().waveBusinessNumber}}</span>
                <button class="copy-btn" (click)="copyNumber()" [class.copied]="copied()">
                  <span *ngIf="!copied()">📋 Copier</span>
                  <span *ngIf="copied()">✅ Copié !</span>
                </button>
              </div>
            </div>

            <!-- Avertissement si pas de numéro Wave -->
            <div class="wave-no-number" *ngIf="!store().waveBusinessNumber">
              <span>⚠️</span>
              <p>Ce vendeur n'a pas encore configuré son numéro Wave. Contactez-le directement.</p>
            </div>

            <!-- Note importante -->
            <div class="wave-note-box">
              <span>💡</span>
              <p>Votre commande sera traitée dès réception du paiement. Conservez votre confirmation Wave comme preuve.</p>
            </div>
          </div>

          <!-- Boutons -->
          <div class="wave-actions">
            <button class="btn-back" (click)="checkoutStep.set(1)">← Retour</button>
            <button
              class="btn-confirm"
              [style.background]="store().primaryColor"
              (click)="placeOrder()"
              [disabled]="ordering()">
              <span *ngIf="!ordering()">✅ J'ai payé, confirmer</span>
              <span *ngIf="ordering()" class="btn-loading">
                <span class="btn-spinner"></span> Traitement...
              </span>
            </button>
          </div>
        </div>

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
    /* ── Base ── */
    .store-page { min-height: 100vh; background: var(--bg); }
    .store-header { margin-bottom: 0; }
    .banner-wrap { position: relative; padding-bottom: 50px; }
    .banner { height: 200px; position: relative; overflow: hidden; }
    .banner-img { width: 100%; height: 100%; object-fit: cover; }
    .store-logo { position: absolute; bottom: 0; left: 5%; width: 80px; height: 80px; border-radius: 20px; border: 4px solid white; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 28px; overflow: hidden; flex-shrink: 0; box-shadow: var(--shadow-md); }
    .store-logo img { width: 100%; height: 100%; object-fit: cover; }
    .header-content { background: white; padding: 12px 5% 20px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .store-meta { flex: 1; }
    .store-meta h1 { font-size: 22px; margin-bottom: 4px; }
    .store-meta p { color: var(--text-secondary); font-size: 14px; }
    .cart-btn-wrap { margin-left: auto; }
    .cart-btn { color: white; border: none; border-radius: var(--radius-md); padding: 12px 20px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .cart-count { background: white; color: #333; border-radius: 99px; font-size: 11px; font-weight: 800; padding: 2px 7px; }

    /* ── Produits ── */
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

    /* ── Panier drawer ── */
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

    /* ══════════════════════════════════════════
       MODAL CHECKOUT
    ══════════════════════════════════════════ */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      z-index: 300;
      display: flex; align-items: flex-end; justify-content: center;
    }

    .checkout-modal {
      background: white;
      border-radius: 24px 24px 0 0;
      width: 100%; max-width: 580px;
      max-height: 92vh; overflow-y: auto;
      padding: 0 0 32px;
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(40px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    /* En-tête modal */
    .checkout-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; background: white; z-index: 2;
      border-radius: 24px 24px 0 0;
    }
    .checkout-step-badge {
      display: inline-block;
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .checkout-title h3 { font-size: 20px; font-weight: 700; }
    .modal-close-btn {
      width: 32px; height: 32px;
      background: var(--bg); border: none;
      border-radius: 50%; font-size: 14px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary);
      flex-shrink: 0;
    }
    .modal-close-btn:hover { background: var(--border); }

    /* ── Étape 1 : Formulaire ── */
    .checkout-summary {
      background: #f8f7ff; border-radius: 16px;
      padding: 16px; margin: 20px 24px 0;
    }
    .summary-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-secondary);
      margin-bottom: 10px;
    }
    .summary-item {
      display: flex; justify-content: space-between;
      font-size: 14px; padding: 6px 0;
      color: var(--text-secondary);
      border-bottom: 1px dashed var(--border);
    }
    .summary-item-name em { font-style: normal; color: var(--text-secondary); font-size: 13px; }
    .summary-total {
      display: flex; justify-content: space-between;
      padding-top: 12px; font-size: 15px;
    }
    .summary-amount { font-size: 18px; font-family: var(--font-display); }
    .fields-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 14px; padding: 20px 24px 0;
    }
    .field-full { grid-column: 1 / -1; }
    .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 7px; }
    .field input {
      width: 100%; padding: 12px 14px;
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      font-family: var(--font); font-size: 14px;
      outline: none; transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .field input:focus { border-color: var(--primary); }
    .btn-next {
      display: block; width: calc(100% - 48px);
      margin: 20px 24px 0;
      color: white; border: none; border-radius: var(--radius-md);
      padding: 15px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .btn-next:hover:not(:disabled) { opacity: 0.88; }
    .btn-next:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ══════════════════════════════════════════
       ÉTAPE 2 — WAVE PAYMENT CARD
    ══════════════════════════════════════════ */
    .wave-step { padding: 20px 24px 0; }

    .wave-card {
      background: linear-gradient(145deg, #f0f9ff, #e0f2fe);
      border: 1.5px solid #bae6fd;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 20px;
    }

    /* Header de la carte */
    .wave-card-header {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap; gap: 12px;
    }
    .wave-logo-wrap {
      display: flex; align-items: center; gap: 12px;
    }
    .wave-card-title {
      display: block;
      font-weight: 700; font-size: 16px; color: #0c4a6e;
    }
    .wave-card-sub {
      display: block;
      font-size: 12px; color: #0369a1;
    }
    .wave-amount-pill {
      color: white; border-radius: 99px;
      padding: 8px 18px; font-size: 16px; font-weight: 800;
      font-family: var(--font-display);
      white-space: nowrap;
    }

    /* Steps visuels */
    .wave-steps {
      display: flex; flex-direction: column; gap: 0;
      margin-bottom: 24px;
    }
    .wave-step-item {
      display: flex; align-items: flex-start; gap: 14px;
    }
    .wave-step-divider {
      width: 2px; height: 16px;
      background: #93c5fd;
      margin-left: 15px; /* centré sur le numéro */
    }
    .wave-step-num {
      width: 32px; height: 32px; flex-shrink: 0;
      background: #1BA8F0; color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700;
    }
    .wave-step-text strong {
      display: block; font-size: 14px; color: #0c4a6e;
      margin-bottom: 2px;
    }
    .wave-step-text span {
      font-size: 13px; color: #0369a1; line-height: 1.4;
    }
    .wave-step-text b { font-weight: 700; }

    /* Numéro Wave */
    .wave-number-block { margin-bottom: 16px; }
    .wave-number-label {
      display: block; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: #0369a1; margin-bottom: 8px;
    }
    .wave-number-display {
      display: flex; align-items: center; gap: 12px;
      background: white; border-radius: 14px;
      padding: 14px 16px;
      border: 1.5px solid #bae6fd;
      box-shadow: 0 2px 8px rgba(27,168,240,0.1);
    }
    .wave-num-icon { flex-shrink: 0; }
    .wave-number-value {
      flex: 1; font-size: 20px; font-weight: 800;
      color: #0c4a6e; letter-spacing: 0.04em;
      font-family: var(--font-display);
    }
    .copy-btn {
      background: #e0f2fe; border: none;
      border-radius: 10px; padding: 8px 14px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      color: #0369a1; transition: all 0.2s;
      white-space: nowrap;
    }
    .copy-btn:hover { background: #bae6fd; }
    .copy-btn.copied { background: #dcfce7; color: #15803d; }

    /* Avertissement pas de numéro */
    .wave-no-number {
      display: flex; align-items: flex-start; gap: 10px;
      background: #fef9c3; border: 1px solid #fde047;
      border-radius: 12px; padding: 14px;
      margin-bottom: 16px;
    }
    .wave-no-number p { font-size: 13px; color: #713f12; line-height: 1.5; }

    /* Note */
    .wave-note-box {
      display: flex; align-items: flex-start; gap: 10px;
      background: rgba(255,255,255,0.7); border-radius: 12px;
      padding: 12px 14px;
      border: 1px solid #bae6fd;
    }
    .wave-note-box p { font-size: 13px; color: #0369a1; line-height: 1.5; }

    /* Boutons actions */
    .wave-actions {
      display: flex; gap: 12px;
    }
    .btn-back {
      flex: 0 0 auto;
      padding: 14px 20px;
      background: var(--bg); border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 14px; font-weight: 600; cursor: pointer;
      color: var(--text-secondary); transition: var(--transition);
    }
    .btn-back:hover { background: var(--border); }
    .btn-confirm {
      flex: 1;
      color: white; border: none; border-radius: var(--radius-md);
      padding: 14px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-confirm:hover:not(:disabled) { opacity: 0.88; }
    .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Spinner bouton */
    .btn-loading { display: flex; align-items: center; gap: 8px; }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    /* ── Loader / Success ── */
    .loading-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-secondary); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .success-card { background: white; border-radius: var(--radius-xl); padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; }
    .success-icon { font-size: 64px; margin-bottom: 20px; }
    .success-card h2 { font-size: 24px; margin-bottom: 12px; }
    .success-card p { color: var(--text-secondary); margin-bottom: 28px; line-height: 1.6; }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .cart-drawer { width: 100%; right: -100%; }
      .checkout-modal { border-radius: 20px 20px 0 0; }
      .fields-grid { grid-template-columns: 1fr; }
      .wave-card-header { flex-direction: column; align-items: flex-start; }
      .wave-number-value { font-size: 18px; }
    }
  `]
})
export class StoreComponent implements OnInit, OnDestroy {
  store    = signal<any>(null);
  cart     = signal<any[]>([]);
  showCart     = signal(false);
  showCheckout = signal(false);
  ordering     = signal(false);
  orderSuccess = signal(false);
  checkoutStep = signal<1 | 2>(1);   // ← nouvelle étape
  copied       = signal(false);
  private sub!: Subscription;

  cartCount = computed(() => this.cart().reduce((s, i) => s + i.qty, 0));
  cartTotal = computed(() => this.cart().reduce((s, i) => s + i.price * i.qty, 0));

  checkoutForm = this.fb.group({
    clientName:  ['', Validators.required],
    clientEmail: ['', [Validators.required, Validators.email]],
    clientPhone: [''],
  });

constructor(
  private route: ActivatedRoute,
  private storeService: StoreService,
  private orderService: OrderService,
  private fb: FormBuilder,
  private snack: MatSnackBar,
  private polling: PollingService   // ← ajoute ça
) {}

ngOnInit() {
  const slug = this.route.snapshot.paramMap.get('slug')!;
  this.sub = this.polling.poll<any>(
    `${environment.apiUrl}/public/stores/${slug}`, 4000
  ).subscribe({
    next:  (res) => this.store.set(res.store),
    error: () => this.snack.open('Boutique introuvable', '✕', { duration: 3000 }),
  });
}

ngOnDestroy() {
  this.sub.unsubscribe();
}

  // Passe à l'étape Wave si formulaire valide
  goToPaymentStep() {
    if (this.checkoutForm.invalid) return;
    this.checkoutStep.set(2);
  }

  // Copier le numéro Wave
  copyNumber() {
    const num = this.store()?.waveBusinessNumber;
    if (!num) return;
    navigator.clipboard.writeText(num).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  // Réinitialise le checkout à la fermeture
  closeCheckout() {
    this.showCheckout.set(false);
    this.checkoutStep.set(1);
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

  increaseQty(item: any) {
    this.cart.update(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
  }
  decreaseQty(item: any) {
    if (item.qty <= 1) { this.removeFromCart(item.id); return; }
    this.cart.update(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i));
  }
  removeFromCart(id: string) {
    this.cart.update(c => c.filter(i => i.id !== id));
  }

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
        this.closeCheckout();
        this.orderSuccess.set(true);
        this.ordering.set(false);
        this.checkoutForm.reset();
        this.checkoutStep.set(1);
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Erreur lors de la commande', '✕', { duration: 3000, panelClass: 'snack-error' });
        this.ordering.set(false);
      },
    });
  }
}