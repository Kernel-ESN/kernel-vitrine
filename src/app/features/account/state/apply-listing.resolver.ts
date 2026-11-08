import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ListingsApi } from '@features/listings/data-access/listings.api';
import { Listing, Universe } from '@features/listings/models/listing';

export const applyListingResolver: ResolveFn<Listing | null> = (route) =>
  inject(ListingsApi)
    .getBySlug(route.data['universe'] as Universe, route.paramMap.get('slug') ?? '')
    .pipe(catchError(() => of(null)));
