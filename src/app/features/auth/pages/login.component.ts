import { ChangeDetectionStrategy, Component, inject, isDevMode, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { safeReturnUrl } from '../auth.guard';
import { AUTH_TEXT } from '../auth.text';
import { AuthApi, AuthError, SAMPLE_ACCOUNTS } from '../data-access/auth.api';
import { UserRole } from '../models/user';
import { SessionStore } from '../state/session.store';

const HOME_BY_ROLE: Readonly<Record<UserRole, string>> = {
  CANDIDAT: '/compte',
  EMPLOYEUR: '/employeur',
  ADMIN: '/moderation',
};

@Component({
  selector: 'app-login',
  imports: [...FIELD, FocusInvalidDirective, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly api = inject(AuthApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly text = AUTH_TEXT;
  /** Jamais affichés dans un build de production. */
  protected readonly samples = isDevMode() ? SAMPLE_ACCOUNTS : [];
  protected readonly retour = this.params.get('retour');
  protected readonly error = signal<AuthError | null>(null);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.api.login(email, password).subscribe({
      next: (user) => {
        this.session.open(user);
        const fallback = HOME_BY_ROLE[user.role];
        void this.router.navigateByUrl(this.retour ? safeReturnUrl(this.retour) : fallback);
      },
      error: (error: AuthError) => this.error.set(error),
    });
  }
}
