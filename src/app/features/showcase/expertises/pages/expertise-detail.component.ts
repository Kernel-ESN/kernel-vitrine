import { PhotoKey } from '@shared/ui/photo/photos';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Check } from 'lucide-angular';
import { EXPERTISE_NAV, ExpertiseKey } from '@core/config/navigation';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { FaqComponent } from '@shared/ui/faq/faq.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { RevealDirective } from '@shared/ui/reveal/reveal.directive';
import { EXPERTISES } from '../data-access/expertises.data';

const EXPERTISE_PHOTOS: Readonly<Record<ExpertiseKey, PhotoKey>> = {
  devops: 'relectureCode',
  data: 'schemaFlux',
  cloud: 'salleServeurs',
  cyber: 'baieReseau',
};

@Component({
  selector: 'app-expertise-detail',
  imports: [
    CtaBandComponent,
    FaqComponent,
    IconComponent,
    PageHeroComponent,
    RevealDirective,
    RouterLink,
  ],
  templateUrl: './expertise-detail.component.html',
  styleUrl: './expertise-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertiseDetailComponent {
  /** Fourni par les données de la route. */
  readonly slug = input.required<string>();

  protected readonly check = Check;
  protected readonly crumbs = [{ label: 'Services', link: '/services' }];
  protected readonly photo = computed((): PhotoKey => EXPERTISE_PHOTOS[this.nav().key]);
  protected readonly nav = computed(() => EXPERTISE_NAV.find((item) => item.slug === this.slug())!);
  protected readonly content = computed(() =>
    EXPERTISES.find((item) => item.key === this.nav().key)!,
  );
  protected readonly others = computed(() =>
    EXPERTISE_NAV.filter((item) => item.slug !== this.slug()),
  );
}
