import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CircleAlert, CircleCheck, Send } from 'lucide-angular';
import { AUDIENCE_NAV } from '@core/config/navigation';
import { SITE_INFO } from '@core/config/site-info';
import { FIELD } from '@shared/ui/field/field.component';
import { FocusInvalidDirective } from '@shared/ui/field/focus-invalid.directive';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { ContactRequest } from '../../contact/models/contact-request';
import { ContactStore } from '../../contact/state/contact.store';
import { offerBySlug } from '../data-access/offers.data';
import {
  BILLING_LABELS,
  formatPrice,
  formatSaving,
  formatThen,
  FREE_MONTHS,
  hasSubscription,
  Offer,
  Period,
} from '../models/offer';
import { BillingPeriodStore } from '../state/billing-period.store';
import { PeriodToggleComponent } from '../ui/period-toggle.component';
import { OFFERS_TEXT } from '../offers.text';

const PHONE_PATTERN = /^\+?[0-9 ().-]{8,20}$/;
const DOMAIN_PATTERN = /^(?!-)[a-z0-9-]{2,63}(?<!-)$/i;
export const EXTENSIONS = ['.com', '.org', '.ne'] as const;

function emailOrPhone(group: AbstractControl): ValidationErrors | null {
  const { email, phone } = group.value as { email: string; phone: string };
  return email.trim() || phone.trim() ? null : { contactMissing: true };
}

export interface OrderValue {
  readonly name: string;
  readonly organization: string;
  readonly audience: string;
  readonly email: string;
  readonly phone: string;
  readonly domain: string;
  readonly extension: string;
  readonly mailboxes: number | null;
  readonly options: readonly string[];
  readonly message: string;
}

/** La commande part par le même canal que le formulaire de contact, sous forme de devis. */
export function toOrderRequest(
  offer: Offer,
  value: OrderValue,
  period: Period = 'mois',
): ContactRequest {
  const lines = [`Commande : ${offer.nav.label} (${BILLING_LABELS[offer.content.billing]})`];
  if (hasSubscription(offer.content.price)) {
    lines.push(
      period === 'an' ? `Formule : annuelle (${FREE_MONTHS} mois offerts)` : 'Formule : mensuelle',
    );
  }
  if (offer.content.asksDomain) {
    const name = value.domain.trim()
      ? `${value.domain.trim().toLowerCase()}${value.extension}`
      : 'à choisir ensemble';
    lines.push(`Nom de domaine souhaité : ${name}`);
    if (value.mailboxes !== null) {
      lines.push(`Adresses mail : ${value.mailboxes}`);
    }
  }
  if (value.options.length) {
    lines.push(`Options : ${value.options.join(', ')}`);
  }
  if (value.message.trim()) {
    lines.push('', value.message.trim());
  }
  return {
    subject: 'devis',
    service: `offre:${offer.nav.slug}`,
    name: value.name.trim(),
    organization: value.organization.trim() || null,
    audience: value.audience,
    email: value.email.trim() || null,
    phone: value.phone.trim() || null,
    message: lines.join('\n'),
  };
}

@Component({
  selector: 'app-offer-order',
  imports: [
    PeriodToggleComponent,
    ...FIELD,
    FocusInvalidDirective,
    IconComponent,
    PageHeroComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  providers: [ContactStore],
  templateUrl: './offer-order.component.html',
  styleUrl: './offer-order.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferOrderComponent {
  /** Fourni par les données de la route. */
  readonly slug = input.required<string>();

  protected readonly store = inject(ContactStore);
  protected readonly text = OFFERS_TEXT;
  protected readonly price = formatPrice;
  protected readonly saving = formatSaving;
  protected readonly subscribed = hasSubscription;
  protected readonly period = inject(BillingPeriodStore).period;
  protected readonly priceAfter = formatThen;
  protected readonly site = SITE_INFO;
  protected readonly audiences = AUDIENCE_NAV;
  protected readonly extensions = EXTENSIONS;
  protected readonly billing = BILLING_LABELS;
  protected readonly icons = { send: Send, alert: CircleAlert, check: CircleCheck };
  protected readonly offer = computed(() => offerBySlug(this.slug())!);
  protected readonly crumbs = computed(() => [
    { label: OFFERS_TEXT.eyebrow, link: '/offres' },
    { label: this.offer().nav.label, link: `/offres/${this.offer().nav.slug}` },
  ]);

  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(120)]],
      organization: ['', Validators.maxLength(160)],
      audience: ['', Validators.required],
      email: ['', [Validators.email, Validators.maxLength(254)]],
      phone: ['', Validators.pattern(PHONE_PATTERN)],
      domain: ['', Validators.pattern(DOMAIN_PATTERN)],
      extension: ['.com'],
      mailboxes: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(200)]),
      options: this.fb.array<boolean>([]),
      message: ['', Validators.maxLength(1500)],
      // Champ piège : invisible pour un humain, rempli par les robots.
      website: [''],
    },
    { validators: emailOrPhone },
  );

  private readonly confirmation = viewChild<ElementRef<HTMLElement>>('confirmation');

  constructor() {
    effect(() => {
      const options = this.form.controls.options as FormArray;
      options.clear();
      this.offer().content.options.forEach(() => options.push(this.fb.nonNullable.control(false)));
    });
    effect(() => this.confirmation()?.nativeElement.focus());
  }

  protected get optionControls() {
    return this.form.controls.options.controls;
  }

  protected contactMissing(): boolean {
    const { email, phone } = this.form.controls;
    return this.form.hasError('contactMissing') && email.touched && phone.touched;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { website, options, ...value } = this.form.getRawValue();
    if (website) {
      return;
    }
    const chosen = this.offer().content.options.filter((_, index) => options[index]);
    this.store.submit(toOrderRequest(this.offer(), { ...value, options: chosen }, this.period()));
  }
}
