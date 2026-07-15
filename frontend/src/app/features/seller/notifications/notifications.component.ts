import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
// import { SellerLayoutComponent } from '../../../shared/components/seller-layout.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `

  <div class="notif-page animate-fade-in">
    <div class="page-header">
      <div><h1>Notifications</h1><p>{{unread()}} non lue(s)</p></div>
      <button class="btn-outline" (click)="markAll()" *ngIf="unread() > 0">Tout marquer comme lu</button>
    </div>

    <div class="error-banner" *ngIf="loadError()">
      ⚠️ Impossible de charger les notifications.
      <button (click)="load()">Réessayer</button>
    </div>

    <div class="empty" *ngIf="!loading() && !loadError() && notifications().length === 0">
      <p>🔔 Aucune notification pour l'instant</p>
    </div>

    <div class="notif-list" *ngIf="!loadError()">
      <div class="notif-item" *ngFor="let n of notifications()" [class.unread]="!n.isRead" (click)="markRead(n)">
        <div class="notif-icon">{{n.type === 'NEW_ORDER' ? '🛒' : '📢'}}</div>
        <div class="notif-body">
          <p>{{n.message}}</p>
          <small>{{n.createdAt | date:'dd/MM/yyyy à HH:mm'}}</small>
        </div>
        <div class="notif-dot" *ngIf="!n.isRead"></div>
      </div>
    </div>
  </div>

  `,
  styles: [`
    .notif-page { max-width: 700px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 24px; margin-bottom: 2px; }
    .page-header p { color: var(--text-secondary); font-size: 14px; }
    .empty { text-align: center; padding: 60px; color: var(--text-secondary); }
    .error-banner { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 14px; }
    .error-banner button { background: #991b1b; color: white; border: none; border-radius: 8px; padding: 6px 14px; font-size: 13px; cursor: pointer; flex-shrink: 0; }
    .notif-list { display: flex; flex-direction: column; gap: 8px; }
    .notif-item { display: flex; align-items: center; gap: 16px; background: white; border-radius: var(--radius-md); padding: 16px 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); cursor: pointer; transition: var(--transition); position: relative; }
    .notif-item:hover { box-shadow: var(--shadow-md); }
    .notif-item.unread { border-left: 3px solid var(--primary); background: rgba(108,99,255,0.03); }
    .notif-icon { font-size: 24px; flex-shrink: 0; }
    .notif-body { flex: 1; }
    .notif-body p { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
    .notif-body small { color: var(--text-secondary); font-size: 12px; }
    .notif-dot { width: 10px; height: 10px; background: var(--primary); border-radius: 50%; flex-shrink: 0; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<any[]>([]);
  loading = signal(true);
  loadError = signal(false);

  constructor(private notifService: NotificationService) {}

  unread() { return this.notifications().filter(n => !n.isRead).length; }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.loadError.set(false);
    this.notifService.getAll().subscribe({
      next: (res) => { this.notifications.set(res.notifications); this.loading.set(false); },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  markRead(n: any) {
    if (n.isRead) return;
    this.notifService.markRead(n.id).subscribe({ next: () => this.load() });
  }

  markAll() {
    this.notifService.markAllRead().subscribe({ next: () => this.load() });
  }
}