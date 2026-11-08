import { provideHttpClient, withFetch } from '@angular/common/http';
import { Routes } from '@angular/router';
import { ContactGateway, HttpContactGateway } from './data-access/contact.gateway';

// HttpClient n'est chargé que sur la page de contact pour alléger les autres pages.
export const CONTACT_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideHttpClient(withFetch()),
      { provide: ContactGateway, useClass: HttpContactGateway },
    ],
    title: 'Contact | Kernel Consulting',
    data: {
      description: 'Dites-nous ce qui bloque. Kernel Consulting, Niamey, Niger : +227 88 89 82 82.',
    },
    loadComponent: () => import('./pages/contact.component').then((m) => m.ContactComponent),
  },
];
