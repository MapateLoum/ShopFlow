import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="otp-page">
    <div class="otp-card animate-fade-in-up">
      <div class="icon-wrap">📬</div>
      <h2>Vérifiez votre email</h2>
      <p>Nous avons envoyé un code à 6 chiffres à <strong>votre adresse email</strong>. Il expire dans <strong>10 minutes</strong>.</p>

      <div class="otp-inputs">
        <input *ngFor="let i of [0,1,2,3,4,5]"
          type="text" maxlength="1" class="otp-input"
          [id]="'otp-'+i"
          (input)="onInput($event, i)"
          (keydown)="onKeydown($event, i)"
          (paste)="onPaste($event)">
      </div>

      <button class="btn-primary w-full" (click)="verify()" [disabled]="loading() || otpValue().length < 6">
        {{loading() ? 'Vérification...' : 'Confirmer le code ✓'}}
      </button>

      <div class="resend">
        Code non reçu ?
        <button class="link-btn" (click)="resend()" [disabled]="countdown() > 0">
          {{countdown() > 0 ? 'Renvoyer dans ' + countdown() + 's' : 'Renvoyer'}}
        </button>
      </div>

      <a class="back-link" (click)="goBack()">← Retour</a>
    </div>
  </div>
  `,
  styles: [`
    .otp-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 20px; }
    .otp-card { background: white; border-radius: var(--radius-xl); padding: 48px 40px; max-width: 440px; width: 100%; text-align: center; box-shadow: var(--shadow-lg); }
    .icon-wrap { font-size: 48px; margin-bottom: 20px; }
    h2 { font-size: 24px; margin-bottom: 12px; }
    p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 36px; }
    .otp-inputs { display: flex; gap: 12px; justify-content: center; margin-bottom: 28px; }
    .otp-input {
      width: 52px; height: 60px; border: 2px solid var(--border); border-radius: var(--radius-md);
      text-align: center; font-size: 24px; font-weight: 700; color: var(--primary);
      outline: none; transition: var(--transition); font-family: var(--font);
    }
    .otp-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(108,99,255,0.1); }
    .w-full { width: 100%; justify-content: center; }
    .resend { margin-top: 20px; color: var(--text-secondary); font-size: 14px; }
    .link-btn { background: none; border: none; color: var(--primary); font-weight: 600; cursor: pointer; padding: 0 4px; }
    .link-btn:disabled { color: var(--text-muted); cursor: not-allowed; }
    .back-link { display: block; margin-top: 16px; color: var(--text-secondary); font-size: 14px; cursor: pointer; }
    .back-link:hover { color: var(--primary); }
    @media (max-width: 480px) {
      .otp-card { padding: 32px 20px; }
      .otp-input { width: 44px; height: 52px; font-size: 20px; }
    }
  `]
})
export class VerifyOtpComponent implements OnInit {
  loading = signal(false);
  otpValue = signal('');
  countdown = signal(60);
  sellerId = '';
  type = 'register';
  private timer: any;

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.sellerId = this.route.snapshot.queryParams['sellerId'];
    this.type = this.route.snapshot.queryParams['type'] || 'register';
    this.startCountdown();
  }

  startCountdown() {
    this.countdown.set(60);
    this.timer = setInterval(() => {
      this.countdown.update(v => v > 0 ? v - 1 : 0);
      if (this.countdown() === 0) clearInterval(this.timer);
    }, 1000);
  }

  onInput(e: Event, i: number) {
    const input = e.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '');
    input.value = val;
    this.collectOtp();
    if (val && i < 5) {
      (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
    }
  }

  onKeydown(e: KeyboardEvent, i: number) {
    if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && i > 0) {
      (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus();
    }
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
    text.split('').forEach((c, i) => {
      const inp = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (inp) inp.value = c;
    });
    this.collectOtp();
  }

  collectOtp() {
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += (document.getElementById(`otp-${i}`) as HTMLInputElement)?.value || '';
    }
    this.otpValue.set(otp);
  }

  verify() {
    this.loading.set(true);
    const payload = { sellerId: this.sellerId, otp: this.otpValue() };
    const obs = this.type === 'register' ? this.auth.verifyOtp(payload) : this.auth.verifyResetOtp(payload);
    obs.subscribe({
      next: (res: any) => {
        if (this.type === 'register') {
          this.snack.open('Compte vérifié ! En attente de validation admin.', '✓', { duration: 5000, panelClass: 'snack-success' });
          this.router.navigate(['/auth/login']);
        } else {
          this.router.navigate(['/auth/forgot-password'], { queryParams: { resetToken: res.resetToken, step: 'reset' } });
        }
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Code incorrect', '✕', { duration: 3000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }

  resend() {
    this.snack.open('Fonctionnalité de renvoi à implémenter selon votre config mail', '', { duration: 3000 });
    this.startCountdown();
  }

  goBack() { window.history.back(); }
}
