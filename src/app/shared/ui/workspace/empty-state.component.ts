import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideIconData } from 'lucide-angular';
import { IconComponent } from '@shared/ui/icon/icon.component';

/** Liste vide : une icône, une phrase, et l'action utile projetée en contenu. */
@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  template: `<div class="empty">
    @if (icon(); as data) {
      <app-icon class="empty__icon" [data]="data" [size]="24" />
    }
    <p>{{ message() }}</p>
    <ng-content />
  </div>`,
  styles: `
    :host {
      display: block;
    }
    .empty {
      display: grid;
      justify-items: start;
      gap: var(--space-2);
      padding: var(--space-6);
      border-radius: var(--radius);
      background: var(--color-mist);
      color: var(--color-slate);
    }
    .empty__icon {
      color: var(--color-deep);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly message = input.required<string>();
  readonly icon = input<LucideIconData>();
}
