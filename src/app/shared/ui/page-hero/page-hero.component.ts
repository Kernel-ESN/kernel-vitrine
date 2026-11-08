import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideIconData } from 'lucide-angular';
import { IconComponent } from '../icon/icon.component';
import { Photo, PhotoKey, PHOTOS } from '../photo/photos';

export interface Crumb {
  readonly label: string;
  readonly link: string;
}

@Component({
  selector: 'app-page-hero',
  imports: [IconComponent, RouterLink],
  templateUrl: './page-hero.component.html',
  styleUrl: './page-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeroComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input<string>();
  readonly icon = input<LucideIconData>();
  readonly crumbs = input<readonly Crumb[]>([]);
  /** Préfixe des éléments partagés avec la page d'origine, pour la transition entre pages. */
  readonly morph = input<string>();
  /** Photo affichée à droite sur grand écran, sous le texte sur téléphone. */
  readonly photo = input<PhotoKey>();

  protected readonly image = computed((): Photo | null => {
    const key = this.photo();
    return key ? PHOTOS[key] : null;
  });
  protected readonly srcset = computed(() => {
    const image = this.image();
    return image
      ? image.widths
          .map((width) => `/images/photos/${image.name}-${width}.webp ${width}w`)
          .join(', ')
      : null;
  });
}
