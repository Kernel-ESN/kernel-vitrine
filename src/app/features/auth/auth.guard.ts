import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from './models/user';
import { SessionStore } from './state/session.store';

/**
 * Le prérendu laisse passer : la session n'existe que dans le navigateur, où le contrôle a lieu.
 * Il protège l'affichage. Les vrais droits seront vérifiés par le backend.
 */
export const requireUser =
  (role?: UserRole): CanActivateFn =>
  (_route, state) => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return true;
    }
    const user = inject(SessionStore).user();
    const router = inject(Router);
    if (!user) {
      return router.createUrlTree(['/connexion'], {
        queryParams: {
          retour: state.url,
          ...(role === 'EMPLOYEUR' ? { profil: 'employeur' } : {}),
        },
      });
    }
    return !role || user.role === role ? true : router.createUrlTree(['/compte']);
  };

/** Évite une redirection vers un site extérieur par le paramètre `retour`. */
export const safeReturnUrl = (value: string | null): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/compte';
