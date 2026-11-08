import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { initialsOf } from '@shared/text/initials';

@Component({
  selector: 'app-org-mark',
  template: `<span class="mark" [class.mark--large]="size() === 'large'" aria-hidden="true">{{
    initials()
  }}</span>`,
  styles: `
    :host {
      display: block;
      flex: none;
    }
    .mark {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border: var(--rule);
      border-radius: var(--radius);
      background: var(--color-white);
      color: var(--color-deep);
      font-family: var(--font-mono);
      font-size: var(--text-small);
      font-weight: 500;
    }
    .mark--large {
      width: 4.5rem;
      height: 4.5rem;
      font-size: var(--text-h3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgMarkComponent {
  readonly name = input.required<string>();
  readonly size = input<'normal' | 'large'>('normal');
  protected readonly initials = computed(() => initialsOf(this.name()));
}
