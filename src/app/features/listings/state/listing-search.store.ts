import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, startWith, Subject, switchMap } from 'rxjs';
import { ListingsApi } from '../data-access/listings.api';
import { ListingFacets, ListingPage } from '../models/listing';
import { ListingQuery } from '../models/listing-query';

type SearchResult =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly page: ListingPage }
  | { readonly status: 'error' };

/** Une seule recherche à la fois : la plus récente annule les précédentes. */
@Injectable()
export class ListingSearchStore {
  private readonly api = inject(ListingsApi);
  private readonly requests = new Subject<ListingQuery>();
  private readonly facetRequests = new Subject<ListingQuery>();
  private last: ListingQuery | null = null;

  readonly status = signal<SearchResult['status']>('loading');
  /** Conserve la dernière liste pendant un rechargement, pour éviter un clignotement. */
  readonly page = signal<ListingPage | null>(null);
  /** Sans compteurs, les filtres restent utilisables : une erreur ici ne bloque pas la liste. */
  readonly facets = signal<ListingFacets | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.requests
      .pipe(
        switchMap((query) =>
          this.api.search(query).pipe(
            map((page): SearchResult => ({ status: 'ready', page })),
            catchError(() => of<SearchResult>({ status: 'error' })),
            startWith<SearchResult>({ status: 'loading' }),
          ),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((result) => {
        this.status.set(result.status);
        if (result.status === 'ready') {
          this.page.set(result.page);
        }
      });
    // Charger plus ou changer le tri ne change aucun compteur : pas de nouvel appel.
    this.facetRequests
      .pipe(
        map((query) => ({ ...query, page: 1, sort: 'recent' as const })),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap((query) => this.api.facets(query).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((facets) => this.facets.set(facets));
  }

  load(query: ListingQuery): void {
    this.last = query;
    this.requests.next(query);
    this.facetRequests.next(query);
  }

  retry(): void {
    if (this.last) {
      this.load(this.last);
    }
  }
}
