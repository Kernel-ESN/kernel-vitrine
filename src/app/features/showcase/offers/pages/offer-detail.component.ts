import { PhotoKey } from '@shared/ui/photo/photos';
import { ChangeDetectionStrategy, Component, inject, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Check, MessageCircle, Phone, Plus } from 'lucide-angular';
import { SITE_INFO } from '@core/config/site-info';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { FaqComponent } from '@shared/ui/faq/faq.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { offerBySlug } from '../data-access/offers.data';
import {
  BILLING_LABELS,
  formatPrice,
  formatSaving,
  formatThen,
  hasSubscription,
} from '../models/offer';
import { BillingPeriodStore } from '../state/billing-period.store';
import { PeriodToggleComponent } from '../ui/period-toggle.component';
import { OFFERS_TEXT } from '../offers.text';

/** Les fiches qui ont une photo de métier ; les autres gardent la trame. */
const OFFER_PHOTOS: Readonly<Partial<Record<string, PhotoKey>>> = {
  'integration-ia': 'developpeuseCode',
};

@Component({
  selector: 'app-offer-detail',
  imports: [
    PeriodToggleComponent,
    CtaBandComponent,
    FaqComponent,
    IconComponent,
    PageHeroComponent,
    RouterLink,
  ],
  templateUrl: './offer-detail.component.html',
  styleUrl: './offer-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferDetailComponent {
  /** Fourni par les données de la route : une route par offre existe. */
  readonly slug = input.required<string>();

  protected readonly text = OFFERS_TEXT;
  protected readonly price = formatPrice;
  protected readonly saving = formatSaving;
  protected readonly subscribed = hasSubscription;
  protected readonly period = inject(BillingPeriodStore).period;
  protected readonly priceAfter = formatThen;
  protected readonly site = SITE_INFO;
  protected readonly billing = BILLING_LABELS;
  protected readonly icons = { check: Check, plus: Plus, phone: Phone, question: MessageCircle };
  protected readonly photo = computed(() => OFFER_PHOTOS[this.slug()]);
  protected readonly offer = computed(() => offerBySlug(this.slug())!);
  protected readonly crumbs = [{ label: OFFERS_TEXT.eyebrow, link: '/offres' }];
}
