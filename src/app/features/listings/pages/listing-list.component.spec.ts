import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { CLOCK } from '@core/data/clock';
import { ListingsApi } from '../data-access/listings.api';
import { SampleSavedListingsApi, SavedListingsApi } from '../data-access/saved-listings.api';
import { buildSampleListings } from '../data-access/sample-listings.data';
import { SavedListingsStore } from '../state/saved-listings.store';
import {
  Listing,
  ListingFacets,
  ListingPage,
  PublicOrganization,
  Universe,
} from '../models/listing';
import { EMPTY_QUERY, ListingQuery, runFacets, runQuery } from '../models/listing-query';
import { ListingListComponent } from './listing-list.component';

const NOW = new Date('2026-11-06T10:00:00Z');
const ALL = buildSampleListings(NOW);

class FakeApi extends ListingsApi {
  seen: ListingQuery[] = [];
  facetCalls = 0;
  constructor(private readonly respond: (query: ListingQuery) => Observable<ListingPage>) {
    super();
  }
  search(query: ListingQuery): Observable<ListingPage> {
    this.seen.push(query);
    return this.respond(query);
  }
  facets(query: ListingQuery): Observable<ListingFacets> {
    this.facetCalls += 1;
    return of(runFacets(ALL, query, NOW));
  }
  organizations(): Observable<readonly PublicOrganization[]> {
    return of([]);
  }
  organization(): Observable<PublicOrganization | null> {
    return of(null);
  }
  getBySlug(): Observable<Listing | null> {
    return of(null);
  }
  similar(): Observable<readonly Listing[]> {
    return of([]);
  }
  counts(): Observable<Readonly<Record<Universe, number>>> {
    return of({ EMPLOI: 0, MARCHE: 0, AUTRE: 0 });
  }
}

