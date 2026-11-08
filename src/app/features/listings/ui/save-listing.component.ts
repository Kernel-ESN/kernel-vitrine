import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Bookmark, BookmarkCheck } from 'lucide-angular';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { SessionStore } from '@features/auth/state/session.store';
import { LISTINGS_TEXT } from '../listings.text';
import { Listing } from '../models/listing';
import { SavedListingsStore } from '../state/saved-listings.store';

@Component({
  selector: 'app-save-listing',
  imports: [IconComponent],
  template: `@if (compact()) {
      <button
        class="icon-button"
        type="button"
        data-testid="save-listing-card"
        [attr.aria-pressed]="isSaved()"
        [attr.aria-label]="
          isSaved() ? text.savedShort(listing().title) : text.saveShort(listing().title)
        "
        (click)="toggle()"
      >
        <app-icon [data]="isSaved() ? icons.on : icons.off" [size]="22" />
      </button>
    } @else {
      <button
        class="btn btn--secondary btn--small"
        type="button"
        data-testid="save-listing"
        [attr.aria-pressed]="isSaved()"
        (click)="toggle()"
      >
        <app-icon [data]="isSaved() ? icons.on : icons.off" [size]="20" />
        {{ isSaved() ? text.saved : text.save }}
      </button>
    }`,
  styles: `
    :host {
      display: block;
    }
    .btn:hover app-icon {
      transform: none;
    }
    .icon-button {
      display: grid;
      place-items: center;
      width: var(--target-min);
      height: var(--target-min);
      padding: 0;
      border: 0;
      border-radius: var(--radius);
      background: none;
      color: var(--color-deep);
      cursor: pointer;
      transition:
        background var(--transition-hover),
        color var(--transition-hover);
    }
    @media (hover: hover) {
      .icon-button:hover {
        background: var(--color-frost);
        color: var(--color-abyss);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveListingComponent {
  private readonly store = inject(SavedListingsStore);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly listing = input.required<Listing>();
  /** Sur une carte : l'icône seule. */
  readonly compact = input(false);

  protected readonly text = LISTINGS_TEXT.detail;
  protected readonly icons = { on: BookmarkCheck, off: Bookmark };
  protected readonly isSaved = computed(() => this.store.isSaved(this.listing().id));

  protected toggle(): void {
    if (!this.session.loggedIn()) {
      void this.router.navigate(['/connexion'], { queryParams: { retour: this.router.url } });
      return;
    }
    this.store.toggle(this.listing()).subscribe();
  }
}
