import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { toJobPosting } from '../models/job-posting';
import { Listing, listingLink } from '../models/listing';

const SCRIPT_ID = 'listing-structured-data';

/** Titre, partage WhatsApp, indexation et données structurées d'une fiche d'annonce. */
@Injectable({ providedIn: 'root' })
export class ListingSeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(listing: Listing): void {
    const heading = `${listing.title} | ${listing.organization.name}`;
    this.title.setTitle(heading);
    this.meta.updateTag({ name: 'description', content: listing.summary });
    this.meta.updateTag({ property: 'og:title', content: heading });
    this.meta.updateTag({ property: 'og:description', content: listing.summary });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.clearScript();
    const url = `${this.document.location.origin}${listingLink(listing).join('/').replace(/^\/+/, '/')}`;
    const data = toJobPosting(listing, url);
    if (data) {
      const script = this.document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }

  clear(): void {
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.clearScript();
  }

  private clearScript(): void {
    this.document.getElementById(SCRIPT_ID)?.remove();
  }
}
