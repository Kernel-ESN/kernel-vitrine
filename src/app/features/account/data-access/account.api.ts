import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CLOCK } from '@core/data/clock';
import { LocalStore } from '@core/data/local-store';
import { API_BASE_URL } from '@core/http/api';
import { SessionStore } from '@features/auth/state/session.store';
import { SavedListing } from '@features/listings/models/saved-listing';
import { Observable, of } from 'rxjs';
import { Application, ApplicationSubmission, SavedCv } from '../models/account';

export abstract class AccountApi {
  abstract applications(): Observable<readonly Application[]>;
  abstract apply(listing: SavedListing, submission: ApplicationSubmission): Observable<Application>;
  abstract cv(): Observable<SavedCv | null>;
  abstract saveCv(file: File): Observable<SavedCv>;
  abstract removeCv(): Observable<void>;
}

/** Simulation : seul le nom du fichier est conservé, dans ce navigateur. Rien n'est envoyé. */
@Injectable()
export class SampleAccountApi extends AccountApi {
  private readonly store = inject(LocalStore);
  private readonly now = inject(CLOCK);
  private readonly session = inject(SessionStore);

  private get userId(): string {
    return this.session.user()?.id ?? '';
  }

  private get key(): string {
    return `kernel.sample.applications.${this.userId}`;
  }

  applications(): Observable<readonly Application[]> {
    return of(this.store.read<readonly Application[]>(this.key, []));
  }

  apply(listing: SavedListing, submission: ApplicationSubmission): Observable<Application> {
    if (submission.cv && submission.keepCv) {
      this.store.write(this.cvKey, this.describe(submission.cv));
    }
    const document = submission.cv?.name ?? this.store.read<SavedCv | null>(this.cvKey, null)?.name;
    const application: Application = {
      id: `application-${this.now().getTime()}`,
      listing,
      userId: this.userId,
      status: 'ENVOYEE',
      createdAt: this.now().toISOString(),
      documents: document ? [document] : [],
    };
    this.store.write(this.key, [
      application,
      ...this.store.read<readonly Application[]>(this.key, []),
    ]);
    return of(application);
  }

  cv(): Observable<SavedCv | null> {
    return of(this.store.read<SavedCv | null>(this.cvKey, null));
  }

  saveCv(file: File): Observable<SavedCv> {
    const saved = this.describe(file);
    this.store.write(this.cvKey, saved);
    return of(saved);
  }

  removeCv(): Observable<void> {
    this.store.write(this.cvKey, null);
    return of(undefined);
  }

  private get cvKey(): string {
    return `kernel.sample.cv.${this.userId}`;
  }

  private describe(file: File): SavedCv {
    return { name: file.name, sizeBytes: file.size, updatedAt: this.now().toISOString() };
  }
}

@Injectable()
export class HttpAccountApi extends AccountApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  applications(): Observable<readonly Application[]> {
    return this.http.get<readonly Application[]>(`${this.base}/me/applications`);
  }

  apply(listing: SavedListing, submission: ApplicationSubmission): Observable<Application> {
    const body = new FormData();
    if (submission.cv) {
      body.append('cv', submission.cv);
      body.append('keepCv', String(submission.keepCv));
    } else {
      body.append('useSavedCv', 'true');
    }
    body.append('letter', submission.letter);
    body.append('consent', 'true');
    return this.http.post<Application>(`${this.base}/listings/${listing.id}/applications`, body);
  }

  cv(): Observable<SavedCv | null> {
    // 204 quand aucun CV n'est enregistré : le corps est alors vide.
    return this.http.get<SavedCv | null>(`${this.base}/me/cv`);
  }

  saveCv(file: File): Observable<SavedCv> {
    const body = new FormData();
    body.append('cv', file);
    return this.http.put<SavedCv>(`${this.base}/me/cv`, body);
  }

  removeCv(): Observable<void> {
    return this.http.delete<void>(`${this.base}/me/cv`);
  }
}
