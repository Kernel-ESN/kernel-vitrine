import { Listing } from './listing';

/** Données structurées `JobPosting` pour Google. Jamais produites pour une annonce d'exemple. */
export function toJobPosting(listing: Listing, url: string): Record<string, unknown> | null {
  if (listing.isSample || listing.universe !== 'EMPLOI' || listing.status !== 'PUBLIEE') {
    return null;
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: listing.title,
    description: listing.description.join('\n'),
    datePosted: listing.publishedAt,
    validThrough: listing.deadline,
    url,
    hiringOrganization: { '@type': 'Organization', name: listing.organization.name },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.city,
        addressCountry: listing.country,
      },
    },
  };
}
