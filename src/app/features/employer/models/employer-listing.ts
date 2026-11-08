import { ApplyMode, ListingStatus, ListingType } from '@features/listings/models/listing';

export interface EmployerListing {
  readonly id: string;
  readonly ownerId: string;
  readonly type: ListingType;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly sectorId: string;
  readonly regionId: string;
  readonly city: string;
  /** Date saisie, au format AAAA-MM-JJ. */
  readonly deadline: string;
  readonly applyMode: ApplyMode;
  readonly applyEmail: string;
  readonly applyUrl: string;
  readonly instructions: string;
  readonly budget: number | null;
  readonly status: ListingStatus;
  /** Motif donné par le modérateur quand il refuse ou retire l'annonce. */
  readonly moderationNote?: string | null;
  readonly views: number;
  readonly applications: number;
  readonly updatedAt: string;
}

export type ListingDraft = Omit<
  EmployerListing,
  'id' | 'ownerId' | 'status' | 'moderationNote' | 'views' | 'applications' | 'updatedAt'
>;

export const STATUS_LABELS: Readonly<Record<ListingStatus, string>> = {
  BROUILLON: 'Brouillon',
  EN_ATTENTE: 'En attente de validation',
  PUBLIEE: 'Publiée',
  EXPIREE: 'Expirée',
  RETIREE: 'Clôturée',
};

/** Modèles de départ par type (cahier des charges §4.3). */
export function templateFor(
  type: ListingType,
): Pick<ListingDraft, 'description' | 'instructions' | 'applyMode'> {
  const isJob = ['CDI', 'CDD', 'CDD_RENOUVELABLE', 'INTERIM', 'STAGE'].includes(type);
  if (isJob) {
    return {
      description:
        'Le poste :\n\nVos missions :\n\nLe profil recherché :\n\nCe que nous proposons :',
      instructions: 'Postulez en ligne avec votre CV et votre lettre de motivation.',
      applyMode: 'EN_LIGNE',
    };
  }
  if (['APPEL_OFFRES', 'AMI', 'CONSULTATION', 'PRESTATION'].includes(type)) {
    return {
      description:
        'Objet du marché :\n\nQui peut soumissionner :\n\nPièces à fournir :\n\nCritères d’évaluation :\n\nCalendrier :',
      instructions:
        'Envoyez votre offre technique et financière avant la date limite, en rappelant la référence de l’avis.',
      applyMode: 'EMAIL',
    };
  }
  return {
    description: 'Présentation :\n\nModalités :',
    instructions: 'Écrivez à l’adresse indiquée.',
    applyMode: 'EMAIL',
  };
}

export const canClose = (listing: EmployerListing): boolean =>
  listing.status === 'PUBLIEE' || listing.status === 'EN_ATTENTE';

export const canRepublish = (listing: EmployerListing): boolean =>
  listing.status === 'RETIREE' || listing.status === 'EXPIREE';
