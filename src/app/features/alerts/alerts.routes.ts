import { Routes } from '@angular/router';
import { requireUser } from '../auth/auth.guard';
import { SITE_TITLE } from '@core/config/site-info';

export const ALERTS_ROUTES: Routes = [
  {
    path: 'alertes',
    pathMatch: 'full',
    title: `Mes alertes | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    canActivate: [requireUser()],
    loadComponent: () => import('./pages/alerts-list.component').then((m) => m.AlertsListComponent),
  },
  {
    path: 'alertes/nouvelle',
    title: `Nouvelle alerte | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    canActivate: [requireUser()],
    loadComponent: () => import('./pages/alert-new.component').then((m) => m.AlertNewComponent),
  },
];
