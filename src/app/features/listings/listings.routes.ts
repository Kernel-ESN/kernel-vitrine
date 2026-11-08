import { Route, Routes } from '@angular/router';
import { SITE_TITLE } from '@core/config/site-info';
import { UNIVERSES } from './models/listing';
import { listingDetailResolver } from './state/listing-detail.resolver';
import { organizationResolver } from './state/organization.resolver';

/** Tant que les annonces sont fictives, rien de la plateforme n'est indexé. */
const robots = 'noindex';

const universeRoutes: Routes = UNIVERSES.flatMap((universe): Route[] => [
  {
    path: universe.path,
    pathMatch: 'full',
    title: `${universe.label} | ${SITE_TITLE}`,
    data: { universe: universe.id, robots, description: `${universe.label} au Niger.` },
    loadComponent: () =>
      import('./pages/listing-list.component').then((m) => m.ListingListComponent),
  },
  {
    path: `${universe.path}/:slug`,
    title: `${universe.label} | ${SITE_TITLE}`,
    data: { universe: universe.id, robots },
    resolve: { detail: listingDetailResolver },
    loadComponent: () =>
      import('./pages/listing-detail.component').then((m) => m.ListingDetailComponent),
  },
]);

export const LISTINGS_ROUTES: Routes = [
  {
    path: 'annonces',
    pathMatch: 'full',
    title: SITE_TITLE,
    data: { robots, description: 'Offres d’emploi, appels d’offres et appels à projets au Niger.' },
    loadComponent: () =>
      import('./pages/platform-home.component').then((m) => m.PlatformHomeComponent),
  },
  {
    path: 'annonces/recherche',
    title: `Recherche | ${SITE_TITLE}`,
    data: { robots },
    loadComponent: () =>
      import('./pages/listing-list.component').then((m) => m.ListingListComponent),
  },
  {
    path: 'organisations',
    pathMatch: 'full',
    title: `Organisations | ${SITE_TITLE}`,
    data: { robots, description: 'Les organisations qui publient des annonces au Niger.' },
    loadComponent: () =>
      import('./pages/organization-list.component').then((m) => m.OrganizationListComponent),
  },
  {
    path: 'organisations/:slug',
    title: `Organisations | ${SITE_TITLE}`,
    data: { robots },
    resolve: { detail: organizationResolver },
    loadComponent: () =>
      import('./pages/organization-detail.component').then((m) => m.OrganizationDetailComponent),
  },
  ...universeRoutes,
];
