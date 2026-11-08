import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextId = 0;

/**
 * Panneau numéroté d'un espace personnel. L'élément hôte porte l'ancre et `data-spy` :
 * `<app-panel id="cv" data-spy index="02" heading="Mon CV">`. Un bouton peut se placer à droite
 * du titre avec `[panelActions]`.
 */
@Component({
  selector: 'app-panel',
  template: `<section class="panel" [attr.aria-labelledby]="headingId">
    <header class="panel__head">
      <div class="panel__titles">
        <p class="panel__index">{{ index() }}</p>
        <h2 [id]="headingId">{{ heading() }}</h2>
        @if (lead(); as text) {
          <p class="panel__lead">{{ text }}</p>
        }
      </div>
      <ng-content select="[panelActions]" />
    </header>
    <ng-content />
  </section>`,
  styles: `
    :host {
      display: block;
    }
    .panel {
      display: grid;
      gap: var(--space-6);
      padding: var(--space-6);
      border: 1px solid var(--color-frost);
      border-radius: var(--radius);
      background: var(--color-white);
    }
    .panel__head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-4);
      padding-bottom: var(--space-4);
      border-bottom: var(--rule);
    }
    .panel__titles {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }
    .panel__index {
      color: var(--color-deep);
      font-family: var(--font-mono);
      font-size: var(--text-eyebrow);
      font-weight: 500;
      letter-spacing: 0.08em;
    }
    h2 {
      margin: 0;
      font-size: var(--text-h3);
      font-weight: 600;
    }
    .panel__lead {
      max-width: 40rem;
      color: var(--color-slate);
      font-size: var(--text-small);
    }
    @media (min-width: 48rem) {
      .panel {
        padding: var(--space-8);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  readonly index = input.required<string>();
  readonly heading = input.required<string>();
  readonly lead = input<string>();

  protected readonly headingId = `panel-title-${nextId++}`;
}
