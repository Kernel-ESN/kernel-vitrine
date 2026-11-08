import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { MODERATION_TEXT } from '../moderation.text';

/** Une décision négative porte toujours un motif : l'organisation doit savoir quoi corriger. */
@Component({
  selector: 'app-reason-form',
  imports: [...FIELD, FocusInvalidDirective, ReactiveFormsModule],
  template: `<form
    class="reason"
    novalidate
    appFocusInvalid
    data-testid="reason-form"
    [formGroup]="form"
    (ngSubmit)="submit()"
  >
    <app-field [controlId]="controlId()" [label]="text.reasonLabel" [error]="text.reasonError">
      <textarea appControl rows="3" formControlName="reason"></textarea>
    </app-field>
    <div class="reason__actions">
      <button class="btn btn--primary btn--small" type="submit" data-testid="reason-confirm">
        {{ text.confirm }}
      </button>
      <button class="btn btn--secondary btn--small" type="button" (click)="cancelled.emit()">
        {{ text.cancel }}
      </button>
    </div>
  </form>`,
  styles: `
    .reason {
      display: grid;
      gap: var(--space-3);
      max-width: 40rem;
    }
    .reason__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReasonFormComponent {
  readonly controlId = input.required<string>();
  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  protected readonly text = MODERATION_TEXT;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirmed.emit(this.form.getRawValue().reason.trim());
  }
}
