import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CLOCK } from '@core/data/clock';
import { LocalStore } from '@core/data/local-store';
import { API_BASE_URL } from '@core/http/api';
import { SAMPLE_ACCOUNTS, SAMPLE_USERS_KEY } from '@features/auth/data-access/auth.api';
import { User } from '@features/auth/models/user';
import { SAMPLE_EMPLOYER_KEY } from '@features/employer/data-access/employer.api';
import { EmployerListing } from '@features/employer/models/employer-listing';
import { ListingStatus, UNIVERSES } from '@features/listings/models/listing';
import { Observable, of, throwError } from 'rxjs';
import { ModerationListing, ModerationOrganization } from '../models/moderation';

export abstract class ModerationApi {
  abstract listings(status: 'EN_ATTENTE' | 'PUBLIEE'): Observable<readonly ModerationListing[]>;
  abstract publish(id: string): Observable<unknown>;
  abstract reject(id: string, reason: string): Observable<unknown>;
  abstract withdraw(id: string, reason: string): Observable<unknown>;
  abstract organizations(): Observable<readonly ModerationOrganization[]>;
  abstract verify(id: string): Observable<unknown>;
  abstract rejectOrganization(id: string, reason: string): Observable<unknown>;
  /** Adresse de téléchargement du justificatif, ou null s'il n'est pas disponible. */
  abstract documentUrl(id: string): string | null;
}

@Injectable()
export class HttpModerationApi extends ModerationApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/admin`;

  listings(status: 'EN_ATTENTE' | 'PUBLIEE'): Observable<readonly ModerationListing[]> {
    return this.http.get<readonly ModerationListing[]>(`${this.url}/listings`, {
      params: { status },
    });
  }

  publish(id: string): Observable<unknown> {
    return this.http.post(`${this.url}/listings/${id}/publish`, null);
  }

  reject(id: string, reason: string): Observable<unknown> {
    return this.http.post(`${this.url}/listings/${id}/reject`, { reason });
  }

  withdraw(id: string, reason: string): Observable<unknown> {
    return this.http.post(`${this.url}/listings/${id}/withdraw`, { reason });
  }

  organizations(): Observable<readonly ModerationOrganization[]> {
    return this.http.get<readonly ModerationOrganization[]>(`${this.url}/organizations`);
  }

  verify(id: string): Observable<unknown> {
    return this.http.post(`${this.url}/organizations/${id}/verify`, null);
  }

  rejectOrganization(id: string, reason: string): Observable<unknown> {
    return this.http.post(`${this.url}/organizations/${id}/reject`, { reason });
  }

  documentUrl(id: string): string {
    return `${this.url}/organizations/${id}/document`;
  }
}

/**
 * Simulation dans ce navigateur : les décisions changent le statut vu par l'employeur, mais les
 * annonces publiées n'entrent pas dans la liste d'exemple. Aucun fichier n'est conservé.
 */
@Injectable()
export class SampleModerationApi extends ModerationApi {
  private readonly store = inject(LocalStore);
  private readonly now = inject(CLOCK);

  listings(status: 'EN_ATTENTE' | 'PUBLIEE'): Observable<readonly ModerationListing[]> {
    return of(
      this.employerListings()
        .filter((item) => item.status === status)
        .map((item) => this.toListing(item)),
    );
  }

  publish(id: string): Observable<unknown> {
    return this.decide(id, 'EN_ATTENTE', 'PUBLIEE', null);
  }

  reject(id: string, reason: string): Observable<unknown> {
    return this.decide(id, 'EN_ATTENTE', 'BROUILLON', reason);
  }

  withdraw(id: string, reason: string): Observable<unknown> {
    return this.decide(id, 'PUBLIEE', 'RETIREE', reason);
  }

  organizations(): Observable<readonly ModerationOrganization[]> {
    return of(
      this.users()
        .filter((user) => user.organization?.verification === 'EN_ATTENTE')
        .map((user) => ({
          id: user.id,
          name: user.organization?.name ?? '',
          type: user.organization?.type ?? 'AUTRE',
          verification: 'EN_ATTENTE' as const,
          contactPhone: user.phone,
          contactEmail: user.email,
          documentName: user.organization?.documentName,
          createdAt: this.now().toISOString(),
        })),
    );
  }

  verify(id: string): Observable<unknown> {
    return this.decideOrganization(id, 'VERIFIEE', undefined);
  }

  rejectOrganization(id: string, reason: string): Observable<unknown> {
    return this.decideOrganization(id, 'REFUSEE', reason);
  }

  documentUrl(): null {
    return null;
  }

  private decide(
    id: string,
    from: ListingStatus,
    to: ListingStatus,
    note: string | null,
  ): Observable<unknown> {
    const all = this.employerListings();
    if (!all.some((item) => item.id === id && item.status === from)) {
      return throwError(() => new Error('Annonce indisponible'));
    }
    this.store.write(
      SAMPLE_EMPLOYER_KEY,
      all.map((item) =>
        item.id === id
          ? { ...item, status: to, moderationNote: note, updatedAt: this.now().toISOString() }
          : item,
      ),
    );
    return of(null);
  }

  private decideOrganization(
    id: string,
    verification: 'VERIFIEE' | 'REFUSEE',
    verificationNote: string | undefined,
  ): Observable<unknown> {
    const target = this.users().find((user) => user.id === id);
    if (!target?.organization) {
      return throwError(() => new Error('Organisation indisponible'));
    }
    const updated: User = {
      ...target,
      organization: { ...target.organization, verification, verificationNote },
    };
    const others = this.store
      .read<readonly User[]>(SAMPLE_USERS_KEY, [])
      .filter((u) => u.id !== id);
    this.store.write(SAMPLE_USERS_KEY, [...others, updated]);
    return of(null);
  }

  private employerListings(): readonly EmployerListing[] {
    return this.store.read<readonly EmployerListing[]>(SAMPLE_EMPLOYER_KEY, []);
  }

  private users(): readonly User[] {
    const stored = this.store.read<readonly User[]>(SAMPLE_USERS_KEY, []);
    return [...stored, ...SAMPLE_ACCOUNTS.filter((a) => !stored.some((u) => u.id === a.id))];
  }

  private toListing(item: EmployerListing): ModerationListing {
    const owner = this.users().find((user) => user.id === item.ownerId);
    const universe =
      UNIVERSES.find((candidate) => candidate.types.includes(item.type))?.id ?? 'AUTRE';
    return {
      id: item.id,
      slug: item.id,
      universe,
      type: item.type,
      title: item.title,
      summary: item.summary,
      description: item.description,
      organization: {
        id: item.ownerId,
        name: owner?.organization?.name ?? owner?.name ?? '',
        verification: owner?.organization?.verification ?? 'EN_ATTENTE',
      },
      submittedBy: owner?.email,
      sectorId: item.sectorId,
      regionId: item.regionId,
      city: item.city,
      deadline: `${item.deadline}T12:00:00Z`,
      applyMode: item.applyMode,
      applyEmail: item.applyEmail || undefined,
      applyUrl: item.applyUrl || undefined,
      instructions: item.instructions,
      budget: item.budget ?? undefined,
      status: item.status,
      updatedAt: item.updatedAt,
    };
  }
}
