import { Routes } from '@angular/router';
import { ACCOUNT_ROUTES } from '@features/account/account.routes';
import { ADMIN_ROUTES } from '@features/admin/admin.routes';
import { ALERTS_ROUTES } from '@features/alerts/alerts.routes';
import { AUTH_ROUTES } from '@features/auth/auth.routes';
import { EMPLOYER_ROUTES } from '@features/employer/employer.routes';
import { LISTINGS_ROUTES } from '@features/listings/listings.routes';
import { environment } from '../../../environments/environment';
import { provideHttpApis, provideSampleApis } from './platform.providers';

/** Chargé à part : ni les données ni la plateforme ne pèsent sur la vitrine. */
export const PLATFORM_ROUTES: Routes = [
  {
    path: '',
    providers: [environment.api === 'http' ? provideHttpApis() : provideSampleApis()],
    children: [
      ...LISTINGS_ROUTES,
      ...ACCOUNT_ROUTES,
      ...ALERTS_ROUTES,
      ...AUTH_ROUTES,
      ...EMPLOYER_ROUTES,
      ...ADMIN_ROUTES,
    ],
  },
];
