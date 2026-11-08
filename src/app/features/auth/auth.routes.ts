import { Routes } from '@angular/router';
import { SITE_TITLE } from '@core/config/site-info';

export const AUTH_ROUTES: Routes = [
  {
    path: 'connexion',
    title: `Connexion | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'inscription',
    title: `Créer un compte | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    loadComponent: () => import('./pages/register.component').then((m) => m.RegisterComponent),
  },
];
