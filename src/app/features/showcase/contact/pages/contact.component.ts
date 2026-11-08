import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CircleAlert, CircleCheck, MapPin, Phone } from 'lucide-angular';
import { AUDIENCE_NAV } from '@core/config/navigation';
import { SITE_INFO } from '@core/config/site-info';
import { PageHeroComponent } from '@shared/ui/page-hero/page-hero.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ContactFormValue, ContactSubject, toContactRequest } from '../models/contact-request';
import { ContactStore } from '../state/contact.store';
import { ContactFormComponent } from '../ui/contact-form.component';

@Component({
  selector: 'app-contact',
  imports: [ContactFormComponent, IconComponent, PageHeroComponent],
  providers: [ContactStore],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  /** Renseigné par le paramètre d'URL `?public=<slug>`. */
  readonly public = input<string>();
  /** `?objet=devis` ouvre le formulaire sur une demande de devis. */
  readonly objet = input<string>();
  readonly service = input<string>();

  protected readonly store = inject(ContactStore);
  protected readonly isQuote = computed(() => this.objet() === 'devis');
  protected readonly site = SITE_INFO;
  protected readonly audiences = AUDIENCE_NAV;
  protected readonly icons = { alert: CircleAlert, check: CircleCheck, pin: MapPin, phone: Phone };

  protected readonly sentSubject = signal<ContactSubject>('question');
  private readonly confirmation = viewChild<ElementRef<HTMLElement>>('confirmation');

  constructor() {
    effect(() => this.confirmation()?.nativeElement.focus());
  }

  protected onSubmitted(value: ContactFormValue): void {
    this.sentSubject.set(value.subject);
    this.store.submit(toContactRequest(value));
  }
}
