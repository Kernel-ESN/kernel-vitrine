import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight } from 'lucide-angular';
import { EXPERTISE_NAV, OFFER_NAV } from '@core/config/navigation';
import { SITE_INFO } from '@core/config/site-info';
import { CountUpDirective } from '@shared/ui/count-up/count-up.directive';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PhotoComponent } from '@shared/ui/photo/photo.component';
import { PartnersComponent } from '@shared/ui/partners/partners.component';
import { RevealDirective } from '@shared/ui/reveal/reveal.directive';
import { METHOD_STEPS } from '../../method/data-access/method.data';
import {
  FIELD_SCENES,
  LOCAL_CONDITIONS,
  NIGER_FIGURES,
  NIGER_FIGURES_SOURCE,
} from '../data-access/home.data';
import { AudienceConsoleComponent } from '../ui/audience-console.component';
import { KernelCoreComponent } from '../ui/kernel-core.component';
import { PageWeightComponent } from '../ui/page-weight.component';
import { SignalFieldComponent } from '../ui/signal-field.component';

@Component({
  selector: 'app-home',
  imports: [
    AudienceConsoleComponent,
    CountUpDirective,
    CtaBandComponent,
    IconComponent,
    KernelCoreComponent,
    PageWeightComponent,
    PartnersComponent,
    PhotoComponent,
    RevealDirective,
    RouterLink,
    SignalFieldComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly site = SITE_INFO;
  protected readonly arrow = ArrowRight;
  protected readonly expertises = EXPERTISE_NAV;
  protected readonly scenes = FIELD_SCENES;
  protected readonly conditions = LOCAL_CONDITIONS;
  protected readonly steps = METHOD_STEPS;
  protected readonly figures = NIGER_FIGURES;
  protected readonly figuresSource = NIGER_FIGURES_SOURCE;
  protected readonly offers = OFFER_NAV.filter((offer) => offer.featured).slice(0, 4);
}
