import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';

/** Somme réelle des octets reçus, ou null si le navigateur ne la donne pas. */
export function totalTransferKb(
  entries: readonly { readonly transferSize?: number }[],
): number | null {
  const sizes = entries.map((entry) => entry.transferSize);
  if (!sizes.length || sizes.every((size) => size === undefined)) {
    return null;
  }
  const bytes = sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0);
  return Math.round(bytes / 1024);
}

export function weightMessage(kilobytes: number | null): string {
  if (kilobytes === null) {
    return 'Nous mesurons le poids de chaque page avant de la publier.';
  }
  if (kilobytes === 0) {
    return 'Votre navigateur avait déjà cette page en mémoire. Elle ne vous a rien coûté en données.';
  }
  return `Cette page vient de vous coûter ${kilobytes} Ko de données.`;
}

/** Mesure en direct ce que la page a réellement téléchargé chez le visiteur. */
@Component({
  selector: 'app-page-weight',
  template: `{{ message() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWeightComponent {
  protected readonly message = signal(weightMessage(null));

  constructor() {
    afterNextRender(() => {
      const measure = () => {
        const entries = [
          ...performance.getEntriesByType('navigation'),
          ...performance.getEntriesByType('resource'),
        ] as PerformanceResourceTiming[];
        this.message.set(weightMessage(totalTransferKb(entries)));
      };
      measure();
      setTimeout(measure, 2500);
    });
  }
}
