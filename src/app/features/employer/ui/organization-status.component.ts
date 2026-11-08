import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AUTH_TEXT } from '@features/auth/auth.text';
import { AuthApi } from '@features/auth/data-access/auth.api';
import { ORGANIZATION_DOCUMENT } from '@features/auth/models/user';
import { SessionStore } from '@features/auth/state/session.store';
import { FIELD } from '@shared/ui/field/field.component';
import { fileProblem } from '@shared/validation/file-check';
import { EMPLOYER_TEXT } from '../employer.text';

/** État de la vérification de l'organisation et, après un refus, envoi d'un autre justificatif. */
@Component({
  selector: 'app-organization-status',
  imports: [...FIELD],
  template: `@if (session.user()?.organization; as organization) {
    <div class="status" data-testid="employer-verification">
      <p class="status__line">
        <span class="badge">{{ text.verification[organization.verification] }}</span>
        @switch (organization.verification) {
          @case ('EN_ATTENTE') {
            {{ text.verificationPendingHelp }}
          }
          @case ('REFUSEE') {
            {{ text.verificationRefusedHelp }}
          }
        }
      </p>
      @if (organization.verification === 'REFUSEE') {
        @if (organization.verificationNote; as note) {
          <p data-testid="verification-note">{{ text.verificationReason }} {{ note }}</p>
        }
        <app-field
          controlId="new-document"
          [label]="text.newDocument"
          [hint]="auth.orgDocumentHelp"
          [externalError]="message()"
        >
          <input
            appControl
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            data-testid="new-document"
            (change)="pick($event)"
          />
        </app-field>
      }
    </div>
  }`,
  styles: `
    .status {
      display: grid;
      gap: var(--space-2);
      max-width: 40rem;
      color: var(--color-slate);
    }
    .status__line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationStatusComponent {
  private readonly api = inject(AuthApi);

  protected readonly session = inject(SessionStore);
  protected readonly text = EMPLOYER_TEXT;
  protected readonly auth = AUTH_TEXT;
  protected readonly message = signal<string | null>(null);

  protected pick(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    const problem = fileProblem(file, ORGANIZATION_DOCUMENT);
    if (problem || !file) {
      this.message.set(this.auth.orgDocumentErrors[problem ?? 'missing']);
      return;
    }
    this.message.set(null);
    this.api.replaceOrganizationDocument(file).subscribe({
      next: (user) => this.session.open(user),
      error: () => this.message.set(this.text.documentFailed),
    });
  }
}
