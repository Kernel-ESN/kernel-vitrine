import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/http/api';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import {
  Listing,
  ListingFacets,
  ListingPage,
  PublicOrganization,
  Universe,
} from '../models/listing';
import { ListingQuery, PAGE_SIZE } from '../models/listing-query';
import { ListingsApi } from './listings.api';

const nullWhenMissing = (error: unknown): Observable<null> =>
  error instanceof HttpErrorResponse && error.status === 404 ? of(null) : throwError(() => error);

function filterEntries(query: ListingQuery): Record<string, string | readonly string[]> {
  const entries: Record<string, string | readonly string[]> = {};
  if (query.universe) entries['universe'] = query.universe;
  if (query.organization) entries['organizationId'] = query.organization;
  if (query.text) entries['q'] = query.text;
  if (query.type.length) entries['type'] = query.type;
  if (query.sector.length) entries['sectorId'] = query.sector;
  if (query.region.length) entries['regionId'] = query.region;
  if (query.education.length) entries['educationLevel'] = query.education;
  if (query.organizationType.length) entries['organizationType'] = query.organizationType;
  if (query.within) entries['deadlineWithinDays'] = query.within;
  if (query.since) entries['publishedWithinDays'] = query.since;
  return entries;
}

export function toSearchParams(query: ListingQuery): HttpParams {
  return new HttpParams({
    fromObject: {
      sort: query.sort,
      offset: '0',
      limit: String(query.page * PAGE_SIZE),
      ...filterEntries(query),
    },
  });
}

@Injectable()
export class HttpListingsApi extends ListingsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  search(query: ListingQuery): Observable<ListingPage> {
    return this.http.get<ListingPage>(`${this.base}/listings`, { params: toSearchParams(query) });
  }

  facets(query: ListingQuery): Observable<ListingFacets> {
    return this.http.get<ListingFacets>(`${this.base}/listings/facets`, {
      params: new HttpParams({ fromObject: filterEntries(query) }),
    });
  }

  getBySlug(universe: Universe, slug: string): Observable<Listing | null> {
    return this.http
      .get<Listing>(`${this.base}/listings/${universe}/${slug}`)
      .pipe(catchError(nullWhenMissing));
  }

  similar(listing: Listing, limit: number): Observable<readonly Listing[]> {
    return this.http
      .get<ListingPage>(`${this.base}/listings/${listing.id}/similar`, {
        params: { limit: String(limit) },
      })
      .pipe(map((page) => page.items));
  }

  organizations(): Observable<readonly PublicOrganization[]> {
    return this.http.get<readonly PublicOrganization[]>(`${this.base}/organizations`);
  }

  organization(slug: string): Observable<PublicOrganization | null> {
    return this.http
      .get<PublicOrganization>(`${this.base}/organizations/${slug}`)
      .pipe(catchError(nullWhenMissing));
  }

  counts(): Observable<Readonly<Record<Universe, number>>> {
    return this.http.get<Record<Universe, number>>(`${this.base}/listings/counts`);
  }
}
