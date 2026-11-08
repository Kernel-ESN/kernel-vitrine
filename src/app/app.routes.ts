import { Route, Routes } from '@angular/router';
import { AUDIENCE_NAV, EXPERTISE_NAV, OFFER_NAV } from '@core/config/navigation';

const SITE_NAME = 'Kernel Consulting';

const loadNotFound = () =>
  import('@features/not-found/pages/not-found.component').then((m) => m.NotFoundComponent);

const audienceRoutes = AUDIENCE_NAV.map((audience): Route => ({
  path: audience.slug,
  title: `${audience.label} | ${SITE_NAME}`,
  data: { slug: audience.slug, description: `${audience.label} : ${audience.blurb}` },
  loadComponent: () =>
    import('@features/showcase/audiences/pages/audience.component').then(
      (m) => m.AudienceComponent,
    ),
}));

const expertiseRoutes = EXPERTISE_NAV.map((expertise): Route => ({
  path: `services/${expertise.slug}`,
  title: `${expertise.label} | ${SITE_NAME}`,
  data: { slug: expertise.slug, description: expertise.blurb },
  loadComponent: () =>
    import('@features/showcase/expertises/pages/expertise-detail.component').then(
      (m) => m.ExpertiseDetailComponent,
    ),
}));

const offerRoutes = OFFER_NAV.flatMap((offer): Route[] => [
  {
    path: `offres/${offer.slug}`,
    pathMatch: 'full',
    title: `${offer.label} | ${SITE_NAME}`,
    data: { slug: offer.slug, description: offer.blurb },
    loadComponent: () =>
      import('@features/showcase/offers/pages/offer-detail.component').then(
        (m) => m.OfferDetailComponent,
      ),
  },
  {
    path: `offres/${offer.slug}/commander`,
    title: `Commander : ${offer.label} | ${SITE_NAME}`,
    data: { slug: offer.slug, robots: 'noindex' },
    loadChildren: () =>
      import('@features/showcase/offers/offers.providers').then((m) => m.ORDER_ROUTES),
  },
]);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: `${SITE_NAME} | Ingénierie informatique à Niamey`,
    data: {
      description:
        "Kernel Consulting développe vos applications, fait tourner vos serveurs, met de l'ordre dans vos données et protège le tout. Niamey, Niger.",
    },
    loadComponent: () =>
      import('@features/showcase/home/pages/home.component').then((m) => m.HomeComponent),
  },
  ...audienceRoutes,
  ...expertiseRoutes,
  ...offerRoutes,
  {
    path: 'offres',
    pathMatch: 'full',
    title: `Offres | ${SITE_NAME}`,
    data: {
      description:
        'Site web pour ONG ou entreprise, boutique en ligne, nom de domaine et messagerie, hébergement géré : des offres à commander.',
    },
    loadComponent: () =>
      import('@features/showcase/offers/pages/offers.component').then((m) => m.OffersComponent),
  },
  {
    path: 'services',
    title: `Services | ${SITE_NAME}`,
    data: { description: 'DevOps, data, cloud et cybersécurité, à la même table.' },
    loadComponent: () =>
      import('@features/showcase/expertises/pages/expertises.component').then(
        (m) => m.ExpertisesComponent,
      ),
  },
  {
    path: 'methode',
    title: `Méthode | ${SITE_NAME}`,
    data: { description: 'Cinq étapes, de la première écoute à la remise des clés.' },
    loadComponent: () =>
      import('@features/showcase/method/pages/method.component').then((m) => m.MethodComponent),
  },
  {
    path: 'a-propos',
    title: `À propos | ${SITE_NAME}`,
    data: {
      description:
        "Une société d'ingénierie informatique fondée au Niger par Ahmed Abdoulahi et Saratou Anaroua Fodi.",
    },
    loadComponent: () =>
      import('@features/showcase/about/pages/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadChildren: () =>
      import('@features/showcase/contact/contact.routes').then((m) => m.CONTACT_ROUTES),
  },
  {
    path: 'mentions-legales',
    title: `Mentions légales | ${SITE_NAME}`,
    data: { description: `Éditeur, hébergement et données personnelles de ${SITE_NAME}.` },
    loadComponent: () =>
      import('@features/showcase/legal/pages/legal.component').then((m) => m.LegalComponent),
  },
  {
    path: '',
    // La vitrine ne télécharge pas la plateforme d'avance.
    data: { preload: false },
    loadChildren: () => import('@features/platform/platform.routes').then((m) => m.PLATFORM_ROUTES),
  },
  { path: '404', title: `Page introuvable | ${SITE_NAME}`, loadComponent: loadNotFound },
  { path: '**', title: `Page introuvable | ${SITE_NAME}`, loadComponent: loadNotFound },
];
