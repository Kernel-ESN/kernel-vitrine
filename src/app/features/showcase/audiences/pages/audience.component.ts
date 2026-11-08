import { PhotoKey } from '@shared/ui/photo/photos';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, Check } from 'lucide-angular';
import { AUDIENCE_NAV, EXPERTISE_NAV } from '@core/config/navigation';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { RevealDirective } from '@shared/ui/reveal/reveal.directive';
import { AUDIENCES } from '../data-access/audiences.data';

const AUDIENCE_PHOTOS: Readonly<Record<string, PhotoKey>> = {
  'etats-institutions': 'niameyPlaceLiptako',
  ong: 'routeN4Sahel',
  entreprises: 'niameyVille',
  'ecoles-sante-associations': 'villageMaradi',
  particuliers: 'telephoneMain',
};

@Component({
  selector: 'app-audience',
  imports: [CtaBandComponent, IconComponent, PageHeroComponent, RevealDirective, RouterLink],
  templateUrl: './audience.component.html',
  styleUrl: './audience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudienceComponent {
  /** Fourni par les données de la route. */
  readonly slug = input.required<string>();

  protected readonly expertises = EXPERTISE_NAV;
  protected readonly icons = { arrow: ArrowRight, check: Check };
  protected readonly nav = computed(() => AUDIENCE_NAV.find((item) => item.slug === this.slug())!);
  protected readonly photo = computed((): PhotoKey | undefined => AUDIENCE_PHOTOS[this.slug()]);
  protected readonly audience = computed(() =>
    AUDIENCES.find((item) => item.slug === this.slug())!,
  );
  protected readonly others = computed(() =>
    AUDIENCE_NAV.filter((item) => item.slug !== this.slug()),
  );
}
