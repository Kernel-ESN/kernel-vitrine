import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight } from 'lucide-angular';
import { EXPERTISE_NAV } from '@core/config/navigation';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { RevealDirective } from '@shared/ui/reveal/reveal.directive';
import { EXPERTISES } from '../data-access/expertises.data';

@Component({
  selector: 'app-expertises',
  imports: [CtaBandComponent, IconComponent, PageHeroComponent, RevealDirective, RouterLink],
  templateUrl: './expertises.component.html',
  styleUrl: './expertises.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertisesComponent {
  protected readonly arrow = ArrowRight;
  protected readonly items = EXPERTISE_NAV.map((nav) => ({
    nav,
    content: EXPERTISES.find((item) => item.key === nav.key)!,
  }));
}
