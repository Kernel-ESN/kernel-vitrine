import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

const DURATION_MS = 1400;

/** Lit « 23,2 % » ou « 17,4 millions » : la partie chiffrée, ses décimales et le reste. */
export function parseFigure(
  text: string,
): { value: number; decimals: number; suffix: string } | null {
  const match = /^(\d+)(?:,(\d+))?(.*)$/s.exec(text.trim());
  if (!match) {
    return null;
  }
  const decimals = match[2]?.length ?? 0;
  return { value: Number(`${match[1]}.${match[2] ?? '0'}`), decimals, suffix: match[3] };
}

export const formatFigure = (value: number, decimals: number): string =>
  value.toFixed(decimals).replace('.', ',');

/**
 * Fait compter un chiffre jusqu'à sa valeur quand il entre à l'écran. Le HTML prérendu garde la
 * valeur finale, les lecteurs d'écran la lisent d'emblée, et rien ne bouge si le visiteur a
 * demandé moins d'animations.
 */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const final = element.textContent?.trim() ?? '';
      const figure = parseFigure(final);
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!figure || reduced || typeof IntersectionObserver === 'undefined') {
        return;
      }
      element.setAttribute('aria-label', final);
      element.textContent = `${formatFigure(0, figure.decimals)}${figure.suffix}`;

      let frame = 0;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }
          observer.disconnect();
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min(1, (now - start) / DURATION_MS);
            // Décélération : le chiffre ralentit en approchant de sa valeur.
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent =
              progress < 1
                ? `${formatFigure(figure.value * eased, figure.decimals)}${figure.suffix}`
                : final;
            if (progress < 1) {
              frame = requestAnimationFrame(step);
            }
          };
          frame = requestAnimationFrame(step);
        },
        { rootMargin: '0px 0px -15% 0px' },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        element.textContent = final;
      });
    });
  }
}
