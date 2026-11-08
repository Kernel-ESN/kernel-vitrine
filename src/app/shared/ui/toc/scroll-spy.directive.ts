import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';

/**
 * Suit la section en cours de lecture parmi les éléments `[data-spy]` du conteneur.
 * La première section visible dans la bande haute de l'écran devient la section active.
 */
@Directive({ selector: '[appScrollSpy]', exportAs: 'scrollSpy' })
export class ScrollSpyDirective {
  readonly active = signal<string | null>(null);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const sections = [...host.querySelectorAll<HTMLElement>('[data-spy]')];
      this.active.set(sections[0]?.id ?? null);
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }
      const visible = new Set<string>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              visible.add(entry.target.id);
            } else {
              visible.delete(entry.target.id);
            }
          }
          const first = sections.find((section) => visible.has(section.id));
          if (first) {
            this.active.set(first.id);
          }
        },
        // Une bande entre 20 % et 40 % de la hauteur : là où l'œil lit.
        { rootMargin: '-20% 0px -60% 0px' },
      );
      sections.forEach((section) => observer.observe(section));
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
