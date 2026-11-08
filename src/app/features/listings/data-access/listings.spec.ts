import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CLOCK } from '@core/data/clock';
import {
  EMPTY_QUERY,
  parseQuery,
  runFacets,
  runOrganizations,
  runQuery,
  toQueryParams,
} from '../models/listing-query';
import { REGIONS, SECTORS, UNIVERSES } from '../models/listing';
import { HttpListingsApi, toSearchParams } from './http-listings.api';
import { SampleListingsApi } from './sample-listings.api';
import { buildSampleListings } from './sample-listings.data';

const NOW = new Date('2026-11-06T10:00:00Z');
const ALL = buildSampleListings(NOW);

describe("jeu d'exemple", () => {
  it('compte au moins 40 annonces variées, toutes marquées fictives', () => {
    expect(ALL.length).toBeGreaterThanOrEqual(40);
    expect(ALL.every((l) => l.isSample)).toBe(true);
    for (const universe of UNIVERSES) {
      expect(ALL.some((l) => l.universe === universe.id)).toBe(true);
      expect(new Set(ALL.filter((l) => l.universe === universe.id).map((l) => l.type)).size).toBe(
        universe.types.length,
      );
    }
    expect(ALL.every((l) => /fictif|fictive/i.test(l.description[0]))).toBe(true);
  });

  it('a des adresses uniques et lisibles, des secteurs et régions connus', () => {
    expect(new Set(ALL.map((l) => l.slug)).size).toBe(ALL.length);
    expect(ALL.every((l) => /^[a-z0-9-]+-\d{4}$/.test(l.slug))).toBe(true);
    expect(ALL.every((l) => SECTORS.some((s) => s.id === l.sectorId))).toBe(true);
    expect(ALL.every((l) => REGIONS.some((r) => r.id === l.regionId))).toBe(true);
  });

  it("n'utilise que des organisations marquées comme exemples et des domaines réservés", () => {
    expect(ALL.every((l) => /exemple|fictif/i.test(l.organization.name))).toBe(true);
    const contacts = ALL.flatMap((l) => [l.howToApply.email, l.howToApply.url]).filter(Boolean);
    expect(contacts.every((value) => value!.includes('example.org'))).toBe(true);
  });
});

describe('URL de recherche', () => {
  it('relit une recherche partagée', () => {
    const query = parseQuery(
      convertToParamMap({ q: ' comptable ', secteur: 'finance', region: 'niamey', page: '2' }),
      'EMPLOI',
    );
    expect(query).toEqual({
      ...EMPTY_QUERY,
      universe: 'EMPLOI',
      text: 'comptable',
      sector: ['finance'],
      region: ['niamey'],
      sort: 'pertinence',
      page: 2,
    });
  });

  it('ignore les valeurs inconnues', () => {
    const query = parseQuery(
      convertToParamMap({
        type: 'X',
        secteur: 'x',
        region: 'x',
        organisation: 'x',
        depuis: '2',
        limite: '9',
        tri: 'x',
        page: '-1',
      }),
    );
    expect(query).toEqual({ ...EMPTY_QUERY, universe: undefined });
  });

  it("n'écrit dans l'URL que ce qui change, et se relit à l'identique", () => {
    expect(toQueryParams(EMPTY_QUERY)).toEqual({});
    const query = {
      ...EMPTY_QUERY,
      type: ['CDI', 'CDD'] as const,
      sector: ['sante'],
      within: '7' as const,
      since: '30' as const,
      sort: 'expire' as const,
    };
    expect(parseQuery(convertToParamMap(toQueryParams(query)))).toEqual({
      ...query,
      universe: undefined,
    });
  });
});

describe('runFacets', () => {
  const facets = (patch: Partial<typeof EMPTY_QUERY> = {}) =>
    runFacets(ALL, { ...EMPTY_QUERY, ...patch }, NOW);
  const total = (counts: Readonly<Record<string, number>>) =>
    Object.values(counts).reduce((sum, value) => sum + value, 0);

  it('compte toutes les annonces actives dans chaque filtre obligatoire', () => {
    const active = runQuery(ALL, { ...EMPTY_QUERY, page: 50 }, NOW).total;
    const all = facets();
    expect(total(all.type)).toBe(active);
    expect(total(all.sector)).toBe(active);
    expect(total(all.region)).toBe(active);
    expect(total(all.organizationType)).toBe(active);
  });

  it('un filtre ignore ses propres choix mais suit les autres', () => {
    const none = facets();
    const niamey = facets({ region: ['niamey'] });
    expect(niamey.region).toEqual(none.region);
    expect(total(niamey.sector)).toBe(none.region['niamey']);
  });

  it('compte chaque durée, de la plus courte à la plus longue', () => {
    const { since, within } = facets();
    expect(since['1']).toBeLessThanOrEqual(since['7']);
    expect(since['7']).toBeLessThanOrEqual(since['30']);
    expect(within['7']).toBeLessThanOrEqual(within['30']);
  });
});

describe('runOrganizations', () => {
  it('compte les annonces ouvertes et place les plus actives d’abord', () => {
    const organizations = runOrganizations(ALL, NOW);
    expect(organizations.length).toBeGreaterThan(0);
    const counts = organizations.map((item) => item.openListings);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    expect(organizations.every((item) => /^[a-z0-9-]+$/.test(item.slug))).toBe(true);
    expect(new Set(organizations.map((item) => item.slug)).size).toBe(organizations.length);
  });
});

