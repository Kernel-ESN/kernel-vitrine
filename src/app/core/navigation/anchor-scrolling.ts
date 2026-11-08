import { DOCUMENT, ViewportScroller } from '@angular/common';
import { EnvironmentProviders, inject, provideEnvironmentInitializer } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Écart entre l'en-tête fixe et le début de la section visée. */
const ANCHOR_GAP = 16;

/**
 * Une nouvelle page s'ouvre directement en haut. Le défilement animé est réservé aux ancres
 * de la page en cours : appliqué partout, il ferait redescendre la page à chaque clic.
 * Le routeur ignore `scroll-padding-top` : l'en-tête, mesuré à chaque fois, sert de décalage.
 */
export function provideSmoothAnchors(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const router = inject(Router);
    const document = inject(DOCUMENT);
    const root = document.documentElement;
    inject(ViewportScroller).setOffset(() => {
      const header = document.querySelector('app-site-header')?.getBoundingClientRect().height ?? 0;
      return [0, header + ANCHOR_GAP];
    });
    router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event) => {
      const [path, fragment] = event.url.split('#');
      const samePage = path === router.url.split('#')[0];
      root.classList.toggle('smooth-anchors', samePage && Boolean(fragment));
    });
  });
}
