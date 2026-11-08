import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { catchError, Observable, of, switchMap, timer } from 'rxjs';

const SETTLE_DELAY_MS = 2000;

interface NetworkInformation {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

export function hasRoomToPreload(connection: NetworkInformation | undefined): boolean {
  return !connection?.saveData && !connection?.effectiveType?.includes('2g');
}

/**
 * Charge les autres pages après la page en cours, pour que le clic suivant soit immédiat.
 * Rien n'est chargé d'avance en mode économie de données ou sur une connexion 2G, ni pour une
 * route marquée `data: { preload: false }`.
 */
@Injectable({ providedIn: 'root' })
export class LightPreloading implements PreloadingStrategy {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!this.browser || route.data?.['preload'] === false) {
      return of(null);
    }
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (!hasRoomToPreload(connection)) {
      return of(null);
    }
    // Sur un réseau faible, un échec ici n'a rien de grave : la navigation réessaiera.
    return timer(SETTLE_DELAY_MS).pipe(
      switchMap(() => load()),
      catchError(() => of(null)),
    );
  }
}