describe('runQuery', () => {
  const run = (patch: Partial<typeof EMPTY_QUERY>) =>
    runQuery(ALL, { ...EMPTY_QUERY, ...patch }, NOW);

  it('retire les annonces expirées de la liste', () => {
    const { items, total } = runQuery(ALL, { ...EMPTY_QUERY, page: 50 }, NOW);
    expect(total).toBeLessThan(ALL.length);
    expect(items.every((l) => new Date(l.deadline) >= NOW)).toBe(true);
  });

  it('filtre par univers, secteur et région (parcours A)', () => {
    const { items } = run({ universe: 'MARCHE', sector: ['informatique'] });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((l) => l.universe === 'MARCHE' && l.sectorId === 'informatique')).toBe(true);
  });

  it('trouve sans tenir compte des accents ni des majuscules (parcours B)', () => {
    const { items } = run({ text: 'COMPTABLE', sort: 'pertinence' });
    expect(items[0].title.toLowerCase()).toContain('comptable');
    expect(run({ text: 'securite', sort: 'pertinence' }).items[0].title).toContain('sécurité');
  });

  it('exige chaque mot cherché et ne renvoie rien sinon', () => {
    expect(run({ text: 'comptable zzzz' }).total).toBe(0);
  });

  it('place les titres avant les simples mentions', () => {
    const { items } = run({ text: 'comptable', sort: 'pertinence' });
    expect(items.findIndex((l) => l.title.toLowerCase().includes('comptable'))).toBe(0);
  });

  it('trie par date limite la plus proche', () => {
    const { items } = run({ sort: 'expire' });
    const times = items.map((l) => new Date(l.deadline).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('limite à la fenêtre de date limite', () => {
    const { items } = run({ within: '7' });
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every((l) => new Date(l.deadline).getTime() - NOW.getTime() <= 7 * 86_400_000),
    ).toBe(true);
  });

  it('charge plus de résultats page après page sans changer le total', () => {
    const first = run({ page: 1 });
    const second = run({ page: 2 });
    expect(first.items).toHaveLength(12);
    expect(second.items).toHaveLength(24);
    expect(second.total).toBe(first.total);
  });
});

describe('SampleListingsApi', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [SampleListingsApi, { provide: CLOCK, useValue: () => NOW }],
    });
    return TestBed.inject(SampleListingsApi);
  }

  it("trouve une annonce par son adresse, et null si elle n'existe pas ou change d'univers", async () => {
    const api = setup();
    const slug = ALL[0].slug;
    expect((await firstValueFrom(api.getBySlug('EMPLOI', slug)))?.id).toBe(ALL[0].id);
    expect(await firstValueFrom(api.getBySlug('MARCHE', slug))).toBeNull();
    expect(await firstValueFrom(api.getBySlug('EMPLOI', 'inconnue'))).toBeNull();
  });

  it('propose des annonces similaires actives, sans elle-même', async () => {
    const api = setup();
    const similar = await firstValueFrom(api.similar(ALL[0], 3));
    expect(similar).toHaveLength(3);
    expect(similar.every((l) => l.id !== ALL[0].id && l.universe === 'EMPLOI')).toBe(true);
    expect(similar[0].sectorId).toBe(ALL[0].sectorId);
  });

  it('compte les annonces actives par univers', async () => {
    const counts = await firstValueFrom(setup().counts());
    expect(counts.EMPLOI + counts.MARCHE + counts.AUTRE).toBe(run50Total());
  });

  const run50Total = () => runQuery(ALL, { ...EMPTY_QUERY, page: 50 }, NOW).total;
});

describe('HttpListingsApi', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [HttpListingsApi, provideHttpClient(), provideHttpClientTesting()],
    });
    return { api: TestBed.inject(HttpListingsApi), http: TestBed.inject(HttpTestingController) };
  }

  it('traduit la recherche selon le contrat', () => {
    const params = toSearchParams({
      ...EMPTY_QUERY,
      universe: 'MARCHE',
      sector: ['informatique', 'eau'],
      within: '7',
      page: 2,
    });
    expect(params.toString()).toBe(
      'sort=recent&offset=0&limit=24&universe=MARCHE&sectorId=informatique&sectorId=eau&deadlineWithinDays=7',
    );
  });

  it('renvoie la page reçue', async () => {
    const { api, http } = setup();
    const result = firstValueFrom(api.search(EMPTY_QUERY));
    http.expectOne((r) => r.url === '/api/listings').flush({ items: [ALL[0]], total: 1 });
    expect((await result).total).toBe(1);
    http.verify();
  });

  it('propage une erreur serveur', async () => {
    const { api, http } = setup();
    const result = firstValueFrom(api.search(EMPTY_QUERY));
    http.expectOne((r) => r.url === '/api/listings').flush('x', { status: 500, statusText: 'KO' });
    await expect(result).rejects.toBeTruthy();
    http.verify();
  });

  it('transforme un 404 en annonce absente', async () => {
    const { api, http } = setup();
    const result = firstValueFrom(api.getBySlug('EMPLOI', 'x'));
    http.expectOne('/api/listings/EMPLOI/x').flush('x', { status: 404, statusText: 'NF' });
    expect(await result).toBeNull();
    http.verify();
  });
});
