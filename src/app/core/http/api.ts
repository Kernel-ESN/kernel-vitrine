import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { catchError, throwError, timeout } from 'rxjs';

/** Base de l'API décrite par `docs/api/openapi.yaml`. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', { factory: () => '/api' });

/** Réaction à une session expirée. Fournie par la plateforme : le noyau ne connaît pas l'auth. */
export const ON_UNAUTHORIZED = new InjectionToken<() => void>('ON_UNAUTHORIZED', {
  factory: () => () => undefined,
});

/** Pour un appel qui gère lui-même un 401, comme la vérification de la session au démarrage. */
export const HANDLES_UNAUTHORIZED = new HttpContextToken<boolean>(() => false);

export const REQUEST_TIMEOUT_MS = 15_000;
export const UPLOAD_TIMEOUT_MS = 120_000;

/**
 * Règles communes aux appels de l'API, et à eux seuls : cookie de session, délai adapté aux
 * réseaux faibles, session expirée. La connexion gère elle-même son 401 (mauvais identifiants).
 */
export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_BASE_URL);
  if (!request.url.startsWith(base)) {
    return next(request);
  }
  const onUnauthorized = inject(ON_UNAUTHORIZED);
  const limit = request.body instanceof FormData ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS;
  return next(request.clone({ withCredentials: true })).pipe(
    timeout(limit),
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !request.url.startsWith(`${base}/auth/`) &&
        !request.context.get(HANDLES_UNAUTHORIZED)
      ) {
        onUnauthorized();
      }
      return throwError(() => error);
    }),
  );
};
