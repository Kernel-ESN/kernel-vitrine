import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BellPlus } from 'lucide-angular';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { SessionStore } from '@features/auth/state/session.store';
import { AlertsApi } from '../data-access/alerts.api';
import {
  AlertFrequency,
  criteriaFromParams,
  describeCriteria,
  FREQUENCY_LABELS,
} from '../models/alert';
import { ALERTS_TEXT } from '../alerts.text';

@Component({
  selector: 'app-alert-new',
  imports: [...FIELD, FocusInvalidDirective, IconComponent, ReactiveFormsModule],
  templateUrl: './alert-new.component.html',
  styleUrl: './alerts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertNewComponent {
  private readonly api = inject(AlertsApi);
  private readonly router = inject(Router);
  private readonly criteria = criteriaFromParams(inject(ActivatedRoute).snapshot.queryParams);

  protected readonly text = ALERTS_TEXT;
  protected readonly icon = BellPlus;
  protected readonly summary = describeCriteria(this.criteria);
  protected readonly frequencies = Object.entries(FREQUENCY_LABELS) as readonly [
    AlertFrequency,
    string,
  ][];
  protected readonly failed = signal(false);
  protected readonly email = inject(SessionStore).user()?.email ?? '';
  protected readonly form = inject(FormBuilder).nonNullable.group({
    frequency: ['QUOTIDIEN' as AlertFrequency, Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { frequency } = this.form.getRawValue();
    this.api.create({ criteria: this.criteria, channel: 'EMAIL', frequency }).subscribe({
      next: () => void this.router.navigate(['/alertes'], { queryParams: { creee: 1 } }),
      error: () => this.failed.set(true),
    });
  }
}
