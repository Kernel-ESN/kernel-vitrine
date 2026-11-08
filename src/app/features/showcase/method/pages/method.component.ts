import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CtaBandComponent } from '@shared/ui/cta-band/cta-band.component';
import { FaqComponent, FaqItem } from '@shared/ui/faq/faq.component';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { RevealDirective } from '@shared/ui/reveal/reveal.directive';
import { METHOD_STEPS } from '../data-access/method.data';

@Component({
  selector: 'app-method',
  imports: [CtaBandComponent, FaqComponent, PageHeroComponent, RevealDirective],
  templateUrl: './method.component.html',
  styleUrl: './method.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MethodComponent {
  protected readonly steps = METHOD_STEPS;
  protected readonly faq: readonly FaqItem[] = [
    {
      question: 'Combien ça coûte ?',
      answer:
        "Nous ne publions pas de tarif, parce qu'une boîte mail pour cinq personnes et un portail national n'ont rien à voir. Après le diagnostic, vous recevez un prix écrit, avant de vous engager.",
    },
    {
      question: 'Il faut un cahier des charges pour commencer ?',
      answer:
        "Non. Si vous en avez un, tant mieux. Sinon, décrivez ce qui ne va pas, et nous l'écrirons ensemble si le projet le demande.",
    },
    {
      question: 'Travaillez-vous en dehors de Niamey ?',
      answer:
        "Oui. Nous intervenons à distance pour des clients dans d'autres pays, et nous nous déplaçons quand le travail le demande.",
    },
    {
      question: 'Et si nous voulons changer de prestataire plus tard ?',
      answer:
        "Vous partez avec le code, les accès et la documentation. Un système bien livré doit pouvoir être repris par quelqu'un d'autre.",
    },
  ];
}
