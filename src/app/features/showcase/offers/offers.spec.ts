import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { OFFER_NAV } from '@core/config/navigation';
import { ContactGateway } from '../contact/data-access/contact.gateway';
import { ContactRequest } from '../contact/models/contact-request';
import { OFFERS, offerBySlug, SITE_COMPARISON } from './data-access/offers.data';
import { formatPrice, formatSaving, formatThen } from './models/offer';
import { BillingPeriodStore } from './state/billing-period.store';
import { OfferDetailComponent } from './pages/offer-detail.component';
import { OfferOrderComponent, toOrderRequest } from './pages/offer-order.component';
import { OffersComponent } from './pages/offers.component';

class FakeGateway extends ContactGateway {
  readonly available = true;
  sent: ContactRequest[] = [];
  send(request: ContactRequest): Observable<void> {
    this.sent.push(request);
    return of(undefined);
  }
}

describe('offres : contenu', () => {
  it('a un contenu complet pour chaque offre du menu', () => {
    for (const nav of OFFER_NAV) {
      const offer = offerBySlug(nav.slug);
      expect(offer?.content, nav.slug).toBeDefined();
      expect(offer!.content.includes.length, nav.slug).toBeGreaterThan(2);
      expect(offer!.content.faq.length, nav.slug).toBeGreaterThan(0);
    }
  });

  it('donne à chaque offre un prix indicatif ou un chiffrage sur devis', () => {
    for (const offer of OFFERS) {
      const price = offer.content.price;
      expect(
        Boolean(price.onQuote) || (price.setup ?? 0) > 0 || (price.monthly ?? 0) > 0,
        offer.nav.slug,
      ).toBe(true);
    }
    expect(formatPrice({ setup: 450_000, monthly: 9_000 })).toBe('À partir de 450\u202f000 FCFA');
    expect(formatPrice({ onQuote: true })).toBe('Sur devis');
  });

  it('facture l’annuel dix mois sur douze, et le dit', () => {
    const price = { setup: 450_000, monthly: 9_000 };
    expect(formatThen(price, 'mois')).toBe('puis 9\u202f000 FCFA par mois');
    expect(formatThen(price, 'an')).toBe('puis 90\u202f000 FCFA par an');
    expect(formatPrice({ monthly: 3_500 }, 'an')).toBe('À partir de 35\u202f000 FCFA par an');
    expect(formatSaving(price, 'an')).toBe('2 mois offerts');
    expect(formatSaving(price, 'mois')).toBeNull();
    expect(formatSaving({ setup: 200_000 }, 'an')).toBeNull();
  });
});

describe('offres : comparatif', () => {
  it('compare des offres qui existent, avec une valeur par offre', () => {
    for (const slug of SITE_COMPARISON.slugs) {
      expect(offerBySlug(slug), slug).toBeDefined();
    }
    for (const row of SITE_COMPARISON.rows) {
      expect(row.values.length, row.label).toBe(SITE_COMPARISON.slugs.length);
    }
  });

  it('ne promet pas de formation là où la fiche n’en parle pas', () => {
    const training = SITE_COMPARISON.rows.find((row) => row.label.includes('Formation'))!;
    SITE_COMPARISON.slugs.forEach((slug, index) => {
      const promised = offerBySlug(slug)!.content.includes.some((item) =>
        item.includes('formation'),
      );
      expect(Boolean(training.values[index]), slug).toBe(promised);
    });
  });
});

