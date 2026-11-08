import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CLOCK } from '@core/data/clock';
import { deadlineLabel, isExpired, isUrgent } from '../models/deadline';

@Component({
  selector: 'app-deadline-badge',
  template: `<span
    class="badge"
    data-testid="deadline"
    [class.badge--urgent]="urgent()"
    [class.badge--muted]="expired()"
    >{{ label() }}</span
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeadlineBadgeComponent {
  private readonly now = inject(CLOCK);

  readonly deadline = input.required<string>();

  protected readonly label = computed(() => deadlineLabel(this.deadline(), this.now()));
  protected readonly urgent = computed(() => isUrgent(this.deadline(), this.now()));
  protected readonly expired = computed(() => isExpired(this.deadline(), this.now()));
}
