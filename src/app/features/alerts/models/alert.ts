import { Params } from '@angular/router';
import {
  labelOf,
  ListingType,
  REGIONS,
  SECTORS,
  TYPE_LABELS,
  Universe,
  UNIVERSES,
} from '@features/listings/models/listing';

export type AlertChannel = 'EMAIL' | 'WHATSAPP';
export type AlertFrequency = 'IMMEDIATE' | 'QUOTIDIEN' | 'HEBDO';

export interface AlertCriteria {
  readonly universe?: Universe;
  readonly type?: ListingType;
  readonly sectorId?: string;
  readonly regionId?: string;
  readonly keywords?: string;
}

export interface Alert {
  readonly id: string;
  readonly criteria: AlertCriteria;
  readonly email: string;
  readonly channel: AlertChannel;
  readonly frequency: AlertFrequency;
  readonly createdAt: string;
}

/** L'alerte part vers l'e-mail du compte : personne ne peut abonner l'adresse d'un tiers. */
export type NewAlert = Omit<Alert, 'id' | 'createdAt' | 'email'>;

export const FREQUENCY_LABELS: Readonly<Record<AlertFrequency, string>> = {
  IMMEDIATE: 'Dès la publication',
  QUOTIDIEN: 'Une fois par jour',
  HEBDO: 'Une fois par semaine',
};

/** Reprend les critères d'une recherche : `/alertes/nouvelle?univers=MARCHE&secteur=informatique`. */
export function criteriaFromParams(params: Params): AlertCriteria {
  const text = (name: string): string | undefined =>
    (params[name] as string | undefined) || undefined;
  const universe = text('univers');
  const type = text('type');
  const sector = text('secteur');
  const region = text('region');
  return {
    universe: UNIVERSES.some((u) => u.id === universe) ? (universe as Universe) : undefined,
    type: type && type in TYPE_LABELS ? (type as ListingType) : undefined,
    sectorId: SECTORS.some((s) => s.id === sector) ? sector : undefined,
    regionId: REGIONS.some((r) => r.id === region) ? region : undefined,
    keywords: text('q')?.slice(0, 120),
  };
}

export function describeCriteria(criteria: AlertCriteria): string {
  const parts = [
    criteria.universe && UNIVERSES.find((u) => u.id === criteria.universe)?.label,
    criteria.type && TYPE_LABELS[criteria.type],
    labelOf(SECTORS, criteria.sectorId),
    criteria.regionId ? labelOf(REGIONS, criteria.regionId) : 'Tout le Niger',
    criteria.keywords && `« ${criteria.keywords} »`,
  ];
  return parts.filter(Boolean).join(' · ');
}
