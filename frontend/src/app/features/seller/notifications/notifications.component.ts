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

    <div class="empty" *ngIf="notifications().length === 0">
      <p>🔔 Aucune notification pour l'instant</p>
    </div>

    <div class="notif-list">
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

  constructor(private notifService: NotificationService) {}

  unread() { return this.notifications().filter(n => !n.isRead).length; }

  ngOnInit() { this.load(); }

  load() {
    this.notifService.getAll().subscribe({ next: (res) => this.notifications.set(res.notifications) });
  }

  markRead(n: any) {
    if (n.isRead) return;
    this.notifService.markRead(n.id).subscribe({ next: () => this.load() });
  }

  markAll() {
    this.notifService.markAllRead().subscribe({ next: () => this.load() });
  }
}
