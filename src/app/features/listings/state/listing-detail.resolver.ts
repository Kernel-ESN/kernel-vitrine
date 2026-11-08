import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ListingsApi } from '../data-access/listings.api';
import { Listing, Universe } from '../models/listing';
import { EMPTY_QUERY } from '../models/listing-query';

export type ListingDetail =
  | { readonly status: 'missing' | 'error' }
  | {
      readonly status: 'ready';
      readonly listing: Listing;
      readonly similar: readonly Listing[];
      readonly fromOrganization: readonly Listing[];
    };

const SIMILAR_LIMIT = 3;
const ORGANIZATION_LIMIT = 3;

/**
 * Une erreur reste un état de la page et non un échec de navigation : la personne voit un message
 * à l'adresse demandée. Des annonces voisines absentes ne doivent jamais masquer l'annonce.
 */
export const listingDetailResolver: ResolveFn<ListingDetail> = (
  route,
): Observable<ListingDetail> => {
  const api = inject(ListingsApi);
  const universe = route.data['universe'] as Universe;
  return api.getBySlug(universe, route.paramMap.get('slug') ?? '').pipe(
    switchMap((listing) =>
      listing === null
        ? of<ListingDetail>({ status: 'missing' })
        : forkJoin({
            similar: api.similar(listing, SIMILAR_LIMIT).pipe(catchError(() => of([]))),
            organization: api
              .search({ ...EMPTY_QUERY, organization: listing.organization.id })
              .pipe(
                map((page): readonly Listing[] => page.items),
                catchError(() => of<readonly Listing[]>([])),
              ),
          }).pipe(
            map(({ similar, organization }): ListingDetail => {
              const fromOrganization = organization
                .filter((other) => other.id !== listing.id)
                .slice(0, ORGANIZATION_LIMIT);
              return {
                status: 'ready',
                listing,
                fromOrganization,
                // Une même annonce n'apparaît pas dans les deux blocs de la page.
                similar: similar.filter(
                  (other) => !fromOrganization.some((item) => item.id === other.id),
                ),
              };
            }),
          ),
    ),
    catchError(() => of<ListingDetail>({ status: 'error' })),
  );
};
