import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Fait apparaître l'élément à l'entrée dans l'écran. L'effet n'est armé qu'une fois dans le
 * navigateur : le HTML prérendu reste entièrement visible sans JavaScript.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly appReveal = input<number | ''>('');

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const belowFold = element.getBoundingClientRect().top > window.innerHeight * 0.9;
      if (reduced || !belowFold || typeof IntersectionObserver === 'undefined') {
        return;
      }
      const delay = this.appReveal();
      if (delay) {
        element.style.setProperty('--reveal-delay', `${delay}ms`);
      }
      element.classList.add('reveal');
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add('reveal--in');
            observer.disconnect();
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
