import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Send } from 'lucide-angular';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AudienceNav, EXPERTISE_NAV } from '@core/config/navigation';
import { ContactFormValue, ContactSubject } from '../models/contact-request';

const PHONE_PATTERN = /^\+?[0-9 ().-]{8,20}$/;

function emailOrPhone(group: AbstractControl): ValidationErrors | null {
  const { email, phone } = group.value as { email: string; phone: string };
  return email.trim() || phone.trim() ? null : { contactMissing: true };
}

@Component({
  selector: 'app-contact-form',
  imports: [...FIELD, FocusInvalidDirective, IconComponent, ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent {
  protected readonly sendIcon = Send;
  protected readonly services = EXPERTISE_NAV;

  readonly audiences = input.required<readonly AudienceNav[]>();
  readonly initialAudience = input<string | undefined>();
  readonly initialSubject = input<string | undefined>();
  readonly initialService = input<string | undefined>();
  readonly sending = input(false);
  readonly disabled = input(false);
  readonly submitted = output<ContactFormValue>();

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      subject: ['question' as ContactSubject, Validators.required],
      service: [''],
      name: ['', [Validators.required, Validators.maxLength(120)]],
      organization: ['', Validators.maxLength(160)],
      audience: ['', Validators.required],
      email: ['', [Validators.email, Validators.maxLength(254)]],
      phone: ['', Validators.pattern(PHONE_PATTERN)],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      // Champ piège : invisible pour un humain, rempli par les robots.
      website: [''],
    },
    { validators: emailOrPhone },
  );

  constructor() {
    effect(() => {
      const slug = this.initialAudience();
      if (slug && this.audiences().some((audience) => audience.slug === slug)) {
        this.form.controls.audience.setValue(slug);
      }
    });
    effect(() => {
      if (this.initialSubject() === 'devis') {
        this.form.controls.subject.setValue('devis');
      }
      const service = this.initialService();
      if (service && this.services.some((item) => item.slug === service)) {
        this.form.controls.service.setValue(service);
      }
    });
  }

  protected contactMissing(): boolean {
    const { email, phone } = this.form.controls;
    return this.form.hasError('contactMissing') && email.touched && phone.touched;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { website, ...value } = this.form.getRawValue();
    if (!website) {
      this.submitted.emit(value);
    }
  }
}
