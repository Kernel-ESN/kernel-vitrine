import {
  Attachment,
  HowToApply,
  Listing,
  ListingType,
  Organization,
  Universe,
} from '../models/listing';
import { normalize } from '../models/listing-query';

/** Toutes ces annonces et organisations sont inventées pour le développement. */
const ORGANIZATION_ROWS: readonly Omit<Organization, 'slug'>[] = [
  { id: 'o1', name: 'ONG Exemple Eau et Vie', type: 'ONG', verified: true },
  { id: 'o2', name: 'Association Exemple Sahel Vert', type: 'ONG', verified: false },
  { id: 'o3', name: 'Ministère fictif du Numérique', type: 'MINISTERE', verified: true },
  { id: 'o4', name: 'Ministère fictif de la Santé', type: 'MINISTERE', verified: true },
  { id: 'o5', name: 'Banque Exemple du Fleuve', type: 'ENTREPRISE', verified: true },
  { id: 'o6', name: 'Exemple Bâtiment et Travaux', type: 'ENTREPRISE', verified: false },
  { id: 'o7', name: 'Exemple Transport Niger', type: 'ENTREPRISE', verified: false },
  { id: 'o8', name: 'Institut Exemple de Formation', type: 'AUTRE', verified: true },
  { id: 'o9', name: 'Exemple Télécom Services', type: 'ENTREPRISE', verified: true },
  { id: 'o10', name: 'Coopérative Exemple du Goulbi', type: 'AUTRE', verified: false },
];

export const SAMPLE_ORGANIZATIONS: readonly Organization[] = ORGANIZATION_ROWS.map((row) => ({
  ...row,
  slug: normalize(row.name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, ''),
}));

/** Pages d'organisation à prérendre. */
export const sampleOrganizationSlugs = (): readonly { slug: string }[] =>
  SAMPLE_ORGANIZATIONS.map(({ slug }) => ({ slug }));

type Row = readonly [
  universe: Universe,
  type: ListingType,
  title: string,
  org: number,
  sector: string,
  region: string,
  publishedDaysAgo: number,
  deadlineInDays: number,
  education?: string,
  experience?: string,
  budget?: number,
];

