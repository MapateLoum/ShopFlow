import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="auth-left">
      <div class="brand animate-fade-in">
        <div class="logo">SF</div>
        <h1>ShopFlow</h1>
        <p>Créez votre boutique en ligne en quelques minutes et commencez à vendre dès aujourd'hui.</p>
      </div>
      <div class="features">
        <div class="feature" *ngFor="let f of features">
          <span class="icon">{{f.icon}}</span>
          <div>
            <strong>{{f.title}}</strong>
            <p>{{f.desc}}</p>
          </div>
        </div>
      </div>
      <div class="floating-cards">
        <div class="fcard fcard-1">🛍️ Nouvelle commande !</div>
        <div class="fcard fcard-2">💰 +25 000 FCFA</div>
      </div>
    </div>

    <div class="auth-right">
      <div class="form-container animate-fade-in-up">
        <div class="step-indicator">
          <div class="step" [class.active]="step() >= 1" [class.done]="step() > 1">1</div>
          <div class="step-line" [class.done]="step() > 1"></div>
          <div class="step" [class.active]="step() >= 2" [class.done]="step() > 2">2</div>
          <div class="step-line" [class.done]="step() > 2"></div>
          <div class="step" [class.active]="step() >= 3">3</div>
        </div>

        <ng-container *ngIf="step() === 1">
          <h2>Vos informations</h2>
          <p class="subtitle">Commençons par vous connaître</p>
          <form [formGroup]="step1Form" (ngSubmit)="nextStep()">
            <div class="field">
              <label>Nom complet</label>
              <input formControlName="name" placeholder="Aminata Diallo" type="text">
            </div>
            <div class="field">
              <label>Email</label>
              <input formControlName="email" placeholder="aminata@gmail.com" type="email">
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input formControlName="phone" placeholder="+221 77 000 00 00" type="tel">
            </div>
            <div class="field">
              <label>Mot de passe</label>
              <div class="input-eye">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'" placeholder="Min. 8 caractères">
                <button type="button" class="eye-btn" (click)="showPwd.set(!showPwd())">
                  {{showPwd() ? '🙈' : '👁️'}}
                </button>
              </div>
            </div>
            <button class="btn-primary w-full" type="submit" [disabled]="step1Form.invalid">
              Continuer →
            </button>
          </form>
        </ng-container>

        <ng-container *ngIf="step() === 2">
          <h2>Votre boutique</h2>
          <p class="subtitle">Donnez une identité à votre boutique</p>
          <form [formGroup]="step2Form" (ngSubmit)="submit()">
            <div class="field">
              <label>Nom de la boutique</label>
              <input formControlName="storeName" placeholder="Aminata Cosmétiques" type="text">
            </div>
            <div class="field">
              <label>Description</label>
              <textarea formControlName="storeDescription" placeholder="Décrivez votre boutique..." rows="3"></textarea>
            </div>
            <div class="field">
              <label>Couleur principale</label>
              <div class="color-picker">
                <input formControlName="primaryColor" type="color" class="color-input">
                <span>{{step2Form.get('primaryColor')?.value}}</span>
              </div>
            </div>
            <div class="field">
              <label>Numéro Wave Business (optionnel)</label>
              <input formControlName="waveBusinessNumber" placeholder="+221 77 000 00 00" type="tel">
            </div>
            <div class="btn-row">
              <button class="btn-outline" type="button" (click)="step.set(1)">← Retour</button>
              <button class="btn-primary" type="submit" [disabled]="step2Form.invalid || loading()">
                {{loading() ? 'Envoi...' : 'Créer ma boutique 🚀'}}
              </button>
            </div>
          </form>
        </ng-container>

        <div class="login-link">
          Déjà un compte ? <a routerLink="/auth/login">Se connecter</a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; font-family: var(--font); }
    .auth-left {
      flex: 1; background: linear-gradient(135deg, #6C63FF 0%, #4840ab 50%, #4ECDC4 100%);
      padding: 60px 50px; display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow: hidden;
    }
    .auth-left::before {
      content: ''; position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .brand { position: relative; z-index: 1; margin-bottom: 48px; }
    .logo { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: white; margin-bottom: 16px; backdrop-filter: blur(10px); }
    .brand h1 { font-size: 32px; color: white; margin-bottom: 12px; }
    .brand p { color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; max-width: 360px; }
    .features { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 20px; }
    .feature { display: flex; gap: 16px; align-items: flex-start; }
    .feature .icon { font-size: 24px; flex-shrink: 0; }
    .feature strong { display: block; color: white; font-size: 15px; margin-bottom: 4px; }
    .feature p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 0; }
    .floating-cards { position: absolute; bottom: 40px; right: 40px; z-index: 1; }
    .fcard { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 12px 20px; color: white; font-size: 14px; font-weight: 600; margin-bottom: 10px; animation: float 3s ease-in-out infinite; }
    .fcard-2 { animation-delay: 1s; }
    .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; background: var(--bg); }
    .form-container { width: 100%; max-width: 480px; }
    .step-indicator { display: flex; align-items: center; margin-bottom: 36px; }
    .step { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--text-muted); transition: all 0.3s; flex-shrink: 0; }
    .step.active { border-color: var(--primary); background: var(--primary); color: white; }
    .step.done { border-color: var(--accent); background: var(--accent); color: white; }
    .step-line { flex: 1; height: 2px; background: var(--border); transition: background 0.3s; }
    .step-line.done { background: var(--accent); }
    h2 { font-size: 26px; margin-bottom: 6px; }
    .subtitle { color: var(--text-secondary); margin-bottom: 28px; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    .field input, .field textarea {
      width: 100%; padding: 13px 16px; border: 2px solid var(--border); border-radius: var(--radius-md);
      font-family: var(--font); font-size: 15px; color: var(--text-primary); background: white;
      transition: var(--transition); outline: none;
    }
    .field input:focus, .field textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(108,99,255,0.1); }
    .field textarea { resize: vertical; }
    .input-eye { position: relative; }
    .input-eye input { padding-right: 48px; }
    .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; }
    .color-picker { display: flex; align-items: center; gap: 12px; }
    .color-input { width: 48px; height: 48px; border: 2px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; padding: 4px; }
    .btn-row { display: flex; gap: 12px; margin-top: 24px; }
    .btn-row .btn-primary, .btn-row .btn-outline { flex: 1; justify-content: center; }
    .w-full { width: 100%; justify-content: center; margin-top: 8px; }
    .login-link { text-align: center; margin-top: 24px; color: var(--text-secondary); font-size: 14px; }
    .login-link a { color: var(--primary); font-weight: 600; text-decoration: none; }
    @media (max-width: 768px) {
      .auth-page { flex-direction: column; }
      .auth-left { padding: 40px 24px; min-height: 220px; }
      .floating-cards { display: none; }
      .features { display: none; }
    }
  `]
})
export class RegisterComponent {
  step = signal(1);
  loading = signal(false);
  showPwd = signal(false);
  sellerId = signal('');

  features = [
    { icon: '🛍️', title: 'Boutique personnalisée', desc: 'Votre propre URL et design unique' },
    { icon: '💳', title: 'Paiement Wave intégré', desc: 'Recevez vos paiements instantanément' },
    { icon: '📊', title: 'Dashboard complet', desc: 'Suivez vos ventes en temps réel' },
  ];

  step1Form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  step2Form = this.fb.group({
    storeName: ['', Validators.required],
    storeDescription: [''],
    primaryColor: ['#6C63FF'],
    waveBusinessNumber: [''],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  nextStep() {
    if (this.step1Form.valid) this.step.set(2);
  }

  submit() {
    if (this.step2Form.invalid) return;
    this.loading.set(true);
    const payload = { ...this.step1Form.value, ...this.step2Form.value };
    this.auth.register(payload).subscribe({
      next: (res: any) => {
        this.sellerId.set(res.sellerId);
        this.router.navigate(['/auth/verify-otp'], { queryParams: { sellerId: res.sellerId, type: 'register' } });
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Erreur lors de l\'inscription', '✕', { duration: 4000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }
}
