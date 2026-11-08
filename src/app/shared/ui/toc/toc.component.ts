import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface TocItem {
  readonly id: string;
  readonly label: string;
}

/** Sommaire d'une page longue : numéroté, l'entrée lue est signalée par `aria-current`. */
@Component({
  selector: 'app-toc',
  imports: [RouterLink],
  template: `<nav class="toc" [attr.aria-label]="label()">
    <p class="toc__title">{{ label() }}</p>
    <ol>
      @for (item of items(); track item.id; let index = $index) {
        <li>
          <a
            class="toc__link"
            [routerLink]="[]"
            [fragment]="item.id"
            [class.toc__link--on]="active() === item.id"
            [attr.aria-current]="active() === item.id ? 'location' : null"
          >
            <span class="toc__index">{{ (index + 1).toString().padStart(2, '0') }}</span>
            {{ item.label }}
          </a>
        </li>
      }
    </ol>
  </nav>`,
  styles: `
    :host {
      display: block;
    }
    .toc__title {
      margin-bottom: var(--space-3);
      color: var(--color-slate);
      font-family: var(--font-mono);
      font-size: var(--text-eyebrow);
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    ol {
      display: grid;
      border-left: var(--rule);
    }
    .toc__link {
      display: grid;
      grid-template-columns: 2rem minmax(0, 1fr);
      align-items: center;
      min-height: var(--target-min);
      margin-left: -1px;
      padding-left: var(--space-4);
      border-left: 1px solid transparent;
      color: var(--color-slate);
      font-size: var(--text-small);
      text-decoration: none;
      transition:
        color var(--transition-hover),
        border-color var(--transition-hover);
    }
    @media (hover: hover) {
      .toc__link:hover {
        color: var(--color-night);
      }
    }
    .toc__link--on {
      border-left-color: var(--color-deep);
      color: var(--color-night);
      font-weight: 500;
    }
    .toc__index {
      color: var(--color-deep);
      font-family: var(--font-mono);
      font-size: var(--text-eyebrow);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TocComponent {
  readonly items = input.required<readonly TocItem[]>();
  readonly active = input<string | null>(null);
  readonly label = input('Sur cette page');
}