const ROWS: readonly Row[] = [
  ['EMPLOI', 'CDI', 'Comptable confirmé', 5, 'finance', 'niamey', 1, 24, 'bac3', '3 ans'],
  ['EMPLOI', 'CDD', 'Comptable de projet', 1, 'finance', 'tahoua', 4, 12, 'bac3', '2 ans'],
  [
    'EMPLOI',
    'CDD_RENOUVELABLE',
    'Assistant comptable',
    2,
    'finance',
    'maradi',
    2,
    18,
    'bac2',
    '1 an',
  ],
  [
    'EMPLOI',
    'CDI',
    'Responsable administratif et financier',
    9,
    'finance',
    'niamey',
    6,
    30,
    'bac5',
    '5 ans',
  ],
  [
    'EMPLOI',
    'CDI',
    'Développeur Angular et Java',
    9,
    'informatique',
    'niamey',
    0,
    28,
    'bac5',
    '3 ans',
  ],
  [
    'EMPLOI',
    'CDD',
    'Administrateur systèmes et réseaux',
    3,
    'informatique',
    'niamey',
    3,
    15,
    'bac3',
    '3 ans',
  ],
  [
    'EMPLOI',
    'STAGE',
    'Stagiaire en analyse de données',
    5,
    'informatique',
    'niamey',
    5,
    9,
    'bac3',
    'Débutant',
  ],
  [
    'EMPLOI',
    'CDD',
    'Gestionnaire de base de données de santé',
    4,
    'sante',
    'zinder',
    8,
    21,
    'bac3',
    '2 ans',
  ],
  ['EMPLOI', 'CDD', 'Médecin superviseur de district', 1, 'sante', 'diffa', 3, 2, 'bac5', '4 ans'],
  [
    'EMPLOI',
    'CDD_RENOUVELABLE',
    'Infirmier de centre de santé',
    4,
    'sante',
    'tillaberi',
    7,
    16,
    'bac2',
    '2 ans',
  ],
  ['EMPLOI', 'CDI', 'Sage-femme référente', 4, 'sante', 'dosso', 10, 26, 'bac3', '3 ans'],
  [
    'EMPLOI',
    'CDD',
    'Coordinateur de projet eau et assainissement',
    1,
    'eau',
    'tahoua',
    2,
    20,
    'bac5',
    '5 ans',
  ],
  ['EMPLOI', 'CDD', 'Technicien de forage', 1, 'eau', 'agadez', 9, 11, 'bac2', '3 ans'],
  ['EMPLOI', 'CDD', 'Animateur communautaire', 2, 'humanitaire', 'diffa', 1, 3, 'bac', '1 an'],
  [
    'EMPLOI',
    'CDD',
    "Chargé de protection de l'enfance",
    2,
    'humanitaire',
    'maradi',
    6,
    14,
    'bac3',
    '3 ans',
  ],
  ['EMPLOI', 'CDI', 'Conducteur de travaux', 6, 'btp', 'niamey', 4, 25, 'bac3', '5 ans'],
  ['EMPLOI', 'INTERIM', 'Chef de chantier', 6, 'btp', 'dosso', 2, 7, 'bac2', '4 ans'],
  ['EMPLOI', 'CDI', 'Chauffeur poids lourd', 7, 'logistique', 'zinder', 5, 19, 'sans', '3 ans'],
  ['EMPLOI', 'CDD', "Responsable d'entrepôt", 7, 'logistique', 'niamey', 11, 22, 'bac2', '3 ans'],
  ['EMPLOI', 'CDI', 'Commercial terrain', 9, 'commerce', 'maradi', 3, 27, 'bac2', '2 ans'],
  [
    'EMPLOI',
    'STAGE',
    'Stagiaire en communication',
    8,
    'commerce',
    'niamey',
    6,
    13,
    'bac3',
    'Débutant',
  ],
  [
    'EMPLOI',
    'CDD',
    'Enseignant de mathématiques',
    8,
    'education',
    'tillaberi',
    12,
    17,
    'bac3',
    '2 ans',
  ],
  ['EMPLOI', 'CDD', 'Agronome de terrain', 10, 'agriculture', 'maradi', 4, 23, 'bac3', '3 ans'],
  ['EMPLOI', 'CDI', "Réceptionniste d'hôtel", 9, 'tourisme', 'agadez', 7, 29, 'bac', '1 an'],
  ['EMPLOI', 'CDD', 'Ingénieur des mines', 9, 'mines', 'agadez', 15, 35, 'bac5', '5 ans'],
  [
    'EMPLOI',
    'CDD',
    'Secrétaire de direction',
    3,
    'administration',
    'niamey',
    20,
    -4,
    'bac2',
    '2 ans',
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    "Fourniture et installation d'un réseau informatique",
    3,
    'informatique',
    'niamey',
    1,
    26,
    undefined,
    undefined,
    45_000_000,
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    "Développement d'une plateforme de gestion des dossiers",
    3,
    'informatique',
    'niamey',
    3,
    19,
    undefined,
    undefined,
    80_000_000,
  ],
  [
    'MARCHE',
    'CONSULTATION',
    "Audit de sécurité des systèmes d'information",
    5,
    'informatique',
    'niamey',
    2,
    12,
    undefined,
    undefined,
  ],
  [
    'MARCHE',
    'AMI',
    'Hébergement et sauvegarde de données sensibles',
    4,
    'informatique',
    'dosso',
    4,
    3,
    undefined,
    undefined,
  ],
  [
    'MARCHE',
    'PRESTATION',
    'Maintenance du parc informatique',
    9,
    'informatique',
    'maradi',
    6,
    15,
    undefined,
    undefined,
    12_000_000,
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    'Construction de six salles de classe',
    8,
    'btp',
    'tillaberi',
    5,
    31,
    undefined,
    undefined,
    150_000_000,
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    "Réhabilitation d'une route communale",
    6,
    'btp',
    'zinder',
    8,
    24,
    undefined,
    undefined,
    320_000_000,
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    'Réalisation de vingt forages équipés',
    1,
    'eau',
    'tahoua',
    2,
    17,
    undefined,
    undefined,
    210_000_000,
  ],
  [
    'MARCHE',
    'CONSULTATION',
    "Étude de l'accès à l'eau potable en zone rurale",
    1,
    'eau',
    'agadez',
    7,
    10,
    undefined,
    undefined,
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    'Fourniture de médicaments essentiels',
    4,
    'sante',
    'niamey',
    3,
    2,
    undefined,
    undefined,
    95_000_000,
  ],
  [
    'MARCHE',
    'AMI',
    "Évaluation finale d'un programme de santé maternelle",
    4,
    'sante',
    'maradi',
    9,
    22,
    undefined,
    undefined,
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    'Fourniture de semences améliorées',
    10,
    'agriculture',
    'maradi',
    4,
    20,
    undefined,
    undefined,
    28_000_000,
  ],
  [
    'MARCHE',
    'CONSULTATION',
    "Recrutement d'un cabinet d'audit comptable",
    2,
    'finance',
    'niamey',
    10,
    14,
    undefined,
    undefined,
  ],
  [
    'MARCHE',
    'PRESTATION',
    'Transport de vivres vers Diffa',
    7,
    'logistique',
    'diffa',
    5,
    6,
    undefined,
    undefined,
    18_000_000,
  ],
  [
    'MARCHE',
    'AMI',
    "Formation des agents à l'archivage",
    3,
    'administration',
    'niamey',
    12,
    28,
    undefined,
    undefined,
  ],
  [
    'MARCHE',
    'PRESTATION',
    'Gardiennage et entretien des bureaux',
    5,
    'services',
    'niamey',
    14,
    18,
    undefined,
    undefined,
    9_000_000,
  ],
  [
    'MARCHE',
    'APPEL_OFFRES',
    'Fourniture de panneaux solaires',
    9,
    'mines',
    'agadez',
    22,
    -7,
    undefined,
    undefined,
    60_000_000,
  ],
  [
    'AUTRE',
    'FORMATION',
    'Formation en gestion de projet',
    8,
    'education',
    'niamey',
    2,
    21,
    undefined,
    undefined,
  ],
  [
    'AUTRE',
    'FORMATION',
    "Atelier d'initiation à l'analyse de données",
    8,
    'informatique',
    'niamey',
    4,
    16,
    undefined,
    undefined,
  ],
  [
    'AUTRE',
    'CONCOURS',
    "Concours d'entrée à l'institut de formation",
    8,
    'education',
    'zinder',
    6,
    25,
    undefined,
    undefined,
  ],
  [
    'AUTRE',
    'DIVERS',
    'Assemblée générale de la coopérative',
    10,
    'agriculture',
    'maradi',
    3,
    9,
    undefined,
    undefined,
  ],
  [
    'AUTRE',
    'DIVERS',
    'Vente de matériel de bureau réformé',
    3,
    'services',
    'niamey',
    8,
    -2,
    undefined,
    undefined,
  ],
];

