import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/http/api';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { LocalStore } from '@core/data/local-store';
import { SessionStore } from '../state/session.store';
import { ProfileChange, Registration, User } from '../models/user';

export type AuthError = 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN' | 'UNAVAILABLE';

export abstract class AuthApi {
  abstract login(email: string, password: string): Observable<User>;
  abstract register(registration: Registration): Observable<User>;
  abstract updateProfile(change: ProfileChange): Observable<User>;
  abstract logout(): Observable<void>;
  /** Envoie un nouveau justificatif : l'organisation repart en vérification. */
  abstract replaceOrganizationDocument(document: File): Observable<User>;
}

export const SAMPLE_USERS_KEY = 'kernel.sample.users';
const KEY = SAMPLE_USERS_KEY;

/** Comptes d'essai affichés sur la page de connexion. */
export const SAMPLE_ACCOUNTS: readonly User[] = [
  {
    id: 'demo-c',
    name: 'Candidat de démonstration',
    email: 'candidat@example.org',
    role: 'CANDIDAT',
  },
  {
    id: 'demo-e',
    name: 'Employeur de démonstration',
    email: 'employeur@example.org',
    role: 'EMPLOYEUR',
    organization: { name: 'Organisation Exemple', type: 'ONG', verification: 'VERIFIEE' },
  },
  {
    id: 'demo-m',
    name: 'Modérateur de démonstration',
    email: 'moderateur@example.org',
    role: 'ADMIN',
  },
];

/**
 * Simulation : aucun mot de passe n'est conservé, seul le format est contrôlé.
 * La vraie authentification arrive avec le backend (phase 3).
 */
@Injectable()
export class SampleAuthApi extends AuthApi {
  private readonly store = inject(LocalStore);
  private readonly session = inject(SessionStore);

  login(email: string): Observable<User> {
    const wanted = email.trim().toLowerCase();
    const user = this.users().find((candidate) => candidate.email === wanted);
    return user ? of(user) : throwError((): AuthError => 'INVALID_CREDENTIALS');
  }

  register(registration: Registration): Observable<User> {
    const email = registration.email.trim().toLowerCase();
    if (this.users().some((user) => user.email === email)) {
      return throwError((): AuthError => 'EMAIL_TAKEN');
    }
    const user: User = {
      id: `user-${email}`,
      email,
      name: registration.name.trim(),
      role: registration.role,
      phone: registration.phone,
      organization: registration.organization && {
        name: registration.organization.name,
        type: registration.organization.type,
        verification: 'EN_ATTENTE',
        documentName: registration.organization.document.name,
      },
    };
    this.store.write(KEY, [...this.store.read<readonly User[]>(KEY, []), user]);
    return of(user);
  }

  logout(): Observable<void> {
    return of(undefined);
  }

  updateProfile(change: ProfileChange): Observable<User> {
    const current = this.session.user();
    if (!current) {
      return throwError((): AuthError => 'UNAVAILABLE');
    }
    const user: User = {
      ...current,
      name: change.name.trim(),
      phone: change.phone.trim() || undefined,
    };
    const others = this.store.read<readonly User[]>(KEY, []).filter((u) => u.id !== user.id);
    this.store.write(KEY, [...others, user]);
    return of(user);
  }

  replaceOrganizationDocument(document: File): Observable<User> {
    const current = this.session.user();
    if (!current?.organization) {
      return throwError((): AuthError => 'UNAVAILABLE');
    }
    const user: User = {
      ...current,
      organization: {
        ...current.organization,
        verification: 'EN_ATTENTE',
        documentName: document.name,
        verificationNote: undefined,
      },
    };
    const others = this.store.read<readonly User[]>(KEY, []).filter((u) => u.id !== user.id);
    this.store.write(KEY, [...others, user]);
    return of(user);
  }

  /** Un compte d'essai modifié remplace sa version d'origine. */
  private users(): readonly User[] {
    const stored = this.store.read<readonly User[]>(KEY, []);
    return [...stored, ...SAMPLE_ACCOUNTS.filter((a) => !stored.some((u) => u.id === a.id))];
  }
}

const toAuthError = (error: unknown): AuthError => {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  if (status === 401) return 'INVALID_CREDENTIALS';
  return status === 409 ? 'EMAIL_TAKEN' : 'UNAVAILABLE';
};

/** Avec un justificatif, l'inscription part en multipart : les champs d'un côté, le fichier de l'autre. */
function toRegisterBody(registration: Registration): Registration | FormData {
  const organization = registration.organization;
  if (!organization) {
    return registration;
  }
  const body = new FormData();
  const data = {
    ...registration,
    organization: { name: organization.name, type: organization.type },
  };
  body.append('data', JSON.stringify(data));
  body.append('document', organization.document);
  return body;
}

@Injectable()
export class HttpAuthApi extends AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly url = `${this.base}/auth`;

  /** Le jeton CSRF doit exister avant le premier envoi. */
  private withCsrf<T>(call: () => Observable<T>): Observable<T> {
    return this.http.get<void>(`${this.url}/csrf`).pipe(switchMap(call));
  }

  login(email: string, password: string): Observable<User> {
    return this.withCsrf(() => this.http.post<User>(`${this.url}/login`, { email, password })).pipe(
      catchError((error: unknown) => throwError(() => toAuthError(error))),
    );
  }

  register(registration: Registration): Observable<User> {
    return this.withCsrf(() =>
      this.http.post<User>(`${this.url}/register`, toRegisterBody(registration)),
    ).pipe(catchError((error: unknown) => throwError(() => toAuthError(error))));
  }

  updateProfile(change: ProfileChange): Observable<User> {
    return this.http.put<User>(`${this.base}/me`, change);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, null);
  }

  replaceOrganizationDocument(document: File): Observable<User> {
    const body = new FormData();
    body.append('document', document);
    return this.http.put<User>(`${this.base}/me/organization/document`, body);
  }
}
