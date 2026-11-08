import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FREE_MONTHS, Period } from '../models/offer';
import { BillingPeriodStore } from '../state/billing-period.store';

let nextId = 0;

/** Choix de la formule : deux boutons radio natifs, présentés comme un sélecteur segmenté. */
@Component({
  selector: 'app-period-toggle',
  template: `<fieldset class="period" data-testid="period-toggle">
    <legend class="visually-hidden">Formule de l'abonnement</legend>
    @for (option of options; track option.value) {
      <label class="period__option" [class.period__option--on]="store.period() === option.value">
        <input
          class="period__input"
          type="radio"
          [name]="name"
          [value]="option.value"
          [checked]="store.period() === option.value"
          [attr.data-testid]="'period-' + option.value"
          (change)="choose(option.value)"
        />
        {{ option.label }}
        @if (option.value === 'an') {
          <span class="period__saving">{{ saving }}</span>
        }
      </label>
    }
  </fieldset>`,
  styles: `
    :host {
      display: inline-block;
    }
    .period {
      display: inline-flex;
      margin: 0;
      padding: 0;
      border: 1px solid var(--color-frost);
      border-radius: var(--radius);
      background: var(--color-white);
    }
    .period__option {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: var(--target-min);
      padding: 0 var(--space-4);
      border-radius: var(--radius);
      color: var(--color-night);
      font-size: var(--text-small);
      font-weight: 500;
      cursor: pointer;
      transition:
        background var(--transition-hover),
        color var(--transition-hover);
    }
    @media (hover: hover) {
      .period__option:hover {
        color: var(--color-deep);
      }
    }
    .period__option--on,
    .period__option--on:hover {
      background: var(--color-night);
      color: var(--color-white);
    }
    .period__option:has(.period__input:focus-visible) {
      outline: 2px solid var(--color-deep);
      outline-offset: 2px;
    }
    // Le bouton radio reste atteignable au clavier ; le libellé fait office de bouton.
    .period__input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    .period__saving {
      color: var(--color-deep);
      font-family: var(--font-mono);
      font-size: var(--text-eyebrow);
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .period__option--on .period__saving {
      color: var(--color-kernel);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodToggleComponent {
  protected readonly store = inject(BillingPeriodStore);
  protected readonly name = `period-${nextId++}`;
  protected readonly saving = `${FREE_MONTHS} mois offerts`;
  protected readonly options: readonly { readonly value: Period; readonly label: string }[] = [
    { value: 'mois', label: 'Mensuel' },
    { value: 'an', label: 'Annuel' },
  ];

  protected choose(period: Period): void {
    this.store.period.set(period);
  }
}
