import { OrganizationType } from '@features/auth/models/user';

export type Universe = 'EMPLOI' | 'MARCHE' | 'AUTRE';
export type ListingStatus = 'BROUILLON' | 'EN_ATTENTE' | 'PUBLIEE' | 'EXPIREE' | 'RETIREE';
export type ApplyMode = 'EN_LIGNE' | 'EMAIL' | 'LIEN';

export type ListingType =
  | 'CDI'
  | 'CDD'
  | 'CDD_RENOUVELABLE'
  | 'INTERIM'
  | 'STAGE'
  | 'APPEL_OFFRES'
  | 'AMI'
  | 'CONSULTATION'
  | 'PRESTATION'
  | 'FORMATION'
  | 'CONCOURS'
  | 'DIVERS';

export interface Organization {
  readonly id: string;
  /** Adresse de sa page publique. */
  readonly slug: string;
  readonly name: string;
  readonly type: OrganizationType;
  readonly verified: boolean;
}

export interface HowToApply {
  readonly mode: ApplyMode;
  readonly email?: string;
  readonly url?: string;
  readonly instructions: string;
}

export interface Budget {
  readonly amount: number;
  readonly currency: string;
  readonly hidden: boolean;
}

export interface Attachment {
  readonly name: string;
  readonly url: string;
  readonly sizeBytes: number;
}

export interface Listing {
  readonly id: string;
  readonly slug: string;
  readonly universe: Universe;
  readonly type: ListingType;
  readonly reference?: string;
  readonly title: string;
  readonly summary: string;
  readonly description: readonly string[];
  readonly organization: Organization;
  readonly sectorId: string;
  readonly regionId: string;
  readonly city: string;
  readonly country: string;
  readonly educationLevel?: string;
  readonly experienceLevel?: string;
  readonly publishedAt: string;
  readonly deadline: string;
  readonly status: ListingStatus;
  readonly howToApply: HowToApply;
  readonly budget?: Budget;
  readonly attachments: readonly Attachment[];
  /** Vrai pour les annonces d'exemple : jamais indexées, toujours étiquetées. */
  readonly isSample: boolean;
}

/** Ce que montre la page publique d'une organisation. */
export interface PublicOrganization extends Organization {
  readonly openListings: number;
}

/** Nombre d'annonces par valeur de filtre, chaque filtre ignorant ses propres choix. */
export interface ListingFacets {
  readonly type: Readonly<Record<string, number>>;
  readonly sector: Readonly<Record<string, number>>;
  readonly region: Readonly<Record<string, number>>;
  readonly education: Readonly<Record<string, number>>;
  readonly organizationType: Readonly<Record<string, number>>;
  readonly within: Readonly<Record<string, number>>;
  readonly since: Readonly<Record<string, number>>;
}

export interface ListingPage {
  readonly items: readonly Listing[];
  readonly total: number;
}

export interface UniverseInfo {
  readonly id: Universe;
  readonly path: string;
  readonly label: string;
  readonly types: readonly ListingType[];
}

export const UNIVERSES: readonly UniverseInfo[] = [
  {
    id: 'EMPLOI',
    path: 'emplois',
    label: 'Emplois',
    types: ['CDI', 'CDD', 'CDD_RENOUVELABLE', 'INTERIM', 'STAGE'],
  },
  {
    id: 'MARCHE',
    path: 'marches',
    label: 'Marchés et projets',
    types: ['APPEL_OFFRES', 'AMI', 'CONSULTATION', 'PRESTATION'],
  },
  { id: 'AUTRE', path: 'autres', label: 'Autres', types: ['FORMATION', 'CONCOURS', 'DIVERS'] },
];

export const TYPE_LABELS: Readonly<Record<ListingType, string>> = {
  CDI: 'CDI',
  CDD: 'CDD',
  CDD_RENOUVELABLE: 'CDD renouvelable',
  INTERIM: 'Intérim',
  STAGE: 'Stage',
  APPEL_OFFRES: "Appel d'offres",
  AMI: "Appel à manifestation d'intérêt",
  CONSULTATION: 'Consultation',
  PRESTATION: 'Prestation de service',
  FORMATION: 'Formation',
  CONCOURS: 'Concours ou examen',
  DIVERS: 'Annonce',
};

export interface Option {
  readonly id: string;
  readonly label: string;
}

export const SECTORS: readonly Option[] = [
  { id: 'humanitaire', label: 'Humanitaire et social' },
  { id: 'agriculture', label: 'Agriculture, élevage, développement rural' },
  { id: 'sante', label: 'Santé' },
  { id: 'education', label: 'Éducation, formation, recherche' },
  { id: 'finance', label: 'Comptabilité, finance, banque, assurance' },
  { id: 'btp', label: 'BTP et immobilier' },
  { id: 'logistique', label: 'Logistique et transport' },
  { id: 'eau', label: 'Eau, hygiène, assainissement' },
  { id: 'commerce', label: 'Marketing, vente, commerce' },
  { id: 'administration', label: 'Administration et gestion' },
  { id: 'tourisme', label: 'Tourisme, hôtellerie, restauration' },
  { id: 'informatique', label: 'Informatique et numérique' },
  { id: 'services', label: 'Services généraux' },
  { id: 'mines', label: 'Mines et énergie' },
];

export const REGIONS: readonly Option[] = [
  { id: 'agadez', label: 'Agadez' },
  { id: 'diffa', label: 'Diffa' },
  { id: 'dosso', label: 'Dosso' },
  { id: 'maradi', label: 'Maradi' },
  { id: 'niamey', label: 'Niamey' },
  { id: 'tahoua', label: 'Tahoua' },
  { id: 'tillaberi', label: 'Tillabéri' },
  { id: 'zinder', label: 'Zinder' },
];

export const EDUCATION_LEVELS: readonly Option[] = [
  { id: 'sans', label: 'Sans diplôme exigé' },
  { id: 'bac', label: 'Baccalauréat' },
  { id: 'bac2', label: 'Bac + 2' },
  { id: 'bac3', label: 'Licence (Bac + 3)' },
  { id: 'bac5', label: 'Master (Bac + 5)' },
];

export const ORGANIZATION_TYPES: readonly {
  readonly id: OrganizationType;
  readonly label: string;
}[] = [
  { id: 'ONG', label: 'ONG et associations' },
  { id: 'MINISTERE', label: 'Ministères et institutions' },
  { id: 'ENTREPRISE', label: 'Entreprises' },
  { id: 'AUTRE', label: 'Autres organisations' },
];

export const labelOf = (options: readonly Option[], id: string | undefined): string =>
  options.find((option) => option.id === id)?.label ?? '';

export const universeInfo = (id: Universe): UniverseInfo =>
  UNIVERSES.find((universe) => universe.id === id)!;

/** Adresse lisible d'une annonce, par exemple `/marches/ao-reseau-niamey-0012`. */
export const listingLink = (listing: Pick<Listing, 'universe' | 'slug'>): readonly string[] => [
  '/',
  universeInfo(listing.universe).path,
  listing.slug,
];
