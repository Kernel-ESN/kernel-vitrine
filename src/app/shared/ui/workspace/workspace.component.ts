import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { initialsOf } from '@shared/text/initials';
import { ScrollSpyDirective } from '@shared/ui/toc/scroll-spy.directive';
import { TocComponent, TocItem } from '@shared/ui/toc/toc.component';

/**
 * Cadre commun des espaces personnels (compte, employeur, alertes) : un bandeau d'identité,
 * un sommaire qui suit la lecture, et la colonne de panneaux. Chaque page fournit son contenu
 * par projection :
 * - `[workspaceStatus]` sous l'identité ;
 * - `[workspaceActions]` à droite du bandeau ;
 * - `[workspaceAside]` sous le sommaire ;
 * - le reste dans la colonne principale.
 */
@Component({
  selector: 'app-workspace',
  imports: [ScrollSpyDirective, TocComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent {
  readonly eyebrow = input.required<string>();
  readonly heading = input.required<string>();
  readonly subtitle = input<string>();
  /** Nom dont les initiales s'affichent au-dessus du titre ; aucune marque sans lui. */
  readonly mark = input<string>();
  /** Identifiant de test du titre, pour les parcours existants. */
  readonly headingTestId = input<string>();
  readonly sections = input<readonly TocItem[]>([]);
  readonly tocLabel = input('Sur cette page');

  protected readonly initials = computed(() => {
    const mark = this.mark();
    return mark ? initialsOf(mark) : '';
  });
}
