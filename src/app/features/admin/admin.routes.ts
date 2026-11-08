import { Routes } from '@angular/router';
import { SITE_TITLE } from '@core/config/site-info';
import { requireUser } from '@features/auth/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'moderation',
    title: `Modération | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    canActivate: [requireUser('ADMIN')],
    loadComponent: () => import('./pages/moderation.component').then((m) => m.ModerationComponent),
  },
];
