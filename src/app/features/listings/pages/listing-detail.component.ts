import { MorphStore } from '../state/morph.store';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeCheck, BellPlus, Download, ExternalLink, Mail, MapPin, Send } from 'lucide-angular';
import { CLOCK } from '@core/data/clock';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ListingSeoService } from '../data-access/listing-seo.service';
import { LISTINGS_TEXT } from '../listings.text';
import { formatSize, isExpired, publishedLabel } from '../models/deadline';
import { TYPE_LABELS, Universe, universeInfo } from '../models/listing';
import { listingFacts } from '../models/listing-facts';
import { ListingDetail } from '../state/listing-detail.resolver';
import { SavedListingsStore } from '../state/saved-listings.store';
import { DeadlineBadgeComponent } from '../ui/deadline-badge.component';
import { ListingCardComponent } from '../ui/listing-card.component';
import { OrgMarkComponent } from '../ui/org-mark.component';
import { SaveListingComponent } from '../ui/save-listing.component';
import { ShareActionsComponent } from '../ui/share-actions.component';

@Component({
  selector: 'app-listing-detail',
  imports: [
    DeadlineBadgeComponent,
    IconComponent,
    ListingCardComponent,
    OrgMarkComponent,
    RouterLink,
    SaveListingComponent,
    ShareActionsComponent,
  ],
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingDetailComponent {
  protected readonly morph = inject(MorphStore).active;
  private readonly now = inject(CLOCK);
  private readonly seo = inject(ListingSeoService);

  /** Fournis par le routeur : la route et son résolveur. */
  readonly universe = input.required<Universe>();
  readonly detail = input.required<ListingDetail>();

  protected readonly text = LISTINGS_TEXT.detail;
  protected readonly size = formatSize;
  protected readonly icons = {
    pin: MapPin,
    verified: BadgeCheck,
    alert: BellPlus,
    download: Download,
    mail: Mail,
    link: ExternalLink,
    apply: Send,
  };

  protected readonly listing = computed(() => {
    const detail = this.detail();
    return detail.status === 'ready' ? detail.listing : null;
  });
  protected readonly similar = computed(() => {
    const detail = this.detail();
    return detail.status === 'ready' ? detail.similar : [];
  });
  protected readonly fromOrganization = computed(() => {
    const detail = this.detail();
    return detail.status === 'ready' ? detail.fromOrganization : [];
  });
  protected readonly universeLabel = computed(() => universeInfo(this.universe()).label);
  protected readonly type = computed(() => {
    const listing = this.listing();
    return listing ? TYPE_LABELS[listing.type] : '';
  });
  protected readonly published = computed(() => {
    const listing = this.listing();
    return listing ? publishedLabel(listing.publishedAt, this.now()) : '';
  });
  protected readonly backPath = computed(() => ['/', universeInfo(this.universe()).path]);
  protected readonly expired = computed(() => {
    const listing = this.listing();
    return listing !== null && isExpired(listing.deadline, this.now());
  });
  protected readonly applyTitle = computed(() => {
    const titles = {
      EMPLOI: this.text.apply.job,
      MARCHE: this.text.apply.market,
      AUTRE: this.text.apply.other,
    };
    return titles[this.universe()];
  });
  protected readonly facts = computed(() => {
    const listing = this.listing();
    return listing ? listingFacts(listing) : [];
  });
  protected readonly alertParams = computed(() => {
    const listing = this.listing();
    return listing ? { univers: listing.universe, secteur: listing.sectorId } : {};
  });

  constructor() {
    inject(SavedListingsStore).refresh();
    effect((onCleanup) => {
      const listing = this.listing();
      if (listing) {
        this.seo.apply(listing);
        onCleanup(() => this.seo.clear());
      }
    });
  }
}
