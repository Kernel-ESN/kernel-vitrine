import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Photo, PhotoKey, PHOTOS } from './photos';

/** Photo légère : WebP, chargement différé, dimensions réservées. Crédits dans les mentions légales. */
@Component({
  selector: 'app-photo',
  template: `<figure class="photo">
    <img
      [src]="src()"
      [attr.srcset]="srcset()"
      [attr.sizes]="sizes()"
      [width]="photo().width"
      [height]="photo().height"
      [alt]="photo().alt"
      [style.aspect-ratio]="ratio()"
      loading="lazy"
      decoding="async"
    />
  </figure>`,
  styles: `
    :host {
      display: block;
    }
    .photo {
      position: relative;
      overflow: hidden;
      margin: 0;
      border-radius: var(--radius);
    }
    .photo::after {
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--color-night) 12%, transparent);
      content: '';
      pointer-events: none;
    }
    img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius);
      background: var(--color-frost);
      object-fit: cover;
      filter: saturate(0.8) contrast(1.06);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoComponent {
  readonly name = input.required<PhotoKey>();
  /** Rapport largeur sur hauteur affiché, par exemple `21 / 9`. */
  readonly ratio = input('16 / 9');
  readonly sizes = input('(min-width: 90rem) 86rem, 100vw');

  protected readonly photo = computed((): Photo => PHOTOS[this.name()]);
  protected readonly src = computed(
    () => `/images/photos/${this.photo().name}-${this.photo().widths[0]}.webp`,
  );
  protected readonly srcset = computed(() =>
    this.photo()
      .widths.map((width) => `/images/photos/${this.photo().name}-${width}.webp ${width}w`)
      .join(', '),
  );
}
