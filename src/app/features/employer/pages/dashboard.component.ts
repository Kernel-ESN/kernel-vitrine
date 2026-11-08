import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CircleUser, CopyPlus, FilePlus2, Pencil, RotateCcw, X } from 'lucide-angular';
import { Observable } from 'rxjs';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { TocItem } from '@shared/ui/toc/toc.component';
import { EmptyStateComponent } from '@shared/ui/workspace/empty-state.component';
import { PanelComponent } from '@shared/ui/workspace/panel.component';
import { WorkspaceComponent } from '@shared/ui/workspace/workspace.component';
import { SessionStore } from '@features/auth/state/session.store';
import { TYPE_LABELS } from '@features/listings/models/listing';
import { EmployerApi } from '../data-access/employer.api';
import { EMPLOYER_TEXT } from '../employer.text';
import { OrganizationStatusComponent } from '../ui/organization-status.component';
import { canClose, canRepublish, EmployerListing, STATUS_LABELS } from '../models/employer-listing';

@Component({
  selector: 'app-employer-dashboard',
  imports: [
    EmptyStateComponent,
    IconComponent,
    OrganizationStatusComponent,
    PanelComponent,
    RouterLink,
    WorkspaceComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './employer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly api = inject(EmployerApi);

  protected readonly user = inject(SessionStore).user;
  protected readonly text = EMPLOYER_TEXT;
  protected readonly icons = {
    publish: FilePlus2,
    account: CircleUser,
    edit: Pencil,
    close: X,
    republish: RotateCcw,
    duplicate: CopyPlus,
  };
  protected readonly sections: readonly TocItem[] = [
    { id: 'annonces', label: EMPLOYER_TEXT.listingsTitle },
    { id: 'organisation', label: EMPLOYER_TEXT.organizationTitle },
  ];
  protected readonly statuses = STATUS_LABELS;
  protected readonly types = TYPE_LABELS;
  protected readonly canClose = canClose;
  protected readonly canRepublish = canRepublish;
  protected readonly items = signal<readonly EmployerListing[]>([]);
  protected readonly stats = computed(() => {
    const items = this.items();
    const count = (status: EmployerListing['status']) =>
      items.filter((item) => item.status === status).length;
    return [
      { label: EMPLOYER_TEXT.statPublished, value: count('PUBLIEE') },
      { label: EMPLOYER_TEXT.statPending, value: count('EN_ATTENTE') },
      { label: EMPLOYER_TEXT.statDrafts, value: count('BROUILLON') },
      {
        label: EMPLOYER_TEXT.statApplications,
        value: items.reduce((sum, item) => sum + item.applications, 0),
      },
    ];
  });

  constructor() {
    this.refresh();
  }

  protected close(id: string): void {
    this.run(this.api.close(id));
  }

  protected duplicate(id: string): void {
    this.run(this.api.duplicate(id));
  }

  protected republish(id: string): void {
    this.run(this.api.republish(id));
  }

  private run(action: Observable<EmployerListing>): void {
    action.subscribe(() => this.refresh());
  }

  private refresh(): void {
    if (this.user()) {
      this.api.list().subscribe((items) => this.items.set(items));
    }
  }
}
