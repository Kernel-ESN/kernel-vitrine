import { provideHttpClient, withFetch } from '@angular/common/http';
import { Routes } from '@angular/router';
import { ContactGateway, HttpContactGateway } from '../contact/data-access/contact.gateway';

// Comme pour la page de contact, HttpClient n'est chargé que sur la page de commande.
export const ORDER_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideHttpClient(withFetch()),
      { provide: ContactGateway, useClass: HttpContactGateway },
    ],
    loadComponent: () => import('./pages/offer-order.component').then((m) => m.OfferOrderComponent),
  },
];
