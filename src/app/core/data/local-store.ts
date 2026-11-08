import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * Persistance locale des implémentations simulées. Un navigateur privé ou plein ne doit
 * jamais casser une page : toute erreur de stockage revient à ne rien avoir enregistré.
 */
@Injectable({ providedIn: 'root' })
export class LocalStore {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  read<T>(key: string, fallback: T): T {
    if (!this.browser) {
      return fallback;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  write(key: string, value: unknown): void {
    if (!this.browser) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Stockage indisponible : la donnée reste valable pour la page en cours.
    }
  }
}
