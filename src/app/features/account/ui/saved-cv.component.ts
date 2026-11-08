import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { formatDay } from '@features/listings/models/deadline';
import { FIELD } from '@shared/ui/field/field.component';
import { ACCOUNT_TEXT } from '../account.text';
import { AccountApi } from '../data-access/account.api';
import { cvError, SavedCv } from '../models/account';

@Component({
  selector: 'app-saved-cv',
  imports: [...FIELD],
  template: `<div class="cv" data-testid="saved-cv">
    @if (cv(); as current) {
      <p data-testid="saved-cv-name">{{ description() }}</p>
      <button
        class="btn btn--secondary btn--small cv__remove"
        type="button"
        data-testid="saved-cv-remove"
        (click)="remove()"
      >
        {{ text.cvRemove }}
      </button>
    } @else {
      <p class="empty">{{ text.cvEmpty }}</p>
    }
    <app-field
      controlId="saved-cv-file"
      [label]="cv() ? text.cvReplace : text.cvAdd"
      [hint]="text.cvHelp"
      [externalError]="message()"
    >
      <input
        appControl
        type="file"
        accept=".pdf,.doc,.docx"
        data-testid="saved-cv-file"
        (change)="pick($event)"
      />
    </app-field>
  </div>`,
  styleUrl: '../pages/account.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedCvComponent {
  private readonly api = inject(AccountApi);

  protected readonly text = ACCOUNT_TEXT;
  protected readonly cv = signal<SavedCv | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly description = computed(() => {
    const cv = this.cv();
    return cv ? this.text.cvCurrent(cv.name, formatDay(cv.updatedAt)) : '';
  });

  constructor() {
    this.api.cv().subscribe((cv) => this.cv.set(cv));
  }

  protected pick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const problem = cvError(file);
    if (problem || !file) {
      this.message.set(this.text.cvErrors[problem ?? 'missing']);
      return;
    }
    this.message.set(null);
    this.api.saveCv(file).subscribe({
      next: (cv) => {
        this.cv.set(cv);
        input.value = '';
      },
      error: () => this.message.set(this.text.cvFailed),
    });
  }

  protected remove(): void {
    this.api.removeCv().subscribe(() => this.cv.set(null));
  }
}
