import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Champ du design system. Le libellé, l'aide, l'erreur et les attributs d'accessibilité découlent
 * d'un seul identifiant et de l'état du contrôle : aucun formulaire ne les réécrit.
 */
@Component({
  selector: 'app-field',
  template: `<div class="form-field">
    <label [attr.for]="controlId()">
      {{ label() }}
      @if (note(); as text) {
        <span class="form-field__hint">({{ text }})</span>
      }
    </label>
    <ng-content />
    @if (hint(); as text) {
      <p class="form-field__hint" [id]="controlId() + '-hint'">{{ text }}</p>
    }
    @if (message(); as text) {
      <p class="form-field__error" [id]="controlId() + '-error'">{{ text }}</p>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly note = input<string>();
  readonly hint = input<string>();
  /** Message si le contrôle est invalide. */
  readonly error = input<string>();
  /** Erreur décidée par le formulaire, quand la règle dépasse ce champ. */
  readonly externalError = input<string | null>(null);
  /** Marque le champ invalide sans message propre, par exemple pour une erreur de groupe. */
  readonly markInvalid = input(false);
  /** Identifiant d'un message extérieur au champ. */
  readonly describedBy = input<string | null>(null);

  private readonly control = contentChild(NgControl);
  private readonly revision = signal(0);

  private readonly controlInvalid = computed(() => {
    this.revision();
    const control = this.control()?.control;
    return Boolean(control?.invalid && control.touched);
  });

  readonly message = computed(
    () => this.externalError() || (this.controlInvalid() ? (this.error() ?? '') : ''),
  );
  readonly invalid = computed(
    () => this.controlInvalid() || this.markInvalid() || Boolean(this.externalError()),
  );
  readonly described = computed(() => {
    const parts = [
      this.message() ? `${this.controlId()}-error` : this.markInvalid() ? this.describedBy() : null,
      this.hint() ? `${this.controlId()}-hint` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : null;
  });

  constructor() {
    effect((onCleanup) => {
      const events = this.control()?.control?.events.subscribe(() =>
        this.revision.update((value) => value + 1),
      );
      this.revision.update((value) => value + 1);
      onCleanup(() => events?.unsubscribe());
    });
  }
}

/** À poser sur le `input`, `select` ou `textarea` d'un `app-field`. */
@Directive({
  selector: '[appControl]',
  host: {
    class: 'control',
    '[id]': 'field.controlId()',
    '[attr.aria-invalid]': 'field.invalid()',
    '[attr.aria-describedby]': 'field.described()',
  },
})
export class ControlDirective {
  protected readonly field = inject(FieldComponent);
}

export const FIELD = [FieldComponent, ControlDirective] as const;
