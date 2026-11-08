import { Observable } from 'rxjs';
import {
  Listing,
  ListingFacets,
  ListingPage,
  PublicOrganization,
  Universe,
} from '../models/listing';
import { ListingQuery } from '../models/listing-query';

/** Contrat vu par les composants. Passer du simulé au réel se fait dans `app.config.ts`. */
export abstract class ListingsApi {
  abstract search(query: ListingQuery): Observable<ListingPage>;
  abstract facets(query: ListingQuery): Observable<ListingFacets>;
  abstract getBySlug(universe: Universe, slug: string): Observable<Listing | null>;
  abstract similar(listing: Listing, limit: number): Observable<readonly Listing[]>;
  abstract counts(): Observable<Readonly<Record<Universe, number>>>;
  abstract organizations(): Observable<readonly PublicOrganization[]>;
  abstract organization(slug: string): Observable<PublicOrganization | null>;
}
