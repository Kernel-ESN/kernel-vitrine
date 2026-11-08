import { MorphStore } from '../state/morph.store';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeCheck, MapPin, Shapes } from 'lucide-angular';
import { CLOCK } from '@core/data/clock';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { publishedLabel } from '../models/deadline';
import { labelOf, Listing, listingLink, SECTORS, TYPE_LABELS } from '../models/listing';
import { LISTINGS_TEXT } from '../listings.text';
import { DeadlineBadgeComponent } from './deadline-badge.component';
import { OrgMarkComponent } from './org-mark.component';
import { SaveListingComponent } from './save-listing.component';

@Component({
  selector: 'app-listing-card',
  imports: [
    DeadlineBadgeComponent,
    IconComponent,
    OrgMarkComponent,
    RouterLink,
    SaveListingComponent,
  ],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingCardComponent {
  protected readonly morph = inject(MorphStore).active;
  private readonly now = inject(CLOCK);

  readonly listing = input.required<Listing>();

  protected readonly text = LISTINGS_TEXT.detail;
  protected readonly icons = { verified: BadgeCheck, pin: MapPin, sector: Shapes };
  protected readonly link = computed(() => listingLink(this.listing()));
  protected readonly type = computed(() => TYPE_LABELS[this.listing().type]);
  protected readonly sector = computed(() => labelOf(SECTORS, this.listing().sectorId));
  protected readonly published = computed(() =>
    publishedLabel(this.listing().publishedAt, this.now()),
  );
}
