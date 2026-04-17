import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreService } from '../../../core/services/store.service';
// import { SellerLayoutComponent } from '../../../shared/components/seller-layout.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `

  <div class="settings-page animate-fade-in">
    <div class="page-header">
      <div><h1>Ma boutique</h1><p>Personnalisez votre espace de vente</p></div>
      <a [href]="storeUrl()" target="_blank" class="btn-outline" *ngIf="store()">Voir ma boutique →</a>
    </div>

    <div class="settings-grid" *ngIf="store()">
      <!-- Preview carte -->
      <div class="preview-card" [style.--store-color]="form.get('primaryColor')?.value">
        <div class="store-banner-wrap">
          <div class="store-banner" [style.background]="form.get('primaryColor')?.value + '33'">
            <img *ngIf="bannerPreview() || store()?.bannerUrl" [src]="bannerPreview() || store()?.bannerUrl" class="banner-img">
            <div *ngIf="!bannerPreview() && !store()?.bannerUrl" class="banner-placeholder">🏪</div>
          </div>
          <div class="store-logo-wrap">
            <div class="store-logo" [style.background]="form.get('primaryColor')?.value">
              <img *ngIf="logoPreview() || store()?.logoUrl" [src]="logoPreview() || store()?.logoUrl" class="logo-img">
              <span *ngIf="!logoPreview() && !store()?.logoUrl">{{store()?.name?.charAt(0)}}</span>
            </div>
          </div>
        </div>
        <div class="store-preview-info">
          <strong>{{form.get('name')?.value || store()?.name}}</strong>
          <p>{{form.get('description')?.value || store()?.description || 'Description de la boutique'}}</p>
          <small class="store-url">shopflow.sn/boutique/{{store()?.slug}}</small>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="save()">
          <h3>Informations générales</h3>

          <div class="field">
            <label>Nom de la boutique</label>
            <input formControlName="name" placeholder="Nom de votre boutique">
          </div>
          <div class="field">
            <label>Description</label>
            <textarea formControlName="description" rows="3" placeholder="Décrivez votre boutique..."></textarea>
          </div>
          <div class="field">
            <label>Numéro Wave Business</label>
            <input formControlName="waveBusinessNumber" placeholder="+221 77 000 00 00" type="tel">
          </div>
          <div class="field">
            <label>Couleur principale</label>
            <div class="color-row">
              <input formControlName="primaryColor" type="color" class="color-input">
              <div class="color-presets">
                <div *ngFor="let c of colorPresets" class="color-dot" [style.background]="c" (click)="form.patchValue({primaryColor: c})" [class.selected]="form.get('primaryColor')?.value === c"></div>
              </div>
            </div>
          </div>

          <h3 style="margin-top:24px">Médias</h3>
          <div class="media-row">
            <div class="media-upload" (click)="logoInput.click()">
              <img *ngIf="logoPreview() || store()?.logoUrl" [src]="logoPreview() || store()?.logoUrl" class="media-preview">
              <div *ngIf="!logoPreview() && !store()?.logoUrl" class="upload-ph"><span>🖼️</span><p>Logo</p></div>
              <input #logoInput type="file" accept="image/*" (change)="onLogo($event)" hidden>
            </div>
            <div class="media-upload banner-upload" (click)="bannerInput.click()">
              <img *ngIf="bannerPreview() || store()?.bannerUrl" [src]="bannerPreview() || store()?.bannerUrl" class="media-preview">
              <div *ngIf="!bannerPreview() && !store()?.bannerUrl" class="upload-ph"><span>🖼️</span><p>Bannière</p></div>
              <input #bannerInput type="file" accept="image/*" (change)="onBanner($event)" hidden>
            </div>
          </div>

          <button class="btn-primary w-full" type="submit" [disabled]="saving()">
            {{saving() ? 'Enregistrement...' : 'Enregistrer les modifications'}}
          </button>
        </form>
      </div>
    </div>
  </div>

  `,
  styles: [`
    .settings-page { max-width: 1000px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 24px; margin-bottom: 2px; }
    .page-header p { color: var(--text-secondary); font-size: 14px; }
    .settings-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
    .preview-card { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border); height: fit-content; position: sticky; top: 80px; }

    /* ✅ CORRECTION : wrapper relatif pour positionner le logo sur la bannière */
    .store-banner-wrap { position: relative; padding-bottom: 40px; }
    .store-banner { height: 120px; position: relative; overflow: hidden; }
    .banner-img { width: 100%; height: 100%; object-fit: cover; }
    .banner-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; }
    .store-logo-wrap { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); }
    .store-logo { width: 64px; height: 64px; border-radius: 16px; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: white; overflow: hidden; }
    .logo-img { width: 100%; height: 100%; object-fit: cover; }

    .store-preview-info { padding: 16px; text-align: center; }
    .store-preview-info strong { display: block; font-size: 16px; margin-bottom: 6px; }
    .store-preview-info p { color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; }
    .store-url { color: var(--primary); font-size: 12px; }
    .form-card { background: white; border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    h3 { font-size: 16px; margin-bottom: 16px; color: var(--text-primary); }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .field input, .field textarea { width: 100%; padding: 12px 14px; border: 2px solid var(--border); border-radius: var(--radius-md); font-family: var(--font); font-size: 14px; outline: none; transition: var(--transition); }
    .field input:focus, .field textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
    .color-row { display: flex; align-items: center; gap: 16px; }
    .color-input { width: 52px; height: 52px; border: 2px solid var(--border); border-radius: var(--radius-md); cursor: pointer; padding: 4px; }
    .color-presets { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; transition: var(--transition); border: 3px solid transparent; }
    .color-dot.selected { border-color: white; box-shadow: 0 0 0 2px currentColor; }
    .media-row { display: grid; grid-template-columns: 100px 1fr; gap: 12px; margin-bottom: 20px; }
    .media-upload { border: 2px dashed var(--border); border-radius: var(--radius-md); cursor: pointer; overflow: hidden; transition: var(--transition); display: flex; align-items: center; justify-content: center; height: 100px; }
    .media-upload:hover { border-color: var(--primary); }
    .banner-upload { height: 100px; }
    .media-preview { width: 100%; height: 100%; object-fit: cover; }
    .upload-ph { text-align: center; color: var(--text-secondary); }
    .upload-ph span { font-size: 24px; display: block; margin-bottom: 4px; }
    .upload-ph p { font-size: 12px; }
    .w-full { width: 100%; justify-content: center; margin-top: 8px; }
    @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .preview-card { position: static; } }
  `]
})
export class StoreSettingsComponent implements OnInit {
  store = signal<any>(null);
  saving = signal(false);
  logoPreview = signal<string | null>(null);
  bannerPreview = signal<string | null>(null);
  logoFile: File | null = null;
  bannerFile: File | null = null;

  colorPresets = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F97316'];

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    primaryColor: ['#6C63FF'],
    waveBusinessNumber: [''],
  });

  constructor(private fb: FormBuilder, private storeService: StoreService, private snack: MatSnackBar) {}

  storeUrl() { return `${environment.apiUrl.replace('/api', '')}/boutique/${this.store()?.slug}`; }

  ngOnInit() {
    this.storeService.getMyStore().subscribe({
      next: (res) => {
        this.store.set(res.store);
        this.form.patchValue({
          name: res.store.name,
          description: res.store.description,
          primaryColor: res.store.primaryColor,
          waveBusinessNumber: res.store.waveBusinessNumber,
        });
      },
    });
  }

  onLogo(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) { this.logoFile = f; const r = new FileReader(); r.onload = () => this.logoPreview.set(r.result as string); r.readAsDataURL(f); }
  }

  onBanner(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) { this.bannerFile = f; const r = new FileReader(); r.onload = () => this.bannerPreview.set(r.result as string); r.readAsDataURL(f); }
  }

  save() {
    this.saving.set(true);
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    if (this.logoFile) fd.append('logo', this.logoFile);
    if (this.bannerFile) fd.append('banner', this.bannerFile);
    this.storeService.updateStore(fd).subscribe({
      next: (res) => {
        this.store.set(res.store);
        this.snack.open('Boutique mise à jour !', '✓', { duration: 3000, panelClass: 'snack-success' });
        this.saving.set(false);
      },
      error: () => { this.snack.open('Erreur', '✕', { duration: 2000, panelClass: 'snack-error' }); this.saving.set(false); },
    });
  }
}