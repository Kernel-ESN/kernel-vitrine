import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, Check, Minus } from 'lucide-angular';
import { OFFER_CATEGORIES, OfferCategory } from '@core/config/navigation';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { RevealDirective } from '@shared/ui/reveal/reveal.directive';
import { ALWAYS_INCLUDED, offerBySlug, OFFERS, SITE_COMPARISON } from '../data-access/offers.data';
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

@Component({
  selector: 'app-offers',
  imports: [
    PeriodToggleComponent,
    CtaBandComponent,
    IconComponent,
    PageHeroComponent,
    RevealDirective,
    RouterLink,
  ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  protected readonly text = OFFERS_TEXT;
  protected readonly price = formatPrice;
  protected readonly saving = formatSaving;
  protected readonly subscribed = hasSubscription;
  protected readonly period = inject(BillingPeriodStore).period;
  protected readonly priceAfter = formatThen;
  protected readonly arrow = ArrowRight;
  protected readonly billing = BILLING_LABELS;
  protected readonly categories = OFFER_CATEGORIES.filter((category) =>
    OFFERS.some((offer) => offer.nav.category === category.id),
  );
  protected readonly included = ALWAYS_INCLUDED;
  protected readonly marks = { yes: Check, no: Minus };
  protected readonly comparison = SITE_COMPARISON;
  protected readonly compared = SITE_COMPARISON.slugs.map((slug) => offerBySlug(slug)!);
  protected readonly category = signal<OfferCategory | null>(null);
  protected readonly shown = computed(() => {
    const category = this.category();
    return category ? OFFERS.filter((offer) => offer.nav.category === category) : OFFERS;
  });

  protected isText(value: boolean | string): value is string {
    return typeof value === 'string';
  }

  protected categoryLabel(id: OfferCategory): string {
    return OFFER_CATEGORIES.find((category) => category.id === id)?.label ?? '';
  }
}
