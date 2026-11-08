import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Route, ViewTransitionInfo } from '@angular/router';

const INSTANT = 'instant-transition';

/** `from` et `to` désignent la racine du routeur : la page réelle est la route la plus profonde. */
function pageOf(route: ActivatedRouteSnapshot): Route | null {
  let current = route;
  while (current.firstChild) {
    current = current.firstChild;
  }
  return current.routeConfig;
}

/** Un changement de filtre reste sur la même page : pas de fondu. */
export function onViewTransition({ transition, from, to }: ViewTransitionInfo): void {
  if (pageOf(from) !== pageOf(to)) {
    return;
  }
  const root = inject(DOCUMENT).documentElement;
  root.classList.add(INSTANT);
  const done = () => root.classList.remove(INSTANT);
  transition.finished.then(done, done);
}
