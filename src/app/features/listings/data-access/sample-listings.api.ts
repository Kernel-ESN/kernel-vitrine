import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CLOCK } from '@core/data/clock';
import { isExpired } from '../models/deadline';
import {
  Listing,
  ListingFacets,
  ListingPage,
  PublicOrganization,
  Universe,
} from '../models/listing';
import { ListingQuery, runFacets, runOrganizations, runQuery } from '../models/listing-query';
import { ListingsApi } from './listings.api';
import { buildSampleListings } from './sample-listings.data';

/** Implémentation simulée, sans réseau. Réponses synchrones pour un prérendu complet. */
@Injectable()
export class SampleListingsApi extends ListingsApi {
  private readonly now = inject(CLOCK);
  private readonly all = buildSampleListings(this.now());

  search(query: ListingQuery): Observable<ListingPage> {
    return of(runQuery(this.all, query, this.now()));
  }

  facets(query: ListingQuery): Observable<ListingFacets> {
    return of(runFacets(this.all, query, this.now()));
  }

  organizations(): Observable<readonly PublicOrganization[]> {
    return of(runOrganizations(this.all, this.now()).filter((item) => item.openListings > 0));
  }

  organization(slug: string): Observable<PublicOrganization | null> {
    return of(runOrganizations(this.all, this.now()).find((item) => item.slug === slug) ?? null);
  }

  getBySlug(universe: Universe, slug: string): Observable<Listing | null> {
    return of(this.all.find((l) => l.universe === universe && l.slug === slug) ?? null);
  }

  similar(listing: Listing, limit: number): Observable<readonly Listing[]> {
    const now = this.now();
    const candidates = this.all.filter(
      (other) =>
        other.id !== listing.id &&
        other.universe === listing.universe &&
        !isExpired(other.deadline, now),
    );
    const rank = (other: Listing): number =>
      (other.sectorId === listing.sectorId ? 2 : 0) + (other.regionId === listing.regionId ? 1 : 0);
    return of(
      [...candidates]
        .sort((a, b) => rank(b) - rank(a))
        .filter((other) => rank(other) > 0)
        .slice(0, limit),
    );
  }

  counts(): Observable<Readonly<Record<Universe, number>>> {
    const now = this.now();
    const live = this.all.filter((l) => !isExpired(l.deadline, now));
    const count = (universe: Universe): number =>
      live.filter((l) => l.universe === universe).length;
    return of({ EMPLOI: count('EMPLOI'), MARCHE: count('MARCHE'), AUTRE: count('AUTRE') });
  }
}