describe('offres : pages', () => {
  async function open(url: string, gateway = new FakeGateway()) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'offres', component: OffersComponent },
            ...OFFER_NAV.flatMap((nav) => [
              {
                path: `offres/${nav.slug}`,
                data: { slug: nav.slug },
                component: OfferDetailComponent,
              },
              {
                path: `offres/${nav.slug}/commander`,
                data: { slug: nav.slug },
                component: OfferOrderComponent,
              },
            ]),
            { path: 'contact', children: [] },
            { path: 'services', children: [] },
          ],
          withComponentInputBinding(),
        ),
        { provide: ContactGateway, useValue: gateway },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    return { harness, root: harness.routeNativeElement as HTMLElement, gateway };
  }

  it('présente tout le catalogue, puis une seule catégorie', async () => {
    const { harness, root } = await open('/offres');
    expect(root.querySelectorAll('[data-testid=offer-card]').length).toBe(OFFER_NAV.length);
    root.querySelector<HTMLButtonElement>('[data-testid=offer-filter-adresse]')!.click();
    await harness.fixture.whenStable();
    const cards = root.querySelectorAll('[data-testid=offer-card]');
    expect(cards.length).toBe(OFFER_NAV.filter((nav) => nav.category === 'adresse').length);
    expect(
      root.querySelector('[data-testid=offer-filter-adresse]')?.getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('affiche les abonnements au mois ou à l’année, au choix du visiteur', async () => {
    const { harness, root } = await open('/offres');
    TestBed.inject(BillingPeriodStore).period.set('an');
    await harness.fixture.whenStable();
    const card = () =>
      [...root.querySelectorAll('[data-testid=offer-card]')].find((item) =>
        item.textContent?.includes('Nom de domaine et adresses mail'),
      )!;
    expect(card().textContent).toContain('35\u202f000 FCFA par an');
    expect(card().textContent).toContain('2 mois offerts');
    root.querySelector<HTMLInputElement>('[data-testid=period-mois]')!.click();
    await harness.fixture.whenStable();
    expect(card().textContent).toContain('3\u202f500 FCFA par mois');
    expect(card().textContent).not.toContain('mois offerts');
  });

  it('présente les nouvelles offres sur devis', async () => {
    const { root } = await open('/offres/integration-ia');
    expect(root.querySelector('[data-testid=offer-price]')?.textContent).toContain('Sur devis');
    expect(root.querySelector('[data-testid=period-toggle]')).toBeNull();
  });

  it('détaille une offre et mène à sa commande', async () => {
    const { root } = await open('/offres/site-web-ong');
    expect(root.querySelector('h1')?.textContent).toContain('ceux qui les financent');
    expect(root.querySelector('[data-testid=offer-includes]')?.textContent).toContain(
      'nom de domaine',
    );
    expect(root.querySelector('[data-testid=offer-price]')?.textContent).toContain(
      '450\u202f000 FCFA',
    );
    expect(root.querySelector('[data-testid=offer-order]')?.getAttribute('href')).toBe(
      '/offres/site-web-ong/commander',
    );
  });

  it('envoie une commande complète comme demande de devis', async () => {
    const { harness, root, gateway } = await open('/offres/domaine-et-messagerie/commander');
    const set = (selector: string, value: string) => {
      const field = root.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input'));
    };
    set('#order-name', 'Awa Moussa');
    set('#order-audience', 'ong');
    set('#order-phone', '+227 90 00 00 00');
    set('#order-domain', 'Sahel-Vert');
    set('#order-extension', '.org');
    set('#order-mailboxes', '8');
    root.querySelector<HTMLInputElement>('[data-testid=order-option-0]')!.click();
    root.querySelector<HTMLButtonElement>('[data-testid=order-submit]')!.click();
    await harness.fixture.whenStable();

    expect(root.querySelector('[data-testid=order-sent]')).not.toBeNull();
    const [request] = gateway.sent;
    expect(request.subject).toBe('devis');
    expect(request.service).toBe('offre:domaine-et-messagerie');
    expect(request.message).toContain('Nom de domaine souhaité : sahel-vert.org');
    expect(request.message).toContain('Adresses mail : 8');
    expect(request.message).toContain('Options : Reprise des anciens messages');
  });

  it('refuse un nom de domaine invalide et exige un moyen de réponse', async () => {
    const { harness, root, gateway } = await open('/offres/domaine-et-messagerie/commander');
    const domain = root.querySelector<HTMLInputElement>('#order-domain')!;
    domain.value = 'mon site!';
    domain.dispatchEvent(new Event('input'));
    root.querySelector<HTMLButtonElement>('[data-testid=order-submit]')!.click();
    await harness.fixture.whenStable();
    expect(root.querySelector('#order-domain-error')?.textContent).toContain('tirets');
    expect(root.querySelector('#order-contact-error')).not.toBeNull();
    expect(gateway.sent).toHaveLength(0);
  });

  it('ne demande pas de nom de domaine pour une offre qui n’en a pas besoin', async () => {
    const { root } = await open('/offres/protection-du-bureau/commander');
    expect(root.querySelector('[data-testid=order-domain]')).toBeNull();
  });

  it('dit quand l’envoi en ligne n’est pas actif', async () => {
    const gateway = new FakeGateway();
    Object.defineProperty(gateway, 'available', { value: false });
    const { root } = await open('/offres/site-web-ong/commander', gateway);
    expect(root.querySelector('[data-testid=order-unavailable]')).not.toBeNull();
    expect(root.querySelector<HTMLButtonElement>('[data-testid=order-submit]')!.disabled).toBe(
      true,
    );
    expect(TestBed.inject(Router).url).toBe('/offres/site-web-ong/commander');
  });
});

describe('toOrderRequest', () => {
  it('reprend la formule choisie pour un abonnement', () => {
    const value = {
      name: 'Awa',
      organization: '',
      audience: 'ong',
      email: 'awa@example.org',
      phone: '',
      domain: '',
      extension: '.com',
      mailboxes: null,
      options: [],
      message: '',
    };
    expect(toOrderRequest(offerBySlug('hebergement-gere')!, value, 'an').message).toContain(
      'Formule : annuelle (2 mois offerts)',
    );
    expect(toOrderRequest(offerBySlug('protection-du-bureau')!, value, 'an').message).not.toContain(
      'Formule',
    );
  });

  it('laisse le nom à choisir ensemble quand il manque', () => {
    const request = toOrderRequest(offerBySlug('site-web-ong')!, {
      name: ' Awa ',
      organization: '',
      audience: 'ong',
      email: 'awa@example.org',
      phone: '',
      domain: '',
      extension: '.com',
      mailboxes: null,
      options: [],
      message: '',
    });
    expect(request.message).toContain('Nom de domaine souhaité : à choisir ensemble');
    expect(request.message).not.toContain('Adresses mail');
    expect(request.name).toBe('Awa');
    expect(request.organization).toBeNull();
  });
});
