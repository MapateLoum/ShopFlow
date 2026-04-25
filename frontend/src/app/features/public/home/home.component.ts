import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../../core/services/store.service';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PollingService } from '../../../core/services/polling.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="home">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <div class="logo">SF</div>
        <span>ShopFlow</span>
      </div>
      <div class="nav-links">
        <a routerLink="/auth/login" class="nav-link">Se connecter</a>
        <a routerLink="/auth/register" class="btn-primary">Créer ma boutique</a>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-content animate-fade-in-up">
        <div class="hero-badge">🇸🇳 Fait pour le Sénégal</div>
        <h1>Votre boutique en ligne,<br><span class="gradient-text">prête en 5 minutes</span></h1>
        <p>Vendez vos produits en ligne, recevez des paiements Wave & Orange Money, et gérez tout depuis un seul tableau de bord.</p>
        <div class="hero-actions">
          <a routerLink="/auth/register" class="btn-primary btn-lg">Créer ma boutique gratuite →</a>
          <a routerLink="/auth/login" class="btn-outline btn-lg">J'ai déjà un compte</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>100%</strong><span>Gratuit</span></div>
          <div class="stat"><strong>5min</strong><span>Pour démarrer</span></div>
          <div class="stat"><strong>Wave</strong><span>Paiement intégré</span></div>
        </div>
      </div>
      <div class="hero-visual animate-float">
        <div class="mockup-phone">
          <div class="phone-screen">
            <div class="phone-store-header" [style.background]="'#6C63FF'">
              <div class="phone-logo">AC</div>
              <div>
                <strong>Aminata Cosmétiques</strong>
                <small>Soins naturels</small>
              </div>
            </div>
            <div class="phone-products">
              <div class="phone-product" *ngFor="let p of mockProducts">
                <div class="pp-img">{{p.emoji}}</div>
                <div class="pp-info">
                  <span>{{p.name}}</span>
                  <strong>{{p.price}}</strong>
                </div>
              </div>
            </div>
            <div class="phone-cart">
              <button class="phone-btn">Commander via Wave 💳</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features-section">
      <div class="container">
        <h2>Tout ce dont vous avez besoin</h2>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let f of features">
            <div class="feature-icon">{{f.icon}}</div>
            <h3>{{f.title}}</h3>
            <p>{{f.desc}}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Boutiques actives -->
    <section class="stores-section" *ngIf="stores().length > 0">
      <div class="container">
        <h2>Boutiques sur ShopFlow</h2>
        <div class="stores-grid">
          <a *ngFor="let store of stores()" [routerLink]="['/boutique', store.slug]" class="store-card">
            <div class="store-banner-sm" [style.background]="store.primaryColor + '22'">
              <img *ngIf="store.bannerUrl" [src]="store.bannerUrl" [alt]="store.name">
              <div *ngIf="!store.bannerUrl" class="store-emoji">🏪</div>
            </div>
            <div class="store-card-body">
              <div class="store-logo-sm" [style.background]="store.primaryColor">
                <img *ngIf="store.logoUrl" [src]="store.logoUrl" [alt]="store.name">
                <span *ngIf="!store.logoUrl">{{store.name.charAt(0)}}</span>
              </div>
              <h4>{{store.name}}</h4>
              <p>{{store.description || 'Boutique en ligne'}}</p>
              <span class="product-count">{{store._count?.products || 0}} produits</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Prêt à vendre en ligne ?</h2>
        <p>Rejoignez des vendeurs sénégalais qui font confiance à ShopFlow</p>
        <a routerLink="/auth/register" class="btn-primary btn-lg">Commencer maintenant →</a>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <p>© 2024 ShopFlow · Dakar, Sénégal · Fait avec ❤️</p>
      </div>
    </footer>
  </div>
  `,
  styles: [`
    .home { min-height: 100vh; background: var(--bg); }
    .navbar { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); padding: 0 5%; display: flex; align-items: center; justify-content: space-between; height: 68px; }
    .nav-brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 20px; text-decoration: none; color: var(--text-primary); }
    .logo { width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; }
    .nav-links { display: flex; align-items: center; gap: 16px; }
    .nav-link { color: var(--text-secondary); text-decoration: none; font-weight: 500; font-size: 15px; }
    .nav-link:hover { color: var(--primary); }
    .hero { min-height: calc(100vh - 68px); display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 60px; padding: 60px 5%; max-width: 1280px; margin: 0 auto; }
    .hero-badge { display: inline-block; background: rgba(108,99,255,0.1); color: var(--primary); padding: 8px 18px; border-radius: 99px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
    h1 { font-size: clamp(32px, 4vw, 52px); line-height: 1.15; margin-bottom: 20px; }
    .gradient-text { background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-content p { font-size: 18px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 32px; max-width: 500px; }
    .hero-actions { display: flex; gap: 16px; margin-bottom: 36px; flex-wrap: wrap; }
    .btn-lg { padding: 15px 30px; font-size: 16px; }
    .hero-stats { display: flex; gap: 32px; }
    .stat strong { display: block; font-size: 22px; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); }
    .stat span { font-size: 13px; color: var(--text-secondary); }
    .hero-visual { display: flex; justify-content: center; }
    .mockup-phone { background: white; border-radius: 32px; box-shadow: 0 24px 64px rgba(108,99,255,0.2); overflow: hidden; width: 280px; border: 2px solid var(--border); }
    .phone-screen { background: #f8f7ff; }
    .phone-store-header { padding: 20px 16px; display: flex; align-items: center; gap: 12px; color: white; }
    .phone-logo { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
    .phone-store-header strong { display: block; font-size: 14px; }
    .phone-store-header small { font-size: 11px; opacity: 0.8; }
    .phone-products { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .phone-product { background: white; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .pp-img { width: 40px; height: 40px; background: var(--bg); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .pp-info span { display: block; font-size: 13px; font-weight: 500; }
    .pp-info strong { display: block; font-size: 12px; color: var(--primary); }
    .phone-cart { padding: 16px; }
    .phone-btn { width: 100%; background: var(--primary); color: white; border: none; border-radius: 12px; padding: 13px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .features-section { background: white; padding: 80px 5%; }
    .features-section h2, .stores-section h2 { text-align: center; font-size: clamp(24px, 3vw, 36px); margin-bottom: 48px; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
    .feature-card { text-align: center; padding: 32px 24px; border-radius: var(--radius-lg); border: 1px solid var(--border); transition: var(--transition); }
    .feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .feature-icon { font-size: 40px; margin-bottom: 16px; }
    .feature-card h3 { font-size: 18px; margin-bottom: 10px; }
    .feature-card p { color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
    .stores-section { padding: 80px 5%; }
    .stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
    .store-card { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border); text-decoration: none; transition: var(--transition); display: block; }
    .store-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .store-banner-sm { height: 80px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .store-banner-sm img { width: 100%; height: 100%; object-fit: cover; }
    .store-emoji { font-size: 32px; }
    .store-card-body { padding: 16px; position: relative; }
    .store-logo-sm { width: 44px; height: 44px; border-radius: 12px; border: 3px solid white; position: absolute; top: -22px; left: 16px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 16px; overflow: hidden; }
    .store-logo-sm img { width: 100%; height: 100%; object-fit: cover; }
    .store-card-body h4 { font-size: 15px; margin: 18px 0 6px; color: var(--text-primary); }
    .store-card-body p { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .product-count { font-size: 12px; color: var(--primary); font-weight: 600; }
    .cta-section { background: linear-gradient(135deg, #6C63FF, #4840ab); padding: 80px 5%; text-align: center; }
    .cta-content h2 { color: white; font-size: clamp(24px, 3vw, 36px); margin-bottom: 12px; }
    .cta-content p { color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 32px; }
    .cta-content .btn-primary { background: white; color: var(--primary); }
    .footer { background: #1a1a2e; padding: 24px 5%; text-align: center; }
    .footer p { color: rgba(255,255,255,0.5); font-size: 14px; }
    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; padding: 40px 5%; text-align: center; gap: 40px; }
      .hero-content p { max-width: 100%; }
      .hero-actions { justify-content: center; }
      .hero-stats { justify-content: center; }
      .hero-visual { order: -1; }
      .mockup-phone { width: 240px; }
      .nav-links .btn-primary { display: none; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  stores = signal<any[]>([]);
private sub!: Subscription;  

  mockProducts = [
    { emoji: '🧴', name: 'Lait de corps karité', price: '3 500 FCFA' },
    { emoji: '🌿', name: 'Huile de coco pure', price: '2 800 FCFA' },
    { emoji: '✨', name: 'Savon au beurre de karité', price: '1 500 FCFA' },
  ];

  features = [
    { icon: '🛍️', title: 'Boutique personnalisée', desc: 'URL unique, couleurs et logo à votre image' },
    { icon: '💳', title: 'Wave & Orange Money', desc: 'Paiements mobile money intégrés et sécurisés' },
    { icon: '📦', title: 'Gestion des stocks', desc: 'Suivez vos produits et recevez des alertes' },
    { icon: '📊', title: 'Dashboard complet', desc: 'Analysez vos ventes et commandes en temps réel' },
    { icon: '📱', title: '100% responsive', desc: "Fonctionne parfaitement sur mobile et ordinateur" },
    { icon: '🔔', title: 'Notifications', desc: 'Alertes instantanées à chaque nouvelle commande' },
  ];

  constructor(private storeService: StoreService, private polling: PollingService) {}

 ngOnInit() {
  this.sub = this.polling.poll<any>(
    `${environment.apiUrl}/public/stores`, 4000
  ).subscribe({
    next: (res) => this.stores.set(res.stores?.slice(0, 8) || []),
    error: () => {},
  });
}

ngOnDestroy() {
  this.sub.unsubscribe();
}
}