const REGION_CITY: Readonly<Record<string, string>> = {
  agadez: 'Agadez',
  diffa: 'Diffa',
  dosso: 'Dosso',
  maradi: 'Maradi',
  niamey: 'Niamey',
  tahoua: 'Tahoua',
  tillaberi: 'Tillabéri',
  zinder: 'Zinder',
};

const TYPE_SLUG: Readonly<Record<ListingType, string>> = {
  CDI: 'cdi',
  CDD: 'cdd',
  CDD_RENOUVELABLE: 'cdd',
  INTERIM: 'interim',
  STAGE: 'stage',
  APPEL_OFFRES: 'ao',
  AMI: 'ami',
  CONSULTATION: 'consultation',
  PRESTATION: 'prestation',
  FORMATION: 'formation',
  CONCOURS: 'concours',
  DIVERS: 'annonce',
};

const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const SAMPLE_FILE: Attachment = {
  name: "Document d'exemple (fictif)",
  url: 'samples/document-fictif.pdf',
  sizeBytes: 600,
};

const DAY_MS = 86_400_000;

function howToApply(row: Row, id: number): HowToApply {
  const universe = row[0];
  if (universe === 'MARCHE') {
    return id % 2
      ? {
          mode: 'EMAIL',
          email: 'marches@example.org',
          instructions:
            "Envoyez votre offre technique et financière par e-mail avant la date limite, en rappelant la référence de l'avis.",
        }
      : {
          mode: 'LIEN',
          url: 'https://example.org/soumettre',
          instructions:
            "Déposez votre offre sur le portail de l'organisation avant la date limite. Les offres incomplètes sont écartées.",
        };
  }
  if (universe === 'EMPLOI' && id % 3 !== 0) {
    return {
      mode: 'EN_LIGNE',
      instructions: 'Postulez ici avec votre CV et votre lettre de motivation.',
    };
  }
  return {
    mode: 'EMAIL',
    email: 'contact@example.org',
    instructions: "Écrivez à l'adresse indiquée en précisant l'intitulé de l'annonce.",
  };
}

