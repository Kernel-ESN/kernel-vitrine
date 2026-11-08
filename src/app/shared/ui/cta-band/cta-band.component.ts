import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, Phone } from 'lucide-angular';
import { SITE_INFO } from '@core/config/site-info';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-cta-band',
  imports: [IconComponent, RouterLink],
  templateUrl: './cta-band.component.html',
  styleUrl: './cta-band.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaBandComponent {
  readonly title = input('Dites-nous ce qui bloque.');
  readonly action = input('Écrire à un ingénieur');
  readonly lead = input('Avec vos mots, sans vocabulaire technique. Un ingénieur vous répond.');
  readonly audienceSlug = input<string>();
  /** Slug d'un service : le lien ouvre le formulaire sur une demande de devis pour ce service. */
  readonly quoteFor = input<string>();

  protected readonly contactParams = computed(() => {
    const service = this.quoteFor();
    const audience = this.audienceSlug();
    return {
      ...(audience ? { public: audience } : {}),
      ...(service ? { objet: 'devis', service } : {}),
    };
  });

  protected readonly site = SITE_INFO;
  protected readonly icons = { arrow: ArrowRight, phone: Phone };
}
