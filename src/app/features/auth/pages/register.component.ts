import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { safeReturnUrl } from '../auth.guard';
import { AUTH_TEXT } from '../auth.text';
import { AuthApi, AuthError } from '../data-access/auth.api';
import { fileProblem } from '@shared/validation/file-check';
import {
  ORGANIZATION_DOCUMENT,
  OrganizationType,
  PHONE_PATTERN,
  RegistrationRole,
} from '../models/user';
import { SessionStore } from '../state/session.store';

@Component({
  selector: 'app-register',
  imports: [...FIELD, FocusInvalidDirective, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly api = inject(AuthApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly text = AUTH_TEXT;
  protected readonly retour = inject(ActivatedRoute).snapshot.queryParamMap.get('retour');
  protected readonly error = signal<AuthError | null>(null);
  protected readonly orgTypes: readonly (readonly [OrganizationType, string])[] = [
    ['ONG', 'ONG'],
    ['MINISTERE', 'Ministère ou institution'],
    ['ENTREPRISE', 'Entreprise'],
    ['AUTRE', 'Autre'],
  ];
  protected readonly form = inject(FormBuilder).nonNullable.group({
    role: ['CANDIDAT' as RegistrationRole],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    orgName: ['', Validators.maxLength(160)],
    orgType: ['ONG' as OrganizationType],
    orgPhone: [''],
  });
  protected readonly role = toSignal(this.form.controls.role.valueChanges, {
    initialValue: 'CANDIDAT' as RegistrationRole,
  });

  protected readonly document = signal<File | null>(null);
  protected readonly documentTouched = signal(false);
  protected readonly documentProblem = computed(() =>
    this.documentTouched() ? fileProblem(this.document(), ORGANIZATION_DOCUMENT) : null,
  );

  protected pickDocument(event: Event): void {
    this.document.set((event.target as HTMLInputElement).files?.[0] ?? null);
    this.documentTouched.set(true);
  }

  protected get phoneProblem(): boolean {
    const { orgPhone } = this.form.controls;
    return (
      this.role() === 'EMPLOYEUR' && orgPhone.touched && !PHONE_PATTERN.test(orgPhone.value.trim())
    );
  }

  protected get orgMissing(): boolean {
    const { orgName } = this.form.controls;
    return this.role() === 'EMPLOYEUR' && !orgName.value.trim() && orgName.touched;
  }

  protected submit(): void {
    this.error.set(null);
    const value = this.form.getRawValue();
    const employer = value.role === 'EMPLOYEUR';
    const file = this.document();
    const employerIncomplete =
      employer &&
      (!value.orgName.trim() ||
        !PHONE_PATTERN.test(value.orgPhone.trim()) ||
        fileProblem(file, ORGANIZATION_DOCUMENT) !== null);
    if (this.form.invalid || employerIncomplete) {
      this.form.markAllAsTouched();
      this.documentTouched.set(employer);
      return;
    }
    this.api
      .register({
        name: value.name,
        email: value.email,
        password: value.password,
        role: value.role,
        phone: employer ? value.orgPhone.trim() : undefined,
        organization:
          employer && file
            ? { name: value.orgName.trim(), type: value.orgType, document: file }
            : undefined,
      })
      .subscribe({
        next: (user) => {
          this.session.open(user);
          const fallback = employer ? '/employeur' : '/compte';
          void this.router.navigateByUrl(this.retour ? safeReturnUrl(this.retour) : fallback);
        },
        error: (error: AuthError) => this.error.set(error),
      });
  }
}