function describe(row: Row): readonly string[] {
  const [universe, , title, , , , , , education, experience] = row;
  const city = REGION_CITY[row[5]];
  if (universe === 'EMPLOI') {
    return [
      `Annonce fictive publiée pour tester la plateforme. Le poste de ${title.toLowerCase()} est basé à ${city}.`,
      "Vous rejoignez une équipe de terrain et rendez compte chaque semaine à votre responsable. Vous préparez les documents de suivi et participez aux réunions d'équipe.",
      experience === 'Débutant'
        ? 'Ce poste est ouvert aux débutants motivés.'
        : `Le poste demande au moins ${experience} d'expérience${education ? ' et le diplôme indiqué sur la fiche' : ''}.`,
    ];
  }
  if (universe === 'MARCHE') {
    return [
      `Avis fictif publié pour tester la plateforme. Il porte sur : ${title.toLowerCase()}, à ${city}.`,
      'Peuvent soumissionner les entreprises et les consultants en règle avec leurs obligations fiscales et sociales, qui justifient de références comparables.',
      "Le dossier précise les pièces à fournir, les critères d'évaluation et le calendrier d'exécution.",
    ];
  }
  return [
    `Annonce fictive publiée pour tester la plateforme : ${title.toLowerCase()}, à ${city}.`,
    "Les modalités d'inscription et de participation figurent dans le document joint.",
  ];
}

/** Dates calculées depuis aujourd'hui, pour que le jeu d'exemple ne vieillisse pas. */
export function buildSampleListings(now: Date): readonly Listing[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return ROWS.map((row, index) => {
    const [
      universe,
      type,
      title,
      org,
      sectorId,
      regionId,
      ago,
      left,
      education,
      experience,
      budget,
    ] = row;
    const number = String(index + 1).padStart(4, '0');
    const city = REGION_CITY[regionId];
    const isMarket = universe === 'MARCHE';
    return {
      id: `sample-${number}`,
      slug: `${TYPE_SLUG[type]}-${slugify(title)}-${slugify(city)}-${number}`,
      universe,
      type,
      reference: isMarket ? `EX-${number}` : undefined,
      title,
      summary: describe(row)[0],
      description: describe(row),
      organization: SAMPLE_ORGANIZATIONS[org - 1],
      sectorId,
      regionId,
      city,
      country: 'NE',
      educationLevel: education,
      experienceLevel: experience,
      publishedAt: new Date(today - ago * DAY_MS).toISOString(),
      deadline: new Date(today + left * DAY_MS + DAY_MS - 3_600_000 - 1000).toISOString(),
      status: 'PUBLIEE',
      howToApply: howToApply(row, index),
      budget: budget ? { amount: budget, currency: 'FCFA', hidden: index % 5 === 0 } : undefined,
      attachments: universe === 'EMPLOI' ? [] : [SAMPLE_FILE],
      isSample: true,
    } satisfies Listing;
  });
}

/** Adresses à prérendre : indépendantes de la date. */
export function sampleSlugs(universe: Universe): readonly { slug: string }[] {
  return buildSampleListings(new Date())
    .filter((listing) => listing.universe === universe)
    .map(({ slug }) => ({ slug }));
}
