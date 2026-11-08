import { isPlatformBrowser } from '@angular/common';
import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideEnvironmentInitializer,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  API_BASE_URL,
  apiInterceptor,
  HANDLES_UNAUTHORIZED,
  ON_UNAUTHORIZED,
} from '@core/http/api';
import { User } from '@features/auth/models/user';
import {
  AccountApi,
  HttpAccountApi,
  SampleAccountApi,
} from '@features/account/data-access/account.api';
import {
  HttpModerationApi,
  ModerationApi,
  SampleModerationApi,
} from '@features/admin/data-access/moderation.api';
import { AlertsApi, HttpAlertsApi, SampleAlertsApi } from '@features/alerts/data-access/alerts.api';
import { AuthApi, HttpAuthApi, SampleAuthApi } from '@features/auth/data-access/auth.api';
import { SessionStore } from '@features/auth/state/session.store';
import {
  EmployerApi,
  HttpEmployerApi,
  SampleEmployerApi,
} from '@features/employer/data-access/employer.api';
import { HttpListingsApi } from '@features/listings/data-access/http-listings.api';
import { ListingsApi } from '@features/listings/data-access/listings.api';
import { SampleListingsApi } from '@features/listings/data-access/sample-listings.api';
import {
  HttpSavedListingsApi,
  SampleSavedListingsApi,
  SavedListingsApi,
} from '@features/listings/data-access/saved-listings.api';
import { SavedListingsStore } from '@features/listings/state/saved-listings.store';

/** Données d'exemple dans ce navigateur, sans réseau. */
export function provideSampleApis(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ListingsApi, useClass: SampleListingsApi },
    { provide: SavedListingsApi, useClass: SampleSavedListingsApi },
    SavedListingsStore,
    { provide: AlertsApi, useClass: SampleAlertsApi },
    { provide: AuthApi, useClass: SampleAuthApi },
    { provide: AccountApi, useClass: SampleAccountApi },
    { provide: EmployerApi, useClass: SampleEmployerApi },
    { provide: ModerationApi, useClass: SampleModerationApi },
  ]);
}

/**
 * Au démarrage : dépose le cookie CSRF et vérifie que la session gardée par le navigateur existe
 * encore côté serveur. Une session expirée referme simplement l'état local, sans redirection.
 */
function syncSession(): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return;
  }
  const http = inject(HttpClient);
  const base = inject(API_BASE_URL);
  const session = inject(SessionStore);
  http.get<void>(`${base}/auth/csrf`).subscribe({ error: () => undefined });
  if (session.loggedIn()) {
    http
      .get<User>(`${base}/me`, { context: new HttpContext().set(HANDLES_UNAUTHORIZED, true) })
      .subscribe({
        next: (user) => session.open(user),
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            session.close();
          }
        },
      });
  }
}

/**
 * API réelle (`docs/api/openapi.yaml`), choisie par `environment.api`. Aucun composant ne change.
 */
export function provideHttpApis(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    provideEnvironmentInitializer(syncSession),
    { provide: ListingsApi, useClass: HttpListingsApi },
    { provide: SavedListingsApi, useClass: HttpSavedListingsApi },
    SavedListingsStore,
    { provide: AlertsApi, useClass: HttpAlertsApi },
    { provide: AuthApi, useClass: HttpAuthApi },
    { provide: AccountApi, useClass: HttpAccountApi },
    { provide: EmployerApi, useClass: HttpEmployerApi },
    { provide: ModerationApi, useClass: HttpModerationApi },
    {
      provide: ON_UNAUTHORIZED,
      useFactory: () => {
        const session = inject(SessionStore);
        const router = inject(Router);
        return () => {
          session.close();
          void router.navigate(['/connexion'], { queryParams: { retour: router.url } });
        };
      },
    },
  ]);
}