describe('ListingListComponent', () => {
  async function setup(api: ListingsApi, url = '/marches') {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'marches', data: { universe: 'MARCHE' }, component: ListingListComponent },
            { path: 'annonces/recherche', component: ListingListComponent },
          ],
          withComponentInputBinding(),
        ),
        { provide: ListingsApi, useValue: api },
        { provide: SavedListingsApi, useClass: SampleSavedListingsApi },
        SavedListingsStore,
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    return { harness, root: harness.routeNativeElement as HTMLElement };
  }
  const realApi = () => new FakeApi((query) => of(runQuery(ALL, query, NOW)));
  const facet = (root: HTMLElement, id: string) =>
    root.querySelector<HTMLInputElement>(`[data-testid=facet-${id}]`);
  const titles = (root: HTMLElement) =>
    [...root.querySelectorAll('[data-testid=listing-card] h3')].map((t) => t.textContent?.trim());

  it('affiche les annonces et leur nombre', async () => {
    const { root } = await setup(realApi());
    expect(root.querySelector('h1')?.textContent).toContain('Marchés et projets');
    const expected = runQuery(ALL, { ...parseEmpty(), universe: 'MARCHE' }, NOW);
    expect(root.querySelector('[data-testid=results-count]')?.textContent).toContain(
      `${expected.total} annonces`,
    );
    expect(titles(root)).toHaveLength(Math.min(expected.total, 12));
  });

  it("lit les filtres depuis l'URL : un lien partagé redonne la même liste", async () => {
    const { root } = await setup(realApi(), '/marches?secteur=informatique');
    expect(facet(root, 'sector-informatique')?.checked).toBe(true);
    const chips = root.querySelector('[data-testid=active-filters]')?.textContent;
    expect(chips).toContain('Informatique et numérique');
    expect(titles(root).join()).toContain('réseau informatique');
    expect(titles(root).join()).not.toContain('salles de classe');
  });

  it("écrit un filtre choisi dans l'URL et met la liste à jour", async () => {
    const { harness, root } = await setup(realApi());
    facet(root, 'sector-eau')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/marches?secteur=eau');
    expect(titles(root).join()).toContain('forages');
    expect(titles(root).join()).not.toContain('réseau informatique');
  });

  it('cumule plusieurs valeurs du même filtre et les relit depuis l’URL', async () => {
    const { harness, root } = await setup(realApi(), '/annonces/recherche?region=niamey');
    const other = root.querySelector<HTMLInputElement>(
      '[data-testid^=facet-region-]:not([data-testid=facet-region-niamey])',
    )!;
    const region = other.dataset['testid']!.replace('facet-region-', '');
    other.click();
    await harness.fixture.whenStable();
    const params = new URL(TestBed.inject(Router).url, 'http://x').searchParams;
    expect(params.getAll('region').sort()).toEqual([region, 'niamey'].sort());
    expect(facet(root, 'region-niamey')?.checked).toBe(true);
    expect(facet(root, `region-${region}`)?.checked).toBe(true);
  });

  it('cherche par mot et par région, sans perdre plusieurs régions déjà cochées', async () => {
    const { harness, root } = await setup(realApi(), '/marches?region=niamey&region=zinder');
    const submit = () => {
      root.querySelector<HTMLButtonElement>('[data-testid=search-submit]')!.click();
    };
    root.querySelector<HTMLInputElement>('[data-testid=search-input]')!.value = 'eau';
    submit();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/marches?q=eau&region=niamey&region=zinder');
    root.querySelector<HTMLSelectElement>('[data-testid=search-region]')!.value = 'dosso';
    submit();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/marches?q=eau&region=dosso');
    root.querySelector<HTMLSelectElement>('[data-testid=search-region]')!.value = '';
    submit();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/marches?q=eau');
  });

  it('ne recharge pas les compteurs pour charger plus ou trier', async () => {
    const api = realApi();
    const { harness, root } = await setup(api, '/annonces/recherche');
    expect(api.facetCalls).toBe(1);
    root.querySelector<HTMLButtonElement>('[data-testid=load-more]')!.click();
    await harness.fixture.whenStable();
    expect(api.facetCalls).toBe(1);
    facet(root, 'region-niamey')!.click();
    await harness.fixture.whenStable();
    expect(api.facetCalls).toBe(2);
  });

  it('retire un filtre depuis son étiquette', async () => {
    const { harness, root } = await setup(realApi(), '/marches?secteur=eau&region=tahoua');
    root.querySelector<HTMLButtonElement>('.chip')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/marches?region=tahoua');
  });

  it('efface tous les filtres mais garde la recherche', async () => {
    const { harness, root } = await setup(realApi(), '/marches?q=eau&secteur=eau');
    root.querySelector<HTMLButtonElement>('[data-testid=clear-filters]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/marches?q=eau');
  });

  it('charge plus de résultats sans perdre les précédents', async () => {
    const { harness, root } = await setup(realApi(), '/annonces/recherche');
    expect(titles(root)).toHaveLength(12);
    root.querySelector<HTMLButtonElement>('[data-testid=load-more]')!.click();
    await harness.fixture.whenStable();
    expect(titles(root)).toHaveLength(24);
    expect(TestBed.inject(Router).url).toBe('/annonces/recherche?page=2');
  });

  it('montre le squelette pendant le premier chargement', async () => {
    const pending = new Subject<ListingPage>();
    const { harness, root } = await setup(new FakeApi(() => pending));
    expect(root.querySelector('[data-testid=list-loading]')).not.toBeNull();
    expect(root.querySelector('[data-testid=listing-card]')).toBeNull();
    pending.next({ items: [ALL[0]], total: 1 });
    await harness.fixture.whenStable();
    expect(root.querySelector('[data-testid=list-loading]')).toBeNull();
    expect(titles(root)).toHaveLength(1);
  });

  it('explique une recherche sans résultat et garde la création d’alerte', async () => {
    const { root } = await setup(realApi(), '/marches?q=zzzz');
    expect(root.querySelector('[data-testid=list-empty]')?.textContent).toContain('Aucune annonce');
    expect(root.querySelector('[data-testid=create-alert]')?.getAttribute('href')).toContain(
      'q=zzzz',
    );
  });

  it('signale une erreur et permet de réessayer', async () => {
    let fail = true;
    const { harness, root } = await setup(
      new FakeApi((query) =>
        fail ? throwError(() => new Error('réseau')) : of(runQuery(ALL, query, NOW)),
      ),
    );
    expect(root.querySelector('[role=alert]')?.textContent).toContain('n’ont pas pu être chargées');
    fail = false;
    root.querySelector<HTMLButtonElement>('[data-testid=list-error] button')!.click();
    await harness.fixture.whenStable();
    expect(root.querySelector('[data-testid=list-error]')).toBeNull();
    expect(titles(root).length).toBeGreaterThan(0);
  });

  it("transmet les critères à l'alerte (parcours A)", async () => {
    const { root } = await setup(realApi(), '/marches?secteur=informatique');
    const href = root.querySelector('[data-testid=create-alert]')?.getAttribute('href') ?? '';
    expect(href).toContain('/alertes/nouvelle');
    expect(href).toContain('secteur=informatique');
    expect(href).toContain('univers=MARCHE');
  });
});

const parseEmpty = (): ListingQuery => ({ ...EMPTY_QUERY });
