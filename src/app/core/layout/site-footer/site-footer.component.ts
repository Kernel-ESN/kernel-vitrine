import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, MapPin, Phone } from 'lucide-angular';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { AUDIENCE_NAV, EXPERTISE_NAV, OFFER_NAV } from '../../config/navigation';
import { SITE_INFO } from '../../config/site-info';

@Component({
  selector: 'app-site-footer',
  imports: [IconComponent, LogoComponent, RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  protected readonly site = SITE_INFO;
  protected readonly expertises = EXPERTISE_NAV;
  protected readonly audiences = AUDIENCE_NAV;
  protected readonly offers = OFFER_NAV.filter((offer) => offer.featured).slice(0, 4);
  protected readonly icons = { pin: MapPin, phone: Phone, arrow: ArrowRight };
  protected readonly year = new Date().getFullYear();
}
