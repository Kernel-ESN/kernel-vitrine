import { Routes } from '@angular/router';
import { requireUser } from '@features/auth/auth.guard';
import { SITE_TITLE } from '@core/config/site-info';

export const EMPLOYER_ROUTES: Routes = [
  {
    path: 'employeur',
    pathMatch: 'full',
    title: `Espace employeur | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    canActivate: [requireUser('EMPLOYEUR')],
    loadComponent: () => import('./pages/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'employeur/publier',
    title: `Publier une annonce | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    canActivate: [requireUser('EMPLOYEUR')],
    loadComponent: () => import('./pages/publish.component').then((m) => m.PublishComponent),
  },
];
