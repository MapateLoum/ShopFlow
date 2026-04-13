import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
// import { SellerLayoutComponent } from '../../../shared/components/seller-layout.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `

  <div class="products-page animate-fade-in">
    <div class="page-header">
      <div><h1>Mes produits</h1><p>{{products().length}} produit(s)</p></div>
      <button class="btn-primary" (click)="openModal()">+ Nouveau produit</button>
    </div>

    <!-- Grid produits -->
    <div class="products-grid" *ngIf="products().length > 0">
      <div class="product-card" *ngFor="let p of products()">
        <div class="product-img">
          <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.name">
          <div *ngIf="!p.imageUrl" class="no-img">📦</div>
          <span class="stock-badge" [class.low]="p.stock < 5" [class.out]="p.stock === 0">
            {{p.stock === 0 ? 'Rupture' : p.stock < 5 ? 'Stock faible' : 'En stock'}}
          </span>
        </div>
        <div class="product-info">
          <h3>{{p.name}}</h3>
          <p class="desc">{{p.description || 'Aucune description'}}</p>
          <div class="product-footer">
            <strong class="price">{{p.price.toLocaleString()}} FCFA</strong>
            <div class="actions">
              <button class="icon-btn edit" (click)="editProduct(p)" title="Modifier">✏️</button>
              <button class="icon-btn delete" (click)="deleteProduct(p.id)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="empty" *ngIf="products().length === 0 && !loading()">
      <div class="empty-icon">📦</div>
      <h3>Aucun produit</h3>
      <p>Ajoutez votre premier produit pour commencer à vendre</p>
      <button class="btn-primary" (click)="openModal()">+ Ajouter un produit</button>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{editMode() ? 'Modifier le produit' : 'Nouveau produit'}}</h2>
          <button class="close" (click)="closeModal()">✕</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="img-upload" (click)="fileInput.click()">
            <img *ngIf="previewUrl()" [src]="previewUrl()" class="preview">
            <div *ngIf="!previewUrl()" class="upload-placeholder">
              <span>📷</span>
              <p>Cliquez pour ajouter une photo</p>
            </div>
            <input #fileInput type="file" accept="image/*" (change)="onFileChange($event)" hidden>
          </div>
          <div class="field">
            <label>Nom du produit *</label>
            <input formControlName="name" placeholder="Ex: Lait de corps karité">
          </div>
          <div class="field">
            <label>Description</label>
            <textarea formControlName="description" placeholder="Décrivez votre produit..." rows="3"></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Prix (FCFA) *</label>
              <input formControlName="price" type="number" placeholder="0">
            </div>
            <div class="field">
              <label>Stock *</label>
              <input formControlName="stock" type="number" placeholder="0">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" (click)="closeModal()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
              {{saving() ? 'Enregistrement...' : editMode() ? 'Mettre à jour' : 'Ajouter'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  `,
  styles: [`
    .products-page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 24px; margin-bottom: 2px; }
    .page-header p { color: var(--text-secondary); font-size: 14px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .product-card { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border); transition: var(--transition); }
    .product-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
    .product-img { position: relative; height: 180px; background: var(--bg); }
    .product-img img { width: 100%; height: 100%; object-fit: cover; }
    .no-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .stock-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; background: #d1fae5; color: #065f46; }
    .stock-badge.low { background: #fef3c7; color: #d97706; }
    .stock-badge.out { background: #fee2e2; color: #991b1b; }
    .product-info { padding: 16px; }
    .product-info h3 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
    .desc { color: var(--text-secondary); font-size: 13px; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 16px; color: var(--primary); }
    .actions { display: flex; gap: 8px; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 18px; padding: 6px; border-radius: 8px; transition: var(--transition); }
    .icon-btn.edit:hover { background: rgba(108,99,255,0.1); }
    .icon-btn.delete:hover { background: #fee2e2; }
    .empty { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty h3 { font-size: 20px; margin-bottom: 8px; }
    .empty p { color: var(--text-secondary); margin-bottom: 24px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: white; border-radius: var(--radius-xl); width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px; border-bottom: 1px solid var(--border); }
    .modal-header h2 { font-size: 20px; }
    .close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary); }
    form { padding: 24px 28px; }
    .img-upload { border: 2px dashed var(--border); border-radius: var(--radius-md); height: 160px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 20px; overflow: hidden; transition: var(--transition); }
    .img-upload:hover { border-color: var(--primary); }
    .preview { width: 100%; height: 100%; object-fit: cover; }
    .upload-placeholder { text-align: center; color: var(--text-secondary); }
    .upload-placeholder span { font-size: 32px; display: block; margin-bottom: 8px; }
    .upload-placeholder p { font-size: 14px; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .field input, .field textarea { width: 100%; padding: 12px 14px; border: 2px solid var(--border); border-radius: var(--radius-md); font-family: var(--font); font-size: 14px; outline: none; transition: var(--transition); }
    .field input:focus, .field textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<any[]>([]);
  showModal = signal(false);
  editMode = signal(false);
  saving = signal(false);
  loading = signal(false);
  previewUrl = signal<string | null>(null);
  editId = signal<string | null>(null);
  selectedFile: File | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(private fb: FormBuilder, private productService: ProductService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.productService.getMyProducts().subscribe({
      next: (res) => { this.products.set(res.products); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openModal() { this.showModal.set(true); this.editMode.set(false); this.form.reset({ price: 0, stock: 0 }); this.previewUrl.set(null); this.selectedFile = null; }

  editProduct(p: any) {
    this.editMode.set(true);
    this.editId.set(p.id);
    this.form.patchValue({ name: p.name, description: p.description, price: p.price, stock: p.stock });
    this.previewUrl.set(p.imageUrl);
    this.selectedFile = null;
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const obs = this.editMode() ? this.productService.updateProduct(this.editId()!, fd) : this.productService.createProduct(fd);
    obs.subscribe({
      next: () => {
        this.snack.open(this.editMode() ? 'Produit mis à jour' : 'Produit ajouté !', '✓', { duration: 3000, panelClass: 'snack-success' });
        this.closeModal();
        this.load();
        this.saving.set(false);
      },
      error: () => { this.snack.open('Erreur lors de l\'enregistrement', '✕', { duration: 3000, panelClass: 'snack-error' }); this.saving.set(false); },
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => { this.snack.open('Produit supprimé', '', { duration: 2000 }); this.load(); },
    });
  }
}
