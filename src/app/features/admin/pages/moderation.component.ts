import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDay, formatMoney } from '@features/listings/models/deadline';
import { labelOf, REGIONS, SECTORS, TYPE_LABELS } from '@features/listings/models/listing';
import { forkJoin, Observable } from 'rxjs';
import { ModerationApi } from '../data-access/moderation.api';
import { ModerationListing, ModerationOrganization } from '../models/moderation';
import { MODERATION_TEXT } from '../moderation.text';
import { ReasonFormComponent } from '../ui/reason-form.component';

interface Refusal {
  readonly kind: 'reject' | 'withdraw' | 'organization';
  readonly id: string;
}

@Component({
  selector: 'app-moderation',
  imports: [ReasonFormComponent, RouterLink],
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerationComponent {
  private readonly api = inject(ModerationApi);

  protected readonly text = MODERATION_TEXT;
  protected readonly types = TYPE_LABELS;
  protected readonly day = formatDay;
  protected readonly pending = signal<readonly ModerationListing[]>([]);
  protected readonly published = signal<readonly ModerationListing[]>([]);
  protected readonly organizations = signal<readonly ModerationOrganization[]>([]);
  protected readonly loadFailed = signal(false);
  protected readonly status = signal('');
  protected readonly actionFailed = signal(false);
  /** Élément dont le formulaire de motif est ouvert. */
  protected readonly refusal = signal<Refusal | null>(null);

  constructor() {
    this.refresh();
  }

  protected place(item: ModerationListing): string {
    return `${item.city}, ${labelOf(REGIONS, item.regionId)}`;
  }

  protected sector(item: ModerationListing): string {
    return labelOf(SECTORS, item.sectorId);
  }

  protected money(amount: number): string {
    return formatMoney(amount, 'FCFA');
  }

  protected documentUrl(organization: ModerationOrganization): string | null {
    return organization.documentName ? this.api.documentUrl(organization.id) : null;
  }

  protected contact(organization: ModerationOrganization): string {
    return [organization.contactEmail, organization.contactPhone].filter(Boolean).join(', ');
  }

  protected isRefusing(kind: Refusal['kind'], id: string): boolean {
    const refusal = this.refusal();
    return refusal?.kind === kind && refusal.id === id;
  }

  protected publish(id: string): void {
    this.run(this.api.publish(id), this.text.published);
  }

  protected verify(id: string): void {
    this.run(this.api.verify(id), this.text.verified);
  }

  protected confirmRefusal(reason: string): void {
    const refusal = this.refusal();
    if (!refusal) {
      return;
    }
    const { kind, id } = refusal;
    if (kind === 'reject') {
      this.run(this.api.reject(id, reason), this.text.rejected);
    } else if (kind === 'withdraw') {
      this.run(this.api.withdraw(id, reason), this.text.withdrawn);
    } else {
      this.run(this.api.rejectOrganization(id, reason), this.text.organizationRejected);
    }
  }

  protected refresh(): void {
    forkJoin({
      pending: this.api.listings('EN_ATTENTE'),
      published: this.api.listings('PUBLIEE'),
      organizations: this.api.organizations(),
    }).subscribe({
      next: ({ pending, published, organizations }) => {
        this.pending.set(pending);
        this.published.set(published);
        this.organizations.set(organizations);
        this.loadFailed.set(false);
      },
      error: () => this.loadFailed.set(true),
    });
  }

  private run(action: Observable<unknown>, done: string): void {
    this.actionFailed.set(false);
    action.subscribe({
      next: () => {
        this.status.set(done);
        this.refusal.set(null);
        this.refresh();
      },
      error: () => {
        this.status.set('');
        this.actionFailed.set(true);
        this.refusal.set(null);
        this.refresh();
      },
    });
  }
}
