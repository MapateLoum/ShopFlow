import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="page">
    <div class="card animate-fade-in-up">
      <div class="logo">⚙️</div>
      <h2>Espace Admin</h2>
      <p>Accès réservé à l'équipe ShopFlow</p>
      <form [formGroup]="form" (ngSubmit)="login()">
        <div class="field">
          <label>Email admin</label>
          <input formControlName="email" type="email" placeholder="admin@shopflow.sn">
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input formControlName="password" type="password" placeholder="••••••••">
        </div>
        <button class="btn-primary w-full" type="submit" [disabled]="form.invalid || loading()">
          {{loading() ? 'Connexion...' : 'Accéder au dashboard'}}
        </button>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a1a2e; padding: 20px; }
    .card { background: white; border-radius: var(--radius-xl); padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .logo { font-size: 48px; margin-bottom: 16px; }
    h2 { font-size: 24px; margin-bottom: 6px; }
    p { color: var(--text-secondary); margin-bottom: 32px; }
    .field { margin-bottom: 18px; text-align: left; }
    .field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .field input { width: 100%; padding: 13px 16px; border: 2px solid var(--border); border-radius: var(--radius-md); font-size: 15px; outline: none; transition: var(--transition); font-family: var(--font); }
    .field input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(108,99,255,0.1); }
    .w-full { width: 100%; justify-content: center; }
  `]
})
export class AdminLoginComponent {
  loading = signal(false);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  login() {
    this.loading.set(true);
    this.auth.adminLogin(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err) => {
        this.snack.open(err.error?.message || 'Identifiants incorrects', '✕', { duration: 3000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }
}
