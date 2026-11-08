import {
  BrainCircuit,
  GitBranch,
  ScanText,
  BellRing,
  AtSign,
  Boxes,
  ClipboardList,
  Globe,
  HardDrive,
  ShoppingBag,
  Store,
  Wrench,
  LockKeyhole,
  Briefcase,
  Building2,
  Calculator,
  CircleHelp,
  Cloud,
  Database,
  FileText,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Landmark,
  ListChecks,
  LucideIconData,
  MessagesSquare,
  ScanSearch,
  ShieldCheck,
  User,
  Workflow,
} from 'lucide-angular';

export type ExpertiseKey = 'devops' | 'data' | 'cloud' | 'cyber';

export interface AudienceNav {
  readonly slug: string;
  readonly label: string;
  readonly blurb: string;
  readonly icon: LucideIconData;
}

export interface ExpertiseNav {
  readonly key: ExpertiseKey;
  readonly slug: string;
  readonly label: string;
  readonly blurb: string;
  readonly icon: LucideIconData;
}

export interface PlatformNav {
  readonly path: string;
  readonly label: string;
  readonly blurb: string;
  readonly icon: LucideIconData;
}

export type OfferCategory = 'presence' | 'adresse' | 'ia' | 'outils' | 'abonnement' | 'protection';

export interface OfferNav {
  readonly slug: string;
  readonly label: string;
  readonly blurb: string;
  readonly icon: LucideIconData;
  readonly category: OfferCategory;
  /** Présentée dans le menu. */
  readonly featured: boolean;
}

export const OFFER_CATEGORIES: readonly { readonly id: OfferCategory; readonly label: string }[] = [
  { id: 'presence', label: 'Être en ligne' },
  { id: 'adresse', label: 'Nom de domaine et messagerie' },
  { id: 'ia', label: 'IA et automatisation' },
  { id: 'outils', label: 'Numérisation et outils métier' },
  { id: 'abonnement', label: 'Abonnements' },
  { id: 'protection', label: 'Protection du bureau' },
];

/** Offres prêtes à commander. Le contenu détaillé vit dans `features/showcase/offers`. */
export const OFFER_NAV: readonly OfferNav[] = [
  {
    slug: 'site-web-ong',
    label: 'Site web pour ONG',
    blurb: 'Projets, rapports et recrutements, lisibles par vos bailleurs.',
    icon: Globe,
    category: 'presence',
    featured: true,
  },
  {
    slug: 'site-web-entreprise',
    label: 'Site web pour votre activité',
    blurb: 'Vos services, vos horaires, un bouton WhatsApp.',
    icon: Store,
    category: 'presence',
    featured: true,
  },
  {
    slug: 'boutique-en-ligne',
    label: 'Boutique en ligne',
    blurb: 'Paiement par mobile money ou à la livraison.',
    icon: ShoppingBag,
    category: 'presence',
    featured: false,
  },
  {
    slug: 'domaine-et-messagerie',
    label: 'Nom de domaine et adresses mail',
    blurb: 'Des adresses à votre nom, enregistrées à votre nom.',
    icon: AtSign,
    category: 'adresse',
    featured: true,
  },
  {
    slug: 'integration-ia',
    label: 'IA dans vos outils',
    blurb: 'Vos documents interrogés, vos demandes triées, vos fiches lues.',
    icon: BrainCircuit,
    category: 'ia',
    featured: true,
  },
  {
    slug: 'automatisation',
    label: 'Automatisation de vos pipelines',
    blurb: 'Tests, mises en production et traitements de données qui tournent seuls.',
    icon: GitBranch,
    category: 'ia',
    featured: true,
  },
  {
    slug: 'numerisation',
    label: 'Numérisation de vos services',
    blurb: 'Du registre papier à la démarche en ligne, même en partant de zéro.',
    icon: ScanText,
    category: 'outils',
    featured: true,
  },
  {
    slug: 'hebergement-gere',
    label: 'Hébergement géré',
    blurb: 'Serveur, sauvegardes et mises à jour, par abonnement.',
    icon: HardDrive,
    category: 'abonnement',
    featured: false,
  },
  {
    slug: 'maintenance',
    label: 'Maintenance et évolutions',
    blurb: 'Un interlocuteur pour corriger et faire évoluer votre site.',
    icon: Wrench,
    category: 'abonnement',
    featured: false,
  },
  {
    slug: 'collecte-hors-ligne',
    label: 'Collecte de données hors ligne',
    blurb: 'Des formulaires sur téléphone qui marchent sans réseau.',
    icon: ClipboardList,
    category: 'outils',
    featured: false,
  },
  {
    slug: 'outil-de-gestion',
    label: 'Outil de gestion pour votre activité',
    blurb: 'Stocks, inscriptions, dossiers : fini le cahier et Excel.',
    icon: Boxes,
    category: 'outils',
    featured: false,
  },
  {
    slug: 'protection-du-bureau',
    label: 'Sauvegarde et sécurité du bureau',
    blurb: 'Postes à jour, comptes protégés, copies hors site.',
    icon: LockKeyhole,
    category: 'protection',
    featured: false,
  },
];

