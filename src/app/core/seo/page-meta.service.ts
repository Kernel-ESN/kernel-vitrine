import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PageMetaService {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);

  start(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const description = route.data['description'] as string | undefined;
      if (description) {
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ property: 'og:description', content: description });
      }
      if (route.title) {
        this.meta.updateTag({ property: 'og:title', content: route.title });
      }
      // Les annonces fictives ne doivent jamais sortir sur un moteur de recherche.
      const robots = route.data['robots'] as string | undefined;
      if (robots) {
        this.meta.updateTag({ name: 'robots', content: robots });
      } else {
        this.meta.removeTag('name="robots"');
      }
    });
  }
}
