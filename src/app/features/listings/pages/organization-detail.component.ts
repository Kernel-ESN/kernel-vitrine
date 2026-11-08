import { MorphStore } from '../state/morph.store';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BadgeCheck } from 'lucide-angular';
import { SITE_TITLE } from '@core/config/site-info';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LISTINGS_TEXT } from '../listings.text';
import { labelOf, ORGANIZATION_TYPES } from '../models/listing';
import { OrganizationDetail } from '../state/organization.resolver';
import { SavedListingsStore } from '../state/saved-listings.store';
import { ListingCardComponent } from '../ui/listing-card.component';
import { OrgMarkComponent } from '../ui/org-mark.component';

@Component({
  selector: 'app-organization-detail',
  imports: [IconComponent, ListingCardComponent, OrgMarkComponent, RouterLink],
  templateUrl: './organization-detail.component.html',
  styleUrl: './organization-pages.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetailComponent {
  protected readonly morph = inject(MorphStore).active;
  /** Fourni par le résolveur de la route. */
  readonly detail = input.required<OrganizationDetail>();

  protected readonly text = LISTINGS_TEXT.organizations;
  protected readonly crumbs = LISTINGS_TEXT.detail;
  protected readonly verified = BadgeCheck;
  protected readonly organization = computed(() => {
    const detail = this.detail();
    return detail.status === 'ready' ? detail.organization : null;
  });
  protected readonly listings = computed(() => {
    const detail = this.detail();
    return detail.status === 'ready' ? detail.listings : [];
  });
  protected readonly typeLabel = computed(() =>
    labelOf(ORGANIZATION_TYPES, this.organization()?.type),
  );

  constructor() {
    inject(SavedListingsStore).refresh();
    const title = inject(Title);
    effect(() => {
      const organization = this.organization();
      if (organization) {
        title.setTitle(`${organization.name} | ${SITE_TITLE}`);
      }
    });
  }
}
