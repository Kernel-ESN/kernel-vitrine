import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExternalLink } from 'lucide-angular';
import { SITE_INFO } from '@core/config/site-info';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { Photo, PHOTOS } from '@shared/ui/photo/photos';
import { ScrollSpyDirective } from '@shared/ui/toc/scroll-spy.directive';
import { TocComponent, TocItem } from '@shared/ui/toc/toc.component';

/** Nom lisible de la plateforme d'origine d'une photo, déduit de son adresse. */
export function originOf(source: string): string {
  const host = new URL(source).hostname;
  const origins: readonly (readonly [string, string])[] = [
    ['wikimedia.org', 'Wikimedia Commons'],
    ['flickr.com', 'Flickr'],
    ['stocksnap.io', 'StockSnap'],
    ['rawpixel.com', 'rawpixel'],
    ['wordpress.org', 'WordPress Photos'],
  ];
  return origins.find(([domain]) => host.endsWith(domain))?.[1] ?? host;
}

export interface CreditRow {
  readonly name: string;
  readonly thumbnail: string;
  readonly subject: string;
  readonly author: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly source: string;
  readonly origin: string;
}

const toRow = (photo: Photo): CreditRow => ({
  name: photo.name,
  thumbnail: `/images/photos/${photo.name}-${photo.widths[0]}.webp`,
  // La description sert de sujet : sans point final dans un tableau.
  subject: photo.alt.replace(/\.$/, ''),
  author: photo.author ?? '',
  license: photo.license ?? '',
  licenseUrl: photo.licenseUrl ?? '',
  source: photo.source ?? '',
  origin: photo.source ? originOf(photo.source) : '',
});

/** Une ligne par photo sous licence libre ; les photos de Kernel Consulting n'en ont pas. */
export const CREDITS: readonly CreditRow[] = (Object.values(PHOTOS) as readonly Photo[])
  .filter((photo) => photo.author)
  .map(toRow);

@Component({
  selector: 'app-legal',
  imports: [IconComponent, PageHeroComponent, ScrollSpyDirective, TocComponent],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalComponent {
  protected readonly site = SITE_INFO;
  protected readonly external = ExternalLink;
  protected readonly updated = '8 novembre 2026';
  protected readonly credits = CREDITS;
  protected readonly sections: readonly TocItem[] = [
    { id: 'editeur', label: 'Éditeur du site' },
    { id: 'hebergement', label: 'Hébergement' },
    { id: 'donnees', label: 'Données personnelles' },
    { id: 'contenus', label: 'Contenus et marques' },
    { id: 'photos', label: 'Crédits photographiques' },
  ];
}
