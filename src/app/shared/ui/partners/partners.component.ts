import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PARTNERS } from '@core/config/partners';
import { RevealDirective } from '../reveal/reveal.directive';

@Component({
  selector: 'app-partners',
  imports: [RevealDirective],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnersComponent {
  protected readonly partners = PARTNERS;
}
