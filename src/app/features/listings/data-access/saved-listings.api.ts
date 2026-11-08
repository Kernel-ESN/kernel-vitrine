import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LocalStore } from '@core/data/local-store';
import { API_BASE_URL } from '@core/http/api';
import { SessionStore } from '@features/auth/state/session.store';
import { Observable, of, switchMap } from 'rxjs';
import { SavedListing } from '../models/saved-listing';

export abstract class SavedListingsApi {
  abstract list(): Observable<readonly SavedListing[]>;
  /** Renvoie la liste à jour. */
  abstract set(listing: SavedListing, saved: boolean): Observable<readonly SavedListing[]>;
}

@Injectable()
export class SampleSavedListingsApi extends SavedListingsApi {
  private readonly store = inject(LocalStore);
  private readonly session = inject(SessionStore);

  private get key(): string {
    return `kernel.sample.saved.${this.session.user()?.id ?? ''}`;
  }

  list(): Observable<readonly SavedListing[]> {
    return of(this.store.read<readonly SavedListing[]>(this.key, []));
  }

  set(listing: SavedListing, saved: boolean): Observable<readonly SavedListing[]> {
    const others = this.store
      .read<readonly SavedListing[]>(this.key, [])
      .filter((item) => item.id !== listing.id);
    const next = saved ? [listing, ...others] : others;
    this.store.write(this.key, next);
    return of(next);
  }
}

@Injectable()
export class HttpSavedListingsApi extends SavedListingsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  list(): Observable<readonly SavedListing[]> {
    return this.http.get<readonly SavedListing[]>(`${this.base}/me/saved`);
  }

  set(listing: SavedListing, saved: boolean): Observable<readonly SavedListing[]> {
    const url = `${this.base}/me/saved/${listing.id}`;
    const change = saved ? this.http.put<void>(url, null) : this.http.delete<void>(url);
    return change.pipe(switchMap(() => this.list()));
  }
}
