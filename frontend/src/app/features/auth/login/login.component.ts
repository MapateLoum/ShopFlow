import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="auth-left">
      <div class="brand">
        <div class="logo">SF</div>
        <h1>ShopFlow</h1>
        <p>Gérez votre boutique, vos produits et vos commandes depuis un seul endroit.</p>
      </div>
      <div class="mockup">
        <div class="mockup-card">
          <div class="mockup-stat"><span>💰</span><div><small>Revenus du jour</small><strong>47 500 FCFA</strong></div></div>
        </div>
        <div class="mockup-card">
          <div class="mockup-stat"><span>📦</span><div><small>Commandes</small><strong>12 nouvelles</strong></div></div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="form-container animate-fade-in-up">
        <h2>Bon retour ! 👋</h2>
        <p class="subtitle">Connectez-vous à votre espace vendeur</p>

        <form [formGroup]="form" (ngSubmit)="login()">
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="votre@email.com">
          </div>
          <div class="field">
            <label>Mot de passe</label>
            <div class="input-eye">
              <input formControlName="password" [type]="showPwd() ? 'text' : 'password'" placeholder="••••••••">
              <button type="button" class="eye-btn" (click)="showPwd.set(!showPwd())">{{showPwd() ? '🙈' : '👁️'}}</button>
            </div>
          </div>
          <div class="forgot">
            <a routerLink="/auth/forgot-password">Mot de passe oublié ?</a>
          </div>
          <button class="btn-primary w-full" type="submit" [disabled]="form.invalid || loading()">
            {{loading() ? 'Connexion...' : 'Se connecter →'}}
          </button>
        </form>

        <div class="register-link">
          Pas encore de boutique ? <a routerLink="/auth/register">Créer ma boutique</a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; }
    .auth-left { flex: 1; background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 60px 50px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
    .brand { position: relative; z-index: 1; margin-bottom: 48px; }
    .logo { width: 56px; height: 56px; background: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: white; margin-bottom: 16px; }
    .brand h1 { font-size: 32px; color: white; margin-bottom: 12px; }
    .brand p { color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.6; max-width: 360px; }
    .mockup { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }
    .mockup-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 20px 24px; backdrop-filter: blur(10px); }
    .mockup-stat { display: flex; align-items: center; gap: 16px; font-size: 24px; }
    .mockup-stat small { display: block; color: rgba(255,255,255,0.5); font-size: 12px; }
    .mockup-stat strong { display: block; color: white; font-size: 18px; }
    .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; background: var(--bg); }
    .form-container { width: 100%; max-width: 440px; }
    h2 { font-size: 28px; margin-bottom: 6px; }
    .subtitle { color: var(--text-secondary); margin-bottom: 32px; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .field input { width: 100%; padding: 13px 16px; border: 2px solid var(--border); border-radius: var(--radius-md); font-family: var(--font); font-size: 15px; outline: none; transition: var(--transition); }
    .field input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(108,99,255,0.1); }
    .input-eye { position: relative; }
    .input-eye input { padding-right: 48px; }
    .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; }
    .forgot { text-align: right; margin-bottom: 20px; }
    .forgot a { color: var(--primary); font-size: 14px; text-decoration: none; font-weight: 500; }
    .w-full { width: 100%; justify-content: center; }
    .register-link { text-align: center; margin-top: 24px; color: var(--text-secondary); font-size: 14px; }
    .register-link a { color: var(--primary); font-weight: 600; text-decoration: none; }
    @media (max-width: 768px) { .auth-page { flex-direction: column; } .auth-left { padding: 40px 24px; min-height: 200px; } }
  `]
})
export class LoginComponent {
  loading = signal(false);
  showPwd = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  login() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/seller/dashboard']),
      error: (err) => {
        this.snack.open(err.error?.message || 'Identifiants incorrects', '✕', { duration: 4000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }
}
