import { inject } from '@angular/core';
import { Routes, CanActivateFn, Router } from '@angular/router';
import { Store } from './store';
const admin: CanActivateFn = async () => {
  const s = inject(Store),
    router = inject(Router);
  await s.ready;
  return s.user()?.role === 'admin'
    ? true
    : router.createUrlTree(['/connexion'], { queryParams: { retour: '/admin', admin: 'true' } });
};
const shop = () => import('./pages/shop/shop').then((m) => m.Shop);
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  {
    path: 'produits',
    loadComponent: () => import('./pages/catalogue/catalogue').then((m) => m.Catalogue),
  },
  { path: 'produits/:id', loadComponent: shop, data: { view: 'product' } },
  { path: 'panier', loadComponent: shop, data: { view: 'cart' } },
  { path: 'commande', loadComponent: shop, data: { view: 'checkout' } },
  { path: 'boutique', loadComponent: shop, data: { view: 'location' } },
  { path: 'connexion', loadComponent: () => import('./pages/auth/auth').then((m) => m.Auth) },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    canActivate: [admin],
  },
  { path: 'compte', redirectTo: 'panier', pathMatch: 'full' },
  { path: 'inscription', redirectTo: 'produits', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
