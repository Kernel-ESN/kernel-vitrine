import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { ListingsApi } from '../data-access/listings.api';
import { Listing, PublicOrganization } from '../models/listing';
import { EMPTY_QUERY } from '../models/listing-query';

export type OrganizationDetail =
  | { readonly status: 'missing' | 'error' }
  | {
      readonly status: 'ready';
      readonly organization: PublicOrganization;
      readonly listings: readonly Listing[];
    };

/** Cinq pages suffisent : une organisation publie rarement plus de soixante annonces à la fois. */
const PAGES = 5;

export const organizationResolver: ResolveFn<OrganizationDetail> = (
  route,
): Observable<OrganizationDetail> => {
  const api = inject(ListingsApi);
  return api.organization(route.paramMap.get('slug') ?? '').pipe(
    switchMap((organization) =>
      organization === null
        ? of<OrganizationDetail>({ status: 'missing' })
        : api.search({ ...EMPTY_QUERY, organization: organization.id, page: PAGES }).pipe(
            map((page): OrganizationDetail => ({
              status: 'ready',
              organization,
              listings: page.items,
            })),
          ),
    ),
    catchError(() => of<OrganizationDetail>({ status: 'error' })),
  );
};
