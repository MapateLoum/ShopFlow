import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { sellerGuard } from './core/guards/seller.guard';
import { adminGuard } from './core/guards/admin.guard';
import { SellerLayoutComponent } from './shared/components/seller-layout.component'; // ← ajouter

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) },
  { path: 'boutique/:slug', loadComponent: () => import('./features/public/store/store.component').then(m => m.StoreComponent) },

  // Auth
  { path: 'auth', children: [
    { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    { path: 'verify-otp', loadComponent: () => import('./features/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent) },
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'admin/login', loadComponent: () => import('./features/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
  ]},

  // Seller dashboard ← component: SellerLayoutComponent ajouté ici
  { path: 'seller', component: SellerLayoutComponent, canActivate: [sellerGuard], children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadComponent: () => import('./features/seller/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'products', loadComponent: () => import('./features/seller/products/products.component').then(m => m.ProductsComponent) },
    { path: 'orders', loadComponent: () => import('./features/seller/orders/orders.component').then(m => m.OrdersComponent) },
    { path: 'store-settings', loadComponent: () => import('./features/seller/store-settings/store-settings.component').then(m => m.StoreSettingsComponent) },
    { path: 'notifications', loadComponent: () => import('./features/seller/notifications/notifications.component').then(m => m.NotificationsComponent) },
  ]},

  // Admin
  { path: 'admin', canActivate: [adminGuard], children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
    { path: 'sellers', loadComponent: () => import('./features/admin/sellers/admin-sellers.component').then(m => m.AdminSellersComponent) },
  ]},

  { path: '**', redirectTo: '' },
];