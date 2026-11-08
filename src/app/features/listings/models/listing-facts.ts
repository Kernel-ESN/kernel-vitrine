import { LISTINGS_TEXT } from '../listings.text';
import { formatDay, formatMoney } from './deadline';
import { EDUCATION_LEVELS, labelOf, Listing, REGIONS, SECTORS, TYPE_LABELS } from './listing';

/** Écrit « Niamey, Niger » plutôt que « Niamey, Niamey, Niger ». */
export function placeOf(listing: Pick<Listing, 'city' | 'regionId'>): string {
  const region = labelOf(REGIONS, listing.regionId);
  return listing.city === region ? `${region}, Niger` : `${listing.city}, ${region}, Niger`;
}

/** Lignes de la fiche, sans celles qui ne s'appliquent pas à cette annonce. */
export function listingFacts(listing: Listing): readonly (readonly [string, string])[] {
  const text = LISTINGS_TEXT.detail;
  const budget = listing.budget;
  const rows: readonly (readonly [string, string | undefined])[] = [
    [text.contract, TYPE_LABELS[listing.type]],
    [text.reference, listing.reference],
    [text.location, placeOf(listing)],
    [text.sector, labelOf(SECTORS, listing.sectorId)],
    [text.education, labelOf(EDUCATION_LEVELS, listing.educationLevel) || undefined],
    [text.experience, listing.experienceLevel],
    [
      text.budget,
      budget && (budget.hidden ? text.budgetHidden : formatMoney(budget.amount, budget.currency)),
    ],
    [text.published, formatDay(listing.publishedAt)],
    [text.deadline, formatDay(listing.deadline)],
  ];
  return rows.filter((row): row is readonly [string, string] => Boolean(row[1]));
}
