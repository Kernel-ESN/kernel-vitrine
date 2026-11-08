import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

/** Pictogramme Lucide décoratif : trait de 1,5 px quelle que soit la taille (charte, section 10). */
@Component({
  selector: 'app-icon',
  imports: [LucideAngularModule],
  template: `<lucide-icon
    [img]="data()"
    [size]="size()"
    [strokeWidth]="1.5"
    [absoluteStrokeWidth]="true"
  />`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
    lucide-icon {
      display: inline-flex;
    }
  `,
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly data = input.required<LucideIconData>();
  readonly size = input(24);
}
