import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LogoVariant = 'default' | 'night';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.logo--night]': "variant() === 'night'" },
})
export class LogoComponent {
  readonly variant = input<LogoVariant>('default');
}
