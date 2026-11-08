import { Listing, Universe } from './listing';

/** Copie légère : la liste reste lisible même si l'annonce est retirée entre-temps. */
export interface SavedListing {
  readonly id: string;
  readonly slug: string;
  readonly universe: Universe;
  readonly title: string;
  readonly organizationName: string;
}

export const toSaved = (listing: Listing): SavedListing => ({
  id: listing.id,
  slug: listing.slug,
  universe: listing.universe,
  title: listing.title,
  organizationName: listing.organization.name,
});
