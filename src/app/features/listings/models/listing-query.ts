import { ParamMap, Params } from '@angular/router';
import { OrganizationType } from '@features/auth/models/user';
import { daysLeft, isExpired } from './deadline';
import {
  EDUCATION_LEVELS,
  Listing,
  ListingFacets,
  ListingPage,
  ListingType,
  ORGANIZATION_TYPES,
  PublicOrganization,
  REGIONS,
  SECTORS,
  TYPE_LABELS,
  Universe,
} from './listing';

export type ListingSort = 'recent' | 'expire' | 'pertinence';
export type DeadlineWindow = '' | '7' | '30';
export type PublishedWindow = '' | '1' | '7' | '30';

export const PAGE_SIZE = 12;

export interface ListingQuery {
  readonly universe?: Universe;
  /** Annonces d'une seule organisation. Vient de sa page, jamais de l'URL. */
  readonly organization?: string;
  readonly text: string;
  readonly type: readonly ListingType[];
  readonly sector: readonly string[];
  readonly region: readonly string[];
  readonly education: readonly string[];
  readonly organizationType: readonly OrganizationType[];
  readonly within: DeadlineWindow;
  readonly since: PublishedWindow;
  readonly sort: ListingSort;
  readonly page: number;
}

export const EMPTY_QUERY: ListingQuery = {
  text: '',
  type: [],
  sector: [],
  region: [],
  education: [],
  organizationType: [],
  within: '',
  since: '',
  sort: 'recent',
  page: 1,
};

/** Garde les valeurs connues, sans doublon : un lien abîmé donne une liste, pas une erreur. */
const known = <T extends string>(
  options: readonly { readonly id: T }[],
  values: readonly string[],
): readonly T[] =>
  options.filter((option) => values.includes(option.id)).map((option) => option.id);

export function parseQuery(params: ParamMap, universe?: Universe): ListingQuery {
  const within = params.get('limite');
  const since = params.get('depuis');
  const sort = params.get('tri');
  const page = Number.parseInt(params.get('page') ?? '1', 10);
  const text = (params.get('q') ?? '').trim().slice(0, 120);
  const types = params.getAll('type');
  return {
    universe,
    text,
    type: (Object.keys(TYPE_LABELS) as ListingType[]).filter((type) => types.includes(type)),
    sector: known(SECTORS, params.getAll('secteur')),
    region: known(REGIONS, params.getAll('region')),
    education: known(EDUCATION_LEVELS, params.getAll('niveau')),
    organizationType: known(ORGANIZATION_TYPES, params.getAll('organisation')),
    within: within === '7' || within === '30' ? within : '',
    since: since === '1' || since === '7' || since === '30' ? since : '',
    sort: sort === 'expire' || sort === 'pertinence' ? sort : text ? 'pertinence' : 'recent',
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 50) : 1,
  };
}

/** Seuls les choix réels vont dans l'URL, pour un lien court à partager sur WhatsApp. */
export function toQueryParams(query: ListingQuery): Params {
  const defaultSort = query.text ? 'pertinence' : 'recent';
  const params: Params = {};
  if (query.text) params['q'] = query.text;
  if (query.type.length) params['type'] = query.type;
  if (query.sector.length) params['secteur'] = query.sector;
  if (query.region.length) params['region'] = query.region;
  if (query.education.length) params['niveau'] = query.education;
  if (query.organizationType.length) params['organisation'] = query.organizationType;
  if (query.within) params['limite'] = query.within;
  if (query.since) params['depuis'] = query.since;
  if (query.sort !== defaultSort) params['tri'] = query.sort;
  if (query.page > 1) params['page'] = String(query.page);
  return params;
}

export const activeFilterCount = (query: ListingQuery): number =>
  query.type.length +
  query.sector.length +
  query.region.length +
  query.education.length +
  query.organizationType.length +
  (query.within ? 1 : 0) +
  (query.since ? 1 : 0);

export const normalize = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function score(listing: Listing, words: readonly string[]): number {
  const title = normalize(listing.title);
  const body = normalize(
    [listing.summary, listing.organization.name, listing.city, ...listing.description].join(' '),
  );
  let total = 0;
  for (const word of words) {
    if (title.includes(word)) total += 3;
    else if (body.includes(word)) total += 1;
    else return 0;
  }
  return total;
}

const byDate = (a: string, b: string): number => new Date(a).getTime() - new Date(b).getTime();

