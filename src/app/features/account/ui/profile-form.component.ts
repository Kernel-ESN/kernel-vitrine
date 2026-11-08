import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '@features/auth/data-access/auth.api';
import { PHONE_PATTERN } from '@features/auth/models/user';
import { SessionStore } from '@features/auth/state/session.store';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { ACCOUNT_TEXT } from '../account.text';

@Component({
  selector: 'app-profile-form',
  imports: [...FIELD, FocusInvalidDirective, ReactiveFormsModule],
  template: `<form
    class="form form--profile"
    novalidate
    appFocusInvalid
    data-testid="profile-form"
    [formGroup]="form"
    (ngSubmit)="save()"
  >
    <app-field
      class="form__half"
      controlId="profile-name"
      [label]="text.profileName"
      [error]="text.profileNameError"
    >
      <input appControl autocomplete="name" formControlName="name" />
    </app-field>
    <app-field
      class="form__half"
      controlId="profile-phone"
      [label]="text.profilePhone"
      [note]="text.optional"
      [error]="text.profilePhoneError"
    >
      <input appControl type="tel" autocomplete="tel" formControlName="phone" />
    </app-field>
    <app-field controlId="profile-email" [label]="text.profileEmail" [hint]="text.profileEmailHelp">
      <input appControl type="email" readonly [value]="session.user()?.email ?? ''" />
    </app-field>
    <p class="status" role="status" data-testid="profile-status">{{ status() }}</p>
    <button class="btn btn--primary btn--small" type="submit" data-testid="profile-save">
      {{ text.profileSave }}
    </button>
  </form>`,
  styleUrl: '../pages/account.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFormComponent {
  private readonly api = inject(AuthApi);

  protected readonly session = inject(SessionStore);
  protected readonly text = ACCOUNT_TEXT;
  protected readonly status = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: [this.session.user()?.name ?? '', [Validators.required, Validators.maxLength(120)]],
    phone: [this.session.user()?.phone ?? '', Validators.pattern(PHONE_PATTERN)],
  });

  protected save(): void {
    this.status.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.api.updateProfile(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.session.open(user);
        this.status.set(this.text.profileSaved);
      },
      error: () => this.status.set(this.text.profileFailed),
    });
  }
}
