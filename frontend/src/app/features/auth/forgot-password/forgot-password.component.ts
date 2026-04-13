import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="card animate-fade-in-up">
      <a routerLink="/auth/login" class="back">← Retour</a>

      <ng-container *ngIf="step() === 'email'">
        <div class="icon">🔐</div>
        <h2>Mot de passe oublié</h2>
        <p>Entrez votre email et nous vous enverrons un code de réinitialisation.</p>
        <form [formGroup]="emailForm" (ngSubmit)="sendOtp()">
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="votre@email.com">
          </div>
          <button class="btn-primary w-full" type="submit" [disabled]="emailForm.invalid || loading()">
            {{loading() ? 'Envoi...' : 'Envoyer le code'}}
          </button>
        </form>
      </ng-container>

      <ng-container *ngIf="step() === 'reset'">
        <div class="icon">🔑</div>
        <h2>Nouveau mot de passe</h2>
        <p>Créez un nouveau mot de passe sécurisé pour votre compte.</p>
        <form [formGroup]="resetForm" (ngSubmit)="reset()">
          <div class="field">
            <label>Nouveau mot de passe</label>
            <input formControlName="newPassword" type="password" placeholder="Min. 8 caractères">
          </div>
          <div class="field">
            <label>Confirmer le mot de passe</label>
            <input formControlName="confirm" type="password" placeholder="Répétez le mot de passe">
          </div>
          <button class="btn-primary w-full" type="submit" [disabled]="resetForm.invalid || loading()">
            {{loading() ? 'Réinitialisation...' : 'Réinitialiser'}}
          </button>
        </form>
      </ng-container>
    </div>
  </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 20px; }
    .card { background: white; border-radius: var(--radius-xl); padding: 48px 40px; max-width: 440px; width: 100%; box-shadow: var(--shadow-lg); }
    .back { color: var(--text-secondary); text-decoration: none; font-size: 14px; display: block; margin-bottom: 24px; }
    .back:hover { color: var(--primary); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h2 { font-size: 24px; margin-bottom: 8px; }
    p { color: var(--text-secondary); margin-bottom: 28px; line-height: 1.6; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .field input { width: 100%; padding: 13px 16px; border: 2px solid var(--border); border-radius: var(--radius-md); font-family: var(--font); font-size: 15px; outline: none; transition: var(--transition); }
    .field input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(108,99,255,0.1); }
    .w-full { width: 100%; justify-content: center; }
  `]
})
export class ForgotPasswordComponent {
  step = signal<'email' | 'reset'>('email');
  loading = signal(false);
  sellerId = '';
  resetToken = '';

  emailForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute, private snack: MatSnackBar) {
    const s = this.route.snapshot.queryParams['step'];
    const token = this.route.snapshot.queryParams['resetToken'];
    if (s === 'reset' && token) { this.resetToken = token; this.step.set('reset'); }
  }

  sendOtp() {
    this.loading.set(true);
    this.auth.forgotPassword(this.emailForm.value.email!).subscribe({
      next: (res: any) => {
        this.sellerId = res.sellerId;
        this.router.navigate(['/auth/verify-otp'], { queryParams: { sellerId: res.sellerId, type: 'reset' } });
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Email introuvable', '✕', { duration: 3000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }

  reset() {
    const { newPassword, confirm } = this.resetForm.value;
    if (newPassword !== confirm) {
      this.snack.open('Les mots de passe ne correspondent pas', '✕', { duration: 3000, panelClass: 'snack-error' });
      return;
    }
    this.loading.set(true);
    this.auth.resetPassword({ resetToken: this.resetToken, newPassword: newPassword! }).subscribe({
      next: () => {
        this.snack.open('Mot de passe réinitialisé !', '✓', { duration: 3000, panelClass: 'snack-success' });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Erreur', '✕', { duration: 3000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }
}