export interface MethodNav {
  /** Ancre de la section dans la page Méthode. */
  readonly fragment: string;
  readonly label: string;
  readonly blurb: string;
  readonly icon: LucideIconData;
}

/** Les libellés des étapes reprennent ceux de la page : un test vérifie qu'ils restent alignés. */
export const METHOD_NAV: readonly MethodNav[] = [
  {
    fragment: 'etape-1',
    label: 'On vous écoute',
    blurb: 'Un premier échange, au téléphone ou sur place à Niamey.',
    icon: MessagesSquare,
  },
  {
    fragment: 'etape-2',
    label: 'On regarde ce qui existe',
    blurb: 'Un état des lieux écrit, avec les risques classés par gravité.',
    icon: ScanSearch,
  },
  {
    fragment: 'etape-3',
    label: 'On chiffre un plan',
    blurb: 'Un périmètre, un calendrier et un prix, avant tout engagement.',
    icon: Calculator,
  },
  {
    fragment: 'etape-4',
    label: 'On livre par étapes',
    blurb: 'Chaque étape se teste chez vous et se valide avant la suivante.',
    icon: ListChecks,
  },
  {
    fragment: 'etape-5',
    label: 'On vous rend les clés',
    blurb: 'Code, accès, documentation et formation, à votre nom.',
    icon: KeyRound,
  },
  {
    fragment: 'questions',
    label: 'Questions fréquentes',
    blurb: 'Le prix, le cahier des charges, le travail hors de Niamey.',
    icon: CircleHelp,
  },
];

export const PLATFORM_NAV: readonly PlatformNav[] = [
  {
    path: '/emplois',
    label: 'Emplois',
    blurb: 'CDI, CDD, intérim et stages, dans tout le pays.',
    icon: Briefcase,
  },
  {
    path: '/marches',
    label: 'Marchés et projets',
    blurb: "Appels d'offres, manifestations d'intérêt et consultations.",
    icon: FileText,
  },
  {
    path: '/autres',
    label: 'Autres',
    blurb: 'Formations, concours et annonces diverses.',
    icon: GraduationCap,
  },
  {
    path: '/organisations',
    label: 'Organisations',
    blurb: 'Celles qui publient, avec leurs annonces ouvertes.',
    icon: Building2,
  },
  {
    path: '/alertes',
    label: 'Mes alertes',
    blurb: 'Être prévenu des nouvelles annonces qui vous concernent.',
    icon: BellRing,
  },
  {
    path: '/compte',
    label: 'Mon compte',
    blurb: 'Vos annonces enregistrées et vos candidatures.',
    icon: User,
  },
];

export const EXPERTISE_NAV: readonly ExpertiseNav[] = [
  {
    key: 'devops',
    slug: 'devops',
    label: 'DevOps',
    blurb: 'Développer vos applications et les mettre en ligne sans y laisser une nuit.',
    icon: Workflow,
  },
  {
    key: 'data',
    slug: 'data',
    label: 'Data',
    blurb: 'Collecter, ranger et faire parler les chiffres que vous avez déjà.',
    icon: Database,
  },
  {
    key: 'cloud',
    slug: 'cloud',
    label: 'Cloud',
    blurb: 'Héberger au bon endroit, à la bonne taille, avec des sauvegardes testées.',
    icon: Cloud,
  },
  {
    key: 'cyber',
    slug: 'cybersecurite',
    label: 'Cybersécurité',
    blurb: 'Trouver les portes ouvertes chez vous et les fermer.',
    icon: ShieldCheck,
  },
];

export const AUDIENCE_NAV: readonly AudienceNav[] = [
  {
    slug: 'etats-institutions',
    label: 'États et institutions publiques',
    blurb: 'Ministères, collectivités, agences.',
    icon: Landmark,
  },
  {
    slug: 'ong',
    label: 'ONG et organisations internationales',
    blurb: 'Équipes de terrain, bailleurs, données sensibles.',
    icon: HeartHandshake,
  },
  {
    slug: 'entreprises',
    label: 'Entreprises',
    blurb: 'PME, groupes, banques, opérateurs.',
    icon: Building2,
  },
  {
    slug: 'ecoles-sante-associations',
    label: 'Écoles, santé, associations, coopératives',
    blurb: 'Des moyens limités, des données à protéger.',
    icon: GraduationCap,
  },
  {
    slug: 'particuliers',
    label: 'Particuliers',
    blurb: 'Entrepreneurs, professions libérales, porteurs de projet.',
    icon: User,
  },
];