const DAY_MS = 86_400_000;

const filled = (values: readonly string[], value: string | undefined): boolean =>
  !values.length || (value !== undefined && values.includes(value));

/** Critères hors recherche plein texte, partagés par la liste et les compteurs. */
function matchesFilters(listing: Listing, query: ListingQuery, now: Date): boolean {
  if (listing.status !== 'PUBLIEE' || isExpired(listing.deadline, now)) return false;
  if (query.universe && listing.universe !== query.universe) return false;
  if (query.organization && listing.organization.id !== query.organization) return false;
  if (!filled(query.type, listing.type)) return false;
  if (!filled(query.sector, listing.sectorId)) return false;
  if (!filled(query.region, listing.regionId)) return false;
  if (!filled(query.education, listing.educationLevel)) return false;
  if (!filled(query.organizationType, listing.organization.type)) return false;
  if (query.within && daysLeft(listing.deadline, now) > Number(query.within)) return false;
  if (query.since && !publishedWithin(listing, Number(query.since), now)) return false;
  return true;
}

const publishedWithin = (listing: Listing, days: number, now: Date): boolean =>
  now.getTime() - new Date(listing.publishedAt).getTime() <= days * DAY_MS;

/** Recherche de l'implémentation simulée, la logique que l'API réelle reproduit. */
export function runQuery(all: readonly Listing[], query: ListingQuery, now: Date): ListingPage {
  const words = normalize(query.text).split(/\s+/).filter(Boolean);
  const scores = new Map<string, number>();
  const matches = all.filter((listing) => {
    if (!matchesFilters(listing, query, now)) return false;
    if (words.length) {
      const value = score(listing, words);
      if (!value) return false;
      scores.set(listing.id, value);
    }
    return true;
  });
  const sorted = [...matches].sort((a, b) => {
    if (query.sort === 'expire') return byDate(a.deadline, b.deadline);
    if (query.sort === 'pertinence') {
      const gap = (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
      if (gap) return gap;
    }
    return byDate(b.publishedAt, a.publishedAt);
  });
  return { items: sorted.slice(0, query.page * PAGE_SIZE), total: sorted.length };
}

function tally(
  listings: readonly Listing[],
  key: (listing: Listing) => string | undefined,
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const listing of listings) {
    const value = key(listing);
    if (value) counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

/** Compteurs des filtres : chacun indique ce que donnerait le choix d'une autre de ses valeurs. */
export function runFacets(all: readonly Listing[], query: ListingQuery, now: Date): ListingFacets {
  const without = (patch: Partial<ListingQuery>): readonly Listing[] =>
    runQuery(all, { ...query, ...patch, page: 1_000_000, sort: 'recent' }, now).items;
  const within = without({ within: '' });
  const since = without({ since: '' });
  const countWindow = (
    source: readonly Listing[],
    days: readonly number[],
    test: (listing: Listing, day: number) => boolean,
  ): Readonly<Record<string, number>> =>
    Object.fromEntries(
      days.map((day) => [String(day), source.filter((listing) => test(listing, day)).length]),
    );
  return {
    type: tally(without({ type: [] }), (listing) => listing.type),
    sector: tally(without({ sector: [] }), (listing) => listing.sectorId),
    region: tally(without({ region: [] }), (listing) => listing.regionId),
    education: tally(without({ education: [] }), (listing) => listing.educationLevel),
    organizationType: tally(
      without({ organizationType: [] }),
      (listing) => listing.organization.type,
    ),
    within: countWindow(within, [7, 30], (listing, day) => daysLeft(listing.deadline, now) <= day),
    since: countWindow(since, [1, 7, 30], (listing, day) => publishedWithin(listing, day, now)),
  };
}

/** Annuaire simulé : seules les organisations ayant publié existent pour le public. */
export function runOrganizations(
  all: readonly Listing[],
  now: Date,
): readonly PublicOrganization[] {
  const byId = new Map<string, PublicOrganization>();
  for (const listing of all) {
    if (listing.status !== 'PUBLIEE') continue;
    const known = byId.get(listing.organization.id);
    byId.set(listing.organization.id, {
      ...listing.organization,
      openListings: (known?.openListings ?? 0) + (isExpired(listing.deadline, now) ? 0 : 1),
    });
  }
  return [...byId.values()].sort(
    (a, b) => b.openListings - a.openListings || a.name.localeCompare(b.name, 'fr'),
  );
}
