import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { SessionStore } from '@features/auth/state/session.store';
import { Listing, listingLink } from '@features/listings/models/listing';
import { toSaved } from '@features/listings/models/saved-listing';
import { ACCOUNT_TEXT } from '../account.text';
import { AccountApi } from '../data-access/account.api';
import { cvError, SavedCv } from '../models/account';

type Stage = 'form' | 'sent' | 'already';

@Component({
  selector: 'app-apply',
  imports: [...FIELD, FocusInvalidDirective, ReactiveFormsModule, RouterLink],
  templateUrl: './apply.component.html',
  styleUrl: './account.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyComponent {
  private readonly account = inject(AccountApi);
  private readonly session = inject(SessionStore);
  private readonly confirmation = viewChild<ElementRef<HTMLElement>>('confirmation');

  protected readonly text = ACCOUNT_TEXT;
  protected readonly link = listingLink;
  /** Fournie par le résolveur de la route. */
  readonly listing = input.required<Listing | null>();
  protected readonly acceptsOnline = computed(() => this.listing()?.howToApply.mode === 'EN_LIGNE');
  protected readonly stage = signal<Stage>('form');
  protected readonly failed = signal(false);
  protected readonly cv = signal<File | null>(null);
  protected readonly cvTouched = signal(false);
  protected readonly savedCv = signal<SavedCv | null>(null);
  /** Reprendre le CV du compte est le choix le plus court : il est proposé d'abord. */
  protected readonly useSaved = signal(false);
  protected readonly keepCv = signal(false);
  protected readonly cvProblem = computed(() =>
    this.cvTouched() && !this.useSaved() ? cvError(this.cv()) : null,
  );
  protected readonly form = inject(FormBuilder).nonNullable.group({
    letter: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(4000)]],
    consent: [false, Validators.requiredTrue],
  });

  constructor() {
    effect(() => this.confirmation()?.nativeElement.focus());
    if (this.session.loggedIn()) {
      this.account.cv().subscribe((cv) => {
        this.savedCv.set(cv);
        this.useSaved.set(cv !== null);
      });
    }
    effect(() => {
      const listing = this.listing();
      if (listing && this.session.loggedIn()) {
        this.account.applications().subscribe((items) => {
          if (items.some((item) => item.listing.id === listing.id)) {
            this.stage.set('already');
          }
        });
      }
    });
  }

  protected invalid(name: 'consent'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected pick(event: Event): void {
    this.cv.set((event.target as HTMLInputElement).files?.[0] ?? null);
    this.cvTouched.set(true);
  }

  protected submit(): void {
    this.cvTouched.set(true);
    this.form.markAllAsTouched();
    const listing = this.listing();
    const file = this.useSaved() ? null : this.cv();
    if (this.form.invalid || !listing || (!this.useSaved() && cvError(file))) {
      return;
    }
    this.account
      .apply(toSaved(listing), {
        cv: file,
        letter: this.form.getRawValue().letter,
        keepCv: this.keepCv(),
      })
      .subscribe({
        next: () => this.stage.set('sent'),
        error: () => this.failed.set(true),
      });
  }
}
