import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MapPin, Phone } from 'lucide-angular';
import { SITE_INFO } from '@core/config/site-info';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { PartnersComponent } from '@shared/ui/partners/partners.component';
import { RevealDirective } from '@shared/ui/reveal/reveal.directive';
import { COLLABORATOR_DOMAINS, FOUNDERS, TRACK_RECORD } from '../data-access/founders.data';

@Component({
  selector: 'app-about',
  imports: [CtaBandComponent, IconComponent, PageHeroComponent, PartnersComponent, RevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly site = SITE_INFO;
  protected readonly founders = FOUNDERS;
  protected readonly collaborators = COLLABORATOR_DOMAINS;
  protected readonly record = TRACK_RECORD;
  protected readonly icons = { pin: MapPin, phone: Phone };
  protected readonly commitments = [
    {
      title: "Nous vous disons quand vous n'avez pas besoin de nous.",
      text: 'Si un tableur bien tenu suffit, nous ne vendrons pas une plateforme.',
    },
    {
      title: "Rien n'est au nom de Kernel.",
      text: 'Domaine, serveurs, code et comptes restent à votre nom, avec les accès entre vos mains.',
    },
    {
      title: "On écrit ce qu'on fait.",
      text: 'Une personne arrivée après nous doit pouvoir comprendre le système sans nous appeler.',
    },
    {
      title: 'On ne touche pas à vos données sans raison.',
      text: 'Accès limités aux personnes nommées, retirés à la fin de la mission.',
    },
  ] as const;
}
