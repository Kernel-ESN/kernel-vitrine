import { OfferNav } from '@core/config/navigation';

export type Billing = 'unique' | 'creation-et-abonnement' | 'abonnement' | 'devis';

export const BILLING_LABELS: Readonly<Record<Billing, string>> = {
  unique: 'Paiement unique',
  'creation-et-abonnement': 'Création, puis abonnement',
  abonnement: 'Abonnement',
  devis: 'Projet chiffré sur devis',
};

export type Period = 'mois' | 'an';

/**
 * Abonnement annuel : douze mois au prix de dix, soit deux mois offerts.
 * Valeur PROVISOIRE, comme les prix, à confirmer par Kernel Consulting.
 */
export const ANNUAL_MONTHS_BILLED = 10;
export const FREE_MONTHS = 12 - ANNUAL_MONTHS_BILLED;

/** Montants en francs CFA, « à partir de ». */
export interface OfferPrice {
  /** Création ou prestation unique. */
  readonly setup?: number;
  /** Abonnement, exprimé par mois ; l'annuel s'en déduit. */
  readonly monthly?: number;
  /** Projet chiffré après un premier échange. */
  readonly onQuote?: boolean;
}

const amount = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export const hasSubscription = (price: OfferPrice): boolean => price.monthly !== undefined;

const recurring = (monthly: number, period: Period): string =>
  period === 'mois'
    ? `${amount.format(monthly)} FCFA par mois`
    : `${amount.format(monthly * ANNUAL_MONTHS_BILLED)} FCFA par an`;

/** Ligne principale du prix. */
export function formatPrice(price: OfferPrice, period: Period = 'mois'): string {
  if (price.onQuote) {
    return 'Sur devis';
  }
  if (price.setup !== undefined) {
    return `À partir de ${amount.format(price.setup)} FCFA`;
  }
  return `À partir de ${recurring(price.monthly ?? 0, period)}`;
}

/** Ligne secondaire : l'abonnement qui suit la création, ou le mode de chiffrage. */
export function formatThen(price: OfferPrice, period: Period = 'mois'): string | null {
  if (price.onQuote) {
    return 'Prix fixé après un premier échange sur votre besoin';
  }
  if (price.setup !== undefined && price.monthly !== undefined) {
    return `puis ${recurring(price.monthly, period)}`;
  }
  return null;
}

/** L'avantage de l'annuel, affiché seulement quand il s'applique. */
export const formatSaving = (price: OfferPrice, period: Period): string | null =>
  hasSubscription(price) && period === 'an' ? `${FREE_MONTHS} mois offerts` : null;

export interface OfferContent {
  readonly headline: string;
  readonly audience: string;
  readonly intro: string;
  readonly billing: Billing;
  readonly price: OfferPrice;
  readonly includes: readonly string[];
  readonly options: readonly string[];
  readonly fromYou: readonly string[];
  /** La commande demande le nom de domaine souhaité et le nombre d'adresses mail. */
  readonly asksDomain: boolean;
  readonly faq: readonly { readonly question: string; readonly answer: string }[];
}

export interface Offer {
  readonly nav: OfferNav;
  readonly content: OfferContent;
}
