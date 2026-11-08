import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { CLOCK } from '@core/data/clock';
import { ListingsApi } from '../data-access/listings.api';
import { SampleListingsApi } from '../data-access/sample-listings.api';
import { SampleSavedListingsApi, SavedListingsApi } from '../data-access/saved-listings.api';
import { listingDetailResolver } from '../state/listing-detail.resolver';
import { SavedListingsStore } from '../state/saved-listings.store';
import { buildSampleListings } from '../data-access/sample-listings.data';
import { listingFacts, placeOf } from '../models/listing-facts';
import { ListingDetailComponent } from './listing-detail.component';

const NOW = new Date('2026-11-06T10:00:00Z');
const ALL = buildSampleListings(NOW);
const bySlug = (pattern: RegExp) => ALL.find((l) => pattern.test(l.slug))!;

describe('placeOf', () => {
  it('ne répète pas la ville quand elle porte le nom de la région', () => {
    expect(placeOf({ city: 'Niamey', regionId: 'niamey' })).toBe('Niamey, Niger');
    expect(placeOf({ city: 'Arlit', regionId: 'agadez' })).toBe('Arlit, Agadez, Niger');
  });
});

const detailRoutes: Routes = (
  [
    ['emplois', 'EMPLOI'],
    ['marches', 'MARCHE'],
    ['autres', 'AUTRE'],
  ] as const
).map(([path, universe]) => ({
  path: `${path}/:slug`,
  data: { universe },
  resolve: { detail: listingDetailResolver },
  component: ListingDetailComponent,
}));

describe('listingFacts', () => {
  const market = bySlug(/reseau-informatique/);

  it('masque le montant quand le budget est caché, et retire les lignes vides', () => {
    const labels = (rows: ReturnType<typeof listingFacts>) => rows.map((row) => row[0]);
    const hidden = listingFacts({
      ...market,
      budget: { amount: 5, currency: 'FCFA', hidden: true },
    });
    expect(hidden.find((row) => row[0] === 'Budget')?.[1]).toBe('Indiqué dans le dossier');
    expect(labels(listingFacts({ ...market, budget: undefined }))).not.toContain('Budget');
    expect(labels(listingFacts(market))).not.toContain('Expérience');
  });
});

describe('ListingDetailComponent', () => {
  async function open(url: string, api?: Partial<ListingsApi>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(detailRoutes, withComponentInputBinding()),
        api
          ? { provide: ListingsApi, useValue: api }
          : { provide: ListingsApi, useClass: SampleListingsApi },
        { provide: SavedListingsApi, useClass: SampleSavedListingsApi },
        SavedListingsStore,
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    return harness.routeNativeElement as HTMLElement;
  }

  it('présente une fiche de marché structurée, avec pièces et compte à rebours', async () => {
    const listing = bySlug(/reseau-informatique/);
    const root = await open(`/marches/${listing.slug}`);
    expect(root.querySelector('[data-testid=detail-title]')?.textContent).toContain(
      'réseau informatique',
    );
    expect(root.querySelector('[data-testid=deadline]')?.textContent).toContain('Reste 27 jours');
    const facts = root.querySelector('[data-testid=facts]')?.textContent;
    expect(facts).toContain(listing.reference);
    expect(facts).toContain('Informatique et numérique');
    expect(root.querySelector('[data-testid=attachment]')?.getAttribute('href')).toContain('.pdf');
    expect(root.querySelector('[data-testid=verified]')).not.toBeNull();
  });

  it('indique sans ambiguïté comment répondre, selon le mode', async () => {
    const online = ALL.find(
      (l) => l.howToApply.mode === 'EN_LIGNE' && l.deadline > NOW.toISOString(),
    )!;
    const root = await open(`/emplois/${online.slug}`);
    expect(root.querySelector('[data-testid=apply-online]')?.getAttribute('href')).toBe(
      `/emplois/${online.slug}/postuler`,
    );
  });

  it("donne l'adresse e-mail d'un marché qui se soumet par e-mail", async () => {
    const byEmail = ALL.find(
      (l) =>
        l.universe === 'MARCHE' && l.howToApply.mode === 'EMAIL' && l.deadline > NOW.toISOString(),
    )!;
    const root = await open(`/marches/${byEmail.slug}`);
    expect(root.querySelector('[data-testid=apply-email]')?.getAttribute('href')).toBe(
      'mailto:marches@example.org',
    );
  });

  it('garde une annonce expirée consultable, sans bouton de réponse', async () => {
    const expired = ALL.find((l) => l.deadline < NOW.toISOString())!;
    const root = await open(
      `/${expired.universe === 'MARCHE' ? 'marches' : expired.universe === 'EMPLOI' ? 'emplois' : 'autres'}/${expired.slug}`,
    );
    expect(root.querySelector('[data-testid=expired-notice]')).not.toBeNull();
    expect(root.querySelector('[data-testid=deadline]')?.textContent).toContain('Expirée');
    expect(root.querySelector('[data-testid=apply-box]')).toBeNull();
    expect(root.querySelector('[data-testid=detail-title]')?.textContent).toContain(expired.title);
  });

  it('propose le partage WhatsApp et des annonces similaires', async () => {
    const root = await open(`/emplois/${ALL[0].slug}`);
    expect(root.querySelector('[data-testid=share-whatsapp]')?.getAttribute('href')).toContain(
      'https://wa.me/?text=',
    );
    expect(
      root.querySelector('.similar')?.querySelectorAll('[data-testid=listing-card]').length,
    ).toBe(3);
  });

  it('situe la fiche et relie l’organisation et ses autres annonces', async () => {
    const listing = bySlug(/reseau-informatique/);
    const root = await open(`/marches/${listing.slug}`);
    const crumbs = root.querySelector('[data-testid=breadcrumb]')?.textContent;
    expect(crumbs).toContain('Annonces');
    expect(crumbs).toContain('Marchés et projets');
    expect(root.querySelector('[data-testid=detail-organization]')?.getAttribute('href')).toBe(
      `/organisations/${listing.organization.slug}`,
    );
    expect(root.querySelector('[data-testid=apply-jump]')?.getAttribute('href')).toContain(
      '#postuler',
    );
    const others = root.querySelectorAll(
      '[data-testid=from-organization] [data-testid=listing-card]',
    );
    expect(others.length).toBeGreaterThan(0);
    expect(root.querySelector('[data-testid=from-organization]')?.textContent).not.toContain(
      listing.title,
    );
  });

  it('dit clairement quand une annonce est introuvable', async () => {
    const root = await open('/emplois/inconnue');
    expect(root.querySelector('[data-testid=detail-missing] h1')?.textContent).toContain(
      'n’existe pas',
    );
  });

  it('signale une erreur de chargement', async () => {
    const root = await open('/emplois/x', {
      getBySlug: () => throwError(() => new Error('réseau')),
    });
    expect(root.querySelector('[data-testid=detail-error]')).not.toBeNull();
  });
});
