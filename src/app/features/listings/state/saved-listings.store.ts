import { inject, Injectable, signal } from '@angular/core';
import { SessionStore } from '@features/auth/state/session.store';
import { Observable, tap } from 'rxjs';
import { SavedListingsApi } from '../data-access/saved-listings.api';
import { Listing } from '../models/listing';
import { SavedListing, toSaved } from '../models/saved-listing';

/** Une seule lecture par page, quel que soit le nombre de cartes affichées. */
@Injectable()
export class SavedListingsStore {
  private readonly api = inject(SavedListingsApi);
  private readonly session = inject(SessionStore);
  private readonly items = signal<readonly SavedListing[]>([]);

  isSaved(id: string): boolean {
    return this.items().some((item) => item.id === id);
  }

  /** À appeler à l'ouverture d'une page : la liste a pu changer depuis l'espace personnel. */
  refresh(): void {
    if (!this.session.loggedIn()) {
      this.items.set([]);
      return;
    }
    this.api.list().subscribe({
      next: (items) => this.items.set(items),
      error: () => undefined,
    });
  }

  toggle(listing: Listing): Observable<readonly SavedListing[]> {
    return this.api
      .set(toSaved(listing), !this.isSaved(listing.id))
      .pipe(tap((items) => this.items.set(items)));
  }
}
