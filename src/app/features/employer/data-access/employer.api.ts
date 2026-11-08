import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CLOCK } from '@core/data/clock';
import { LocalStore } from '@core/data/local-store';
import { API_BASE_URL } from '@core/http/api';
import { SessionStore } from '@features/auth/state/session.store';
import { ListingStatus } from '@features/listings/models/listing';
import { Observable, of, throwError } from 'rxjs';
import { EmployerListing, ListingDraft } from '../models/employer-listing';

/** Une seule liste pour tous les comptes : la modération simulée la lit aussi. */
export const SAMPLE_EMPLOYER_KEY = 'kernel.sample.employer';

export abstract class EmployerApi {
  abstract list(): Observable<readonly EmployerListing[]>;
  abstract get(id: string): Observable<EmployerListing | null>;
  /** Sans `id`, crée l'annonce. Avec `submit`, elle part en validation. */
  abstract save(
    draft: ListingDraft,
    id: string | null,
    submit: boolean,
  ): Observable<EmployerListing>;
  abstract close(id: string): Observable<EmployerListing>;
  abstract duplicate(id: string): Observable<EmployerListing>;
  abstract republish(id: string): Observable<EmployerListing>;
}

/** Simulation : tout reste dans ce navigateur. La modération arrive en phase 4. */
@Injectable()
export class SampleEmployerApi extends EmployerApi {
  private readonly store = inject(LocalStore);
  private readonly now = inject(CLOCK);
  private readonly session = inject(SessionStore);
  private sequence = 0;

  private get ownerId(): string {
    return this.session.user()?.id ?? '';
  }

  list(): Observable<readonly EmployerListing[]> {
    return of(this.read());
  }

  get(id: string): Observable<EmployerListing | null> {
    return of(this.read().find((item) => item.id === id) ?? null);
  }

  save(draft: ListingDraft, id: string | null, submit: boolean): Observable<EmployerListing> {
    const status: ListingStatus = submit ? 'EN_ATTENTE' : 'BROUILLON';
    const existing = id ? this.read().find((item) => item.id === id) : undefined;
    const saved: EmployerListing = {
      ...draft,
      id: existing?.id ?? this.newId(),
      ownerId: this.ownerId,
      status,
      moderationNote: submit ? null : (existing?.moderationNote ?? null),
      views: existing?.views ?? 0,
      applications: existing?.applications ?? 0,
      updatedAt: this.now().toISOString(),
    };
    this.put(saved);
    return of(saved);
  }

  close(id: string): Observable<EmployerListing> {
    return this.setStatus(id, 'RETIREE');
  }

  republish(id: string): Observable<EmployerListing> {
    return this.setStatus(id, 'EN_ATTENTE');
  }

  duplicate(id: string): Observable<EmployerListing> {
    const source = this.read().find((item) => item.id === id);
    if (!source) {
      return throwError(() => new Error('Annonce introuvable'));
    }
    const copy: EmployerListing = {
      ...source,
      id: this.newId(),
      title: `${source.title} (copie)`,
      status: 'BROUILLON',
      views: 0,
      applications: 0,
      updatedAt: this.now().toISOString(),
    };
    this.put(copy);
    return of(copy);
  }

  private setStatus(id: string, status: ListingStatus): Observable<EmployerListing> {
    const source = this.read().find((item) => item.id === id);
    if (!source) {
      return throwError(() => new Error('Annonce introuvable'));
    }
    const moderationNote = status === 'EN_ATTENTE' ? null : source.moderationNote;
    const next = { ...source, status, moderationNote, updatedAt: this.now().toISOString() };
    this.put(next);
    return of(next);
  }

  private newId(): string {
    this.sequence += 1;
    return `listing-${this.now().getTime()}-${this.sequence}`;
  }

  private read(): readonly EmployerListing[] {
    return this.store
      .read<readonly EmployerListing[]>(SAMPLE_EMPLOYER_KEY, [])
      .filter((item) => item.ownerId === this.ownerId);
  }

  private put(listing: EmployerListing): void {
    const others = this.store
      .read<readonly EmployerListing[]>(SAMPLE_EMPLOYER_KEY, [])
      .filter((item) => item.id !== listing.id);
    this.store.write(SAMPLE_EMPLOYER_KEY, [listing, ...others]);
  }
}

@Injectable()
export class HttpEmployerApi extends EmployerApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/employer/listings`;

  list(): Observable<readonly EmployerListing[]> {
    return this.http.get<readonly EmployerListing[]>(this.url);
  }

  get(id: string): Observable<EmployerListing | null> {
    return this.http.get<EmployerListing>(`${this.url}/${id}`);
  }

  save(draft: ListingDraft, id: string | null, submit: boolean): Observable<EmployerListing> {
    const params = { submit: String(submit) };
    return id
      ? this.http.put<EmployerListing>(`${this.url}/${id}`, draft, { params })
      : this.http.post<EmployerListing>(this.url, draft, { params });
  }

  close(id: string): Observable<EmployerListing> {
    return this.action(id, 'close');
  }

  duplicate(id: string): Observable<EmployerListing> {
    return this.action(id, 'duplicate');
  }

  republish(id: string): Observable<EmployerListing> {
    return this.action(id, 'republish');
  }

  private action(id: string, name: string): Observable<EmployerListing> {
    return this.http.post<EmployerListing>(`${this.url}/${id}/${name}`, null);
  }
}
