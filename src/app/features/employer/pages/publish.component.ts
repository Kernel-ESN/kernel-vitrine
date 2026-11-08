import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CLOCK } from '@core/data/clock';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';

import { SessionStore } from '@features/auth/state/session.store';
import { formatDay, formatMoney } from '@features/listings/models/deadline';
import {
  labelOf,
  ListingType,
  REGIONS,
  SECTORS,
  TYPE_LABELS,
  UNIVERSES,
} from '@features/listings/models/listing';
import { EmployerApi } from '../data-access/employer.api';
import { EMPLOYER_TEXT } from '../employer.text';
import { ListingDraft, templateFor } from '../models/employer-listing';
import { createListingForm } from './listing-form';

@Component({
  selector: 'app-publish',
  imports: [...FIELD, FocusInvalidDirective, ReactiveFormsModule],
  templateUrl: './publish.component.html',
  styleUrl: './employer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishComponent {
  private readonly api = inject(EmployerApi);
  private readonly router = inject(Router);
  private readonly now = inject(CLOCK);
  private readonly session = inject(SessionStore);
  private draftId = inject(ActivatedRoute).snapshot.queryParamMap.get('id');

  protected readonly text = EMPLOYER_TEXT;
  protected readonly labels = TYPE_LABELS;
  protected readonly universes = UNIVERSES;
  protected readonly sectors = SECTORS;
  protected readonly regions = REGIONS;
  protected readonly step = signal(1);
  protected readonly failed = signal(false);
  protected readonly draftSaved = signal(false);
  protected readonly moderationNote = signal<string | null>(null);
  protected readonly minDate = this.now().toISOString().slice(0, 10);

  protected readonly form = createListingForm(inject(FormBuilder).nonNullable, this.now);

  private readonly snapshot = signal(this.form.getRawValue());
  protected readonly preview = computed(() => {
    const value = this.snapshot();
    return {
      ...value,
      typeLabel: value.type ? TYPE_LABELS[value.type] : '',
      sector: labelOf(SECTORS, value.sectorId),
      region: labelOf(REGIONS, value.regionId),
      day: value.deadline ? formatDay(`${value.deadline}T12:00:00Z`) : '',
      money: value.budget ? formatMoney(value.budget, 'FCFA') : '',
    };
  });

  constructor() {
    if (this.session.loggedIn() && this.draftId) {
      this.api.get(this.draftId).subscribe((draft) => {
        if (draft) {
          this.form.patchValue({ ...draft });
          this.moderationNote.set(draft.moderationNote ?? null);
          this.step.set(2);
        }
      });
    }
  }

  protected invalid(name: 'type'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  /** Le contact exigé dépend du mode choisi. */
  protected get contactMissing(): 'email' | 'url' | null {
    const { applyMode, applyEmail, applyUrl } = this.form.getRawValue();
    if (applyMode === 'EMAIL' && !applyEmail) return 'email';
    if (applyMode === 'LIEN' && !applyUrl) return 'url';
    return null;
  }

  protected chooseType(type: ListingType): void {
    this.form.controls.type.setValue(type);
    const { description, instructions, applyMode } = this.form.getRawValue();
    const template = templateFor(type);
    const untouched = !this.form.controls.description.dirty;
    this.form.patchValue({
      description: untouched ? template.description : description,
      instructions: instructions || template.instructions,
      applyMode: untouched ? template.applyMode : applyMode,
    });
  }

  protected next(): void {
    if (this.step() === 1) {
      this.form.controls.type.markAsTouched();
      if (this.form.controls.type.valid) this.step.set(2);
      return;
    }
    this.form.markAllAsTouched();
    if (this.form.valid && !this.contactMissing) {
      this.snapshot.set(this.form.getRawValue());
      this.step.set(3);
    }
  }

  protected back(): void {
    this.step.update((step) => Math.max(1, step - 1));
  }

  protected saveDraft(): void {
    this.persist(false);
  }

  protected submit(): void {
    this.persist(true);
  }

  private persist(submit: boolean): void {
    const { type, budget, ...value } = this.form.getRawValue();
    if (!this.session.loggedIn() || !type) {
      return;
    }
    const draft: ListingDraft = { ...value, type, budget };
    this.failed.set(false);
    this.api.save(draft, this.draftId, submit).subscribe({
      next: (saved) => {
        this.draftId = saved.id;
        if (submit) {
          void this.router.navigateByUrl('/employeur');
        } else {
          this.draftSaved.set(true);
        }
      },
      error: () => this.failed.set(true),
    });
  }
}
