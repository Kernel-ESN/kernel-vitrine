import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight } from 'lucide-angular';
import { AUDIENCE_NAV, EXPERTISE_NAV } from '@core/config/navigation';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { AUDIENCES } from '../../audiences/data-access/audiences.data';

interface ConsoleLine {
  readonly kind: 'command' | 'tag' | 'output';
  readonly tag?: string;
  readonly text: string;
}

/** Sélecteur « Vous êtes… » présenté comme un terminal, clin d'œil au curseur du logo. */
@Component({
  selector: 'app-audience-console',
  imports: [IconComponent, RouterLink],
  templateUrl: './audience-console.component.html',
  styleUrl: './audience-console.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudienceConsoleComponent {
  protected readonly audiences = AUDIENCE_NAV;
  protected readonly arrow = ArrowRight;
  protected readonly selected = signal(AUDIENCE_NAV[0].slug);

  protected readonly content = computed(() =>
    AUDIENCES.find((audience) => audience.slug === this.selected())!,
  );

  protected readonly lines = computed<readonly ConsoleLine[]>(() => {
    const content = this.content();
    return [
      { kind: 'command', text: `kernel diagnostic --pour=${content.slug}` },
      ...content.needs.map((need): ConsoleLine => ({ kind: 'output', text: need })),
      { kind: 'command', text: 'kernel plan' },
      ...EXPERTISE_NAV.map((expertise): ConsoleLine => ({
        kind: 'tag',
        tag: expertise.label,
        text: content.responses[expertise.key],
      })),
    ];
  });
}
