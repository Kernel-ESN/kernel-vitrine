import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';
import {
  sampleOrganizationSlugs,
  sampleSlugs,
} from '@features/listings/data-access/sample-listings.data';
import { UNIVERSES } from '@features/listings/models/listing';

const listingRoutes: ServerRoute[] = UNIVERSES.flatMap((universe) => [
  {
    path: `${universe.path}/:slug/postuler`,
    renderMode: RenderMode.Prerender as const,
    getPrerenderParams: async () => [...sampleSlugs(universe.id)],
  },
  {
    path: `${universe.path}/:slug`,
    renderMode: RenderMode.Prerender as const,
    getPrerenderParams: async () => [...sampleSlugs(universe.id)],
  },
]);

/** Avec la vraie API, rendu dans le navigateur en attendant le rendu serveur (ADR 0003). */
export const serverRoutes: ServerRoute[] =
  environment.api === 'http'
    ? [{ path: '**', renderMode: RenderMode.Client }]
    : [
        ...listingRoutes,
        {
          path: 'organisations/:slug',
          renderMode: RenderMode.Prerender,
          getPrerenderParams: async () => [...sampleOrganizationSlugs()],
        },
        { path: '**', renderMode: RenderMode.Prerender },
      ];
