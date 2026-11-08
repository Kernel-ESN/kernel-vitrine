import { Route, Routes } from '@angular/router';
import { requireUser } from '@features/auth/auth.guard';
import { UNIVERSES } from '@features/listings/models/listing';
import { SITE_TITLE } from '@core/config/site-info';
import { applyListingResolver } from './state/apply-listing.resolver';

export const ACCOUNT_ROUTES: Routes = [
  ...UNIVERSES.map((universe): Route => ({
    path: `${universe.path}/:slug/postuler`,
    title: `Postuler | ${SITE_TITLE}`,
    data: { universe: universe.id, robots: 'noindex' },
    canActivate: [requireUser()],
    resolve: { listing: applyListingResolver },
    loadComponent: () => import('./pages/apply.component').then((m) => m.ApplyComponent),
  })),
  {
    path: 'compte',
    title: `Mon compte | ${SITE_TITLE}`,
    data: { robots: 'noindex' },
    canActivate: [requireUser()],
    loadComponent: () => import('./pages/account.component').then((m) => m.AccountComponent),
  },
];
