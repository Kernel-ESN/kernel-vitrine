import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BellPlus, CircleUser, Trash2 } from 'lucide-angular';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { EmptyStateComponent } from '@shared/ui/workspace/empty-state.component';
import { PanelComponent } from '@shared/ui/workspace/panel.component';
import { WorkspaceComponent } from '@shared/ui/workspace/workspace.component';
import { AlertsApi } from '../data-access/alerts.api';
import { Alert, describeCriteria, FREQUENCY_LABELS } from '../models/alert';
import { ALERTS_TEXT } from '../alerts.text';

@Component({
  selector: 'app-alerts-list',
  imports: [EmptyStateComponent, IconComponent, PanelComponent, RouterLink, WorkspaceComponent],
  templateUrl: './alerts-list.component.html',
  styleUrl: './alerts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsListComponent {
  private readonly api = inject(AlertsApi);

  protected readonly text = ALERTS_TEXT;
  protected readonly icons = { add: BellPlus, account: CircleUser, remove: Trash2 };
  protected readonly frequency = FREQUENCY_LABELS;
  protected readonly describe = describeCriteria;
  protected readonly alerts = signal<readonly Alert[]>([]);
  protected readonly failed = signal(false);
  protected readonly justCreated =
    inject(ActivatedRoute).snapshot.queryParamMap.get('creee') === '1';

  constructor() {
    this.refresh();
  }

  protected remove(id: string): void {
    this.api.remove(id).subscribe(() => this.refresh());
  }

  private refresh(): void {
    this.api.list().subscribe({
      next: (alerts) => {
        this.alerts.set(alerts);
        this.failed.set(false);
      },
      error: () => this.failed.set(true),
    });
  }
}
