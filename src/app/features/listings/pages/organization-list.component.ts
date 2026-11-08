import { MorphStore } from '../state/morph.store';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BadgeCheck } from 'lucide-angular';
import { catchError, map, of } from 'rxjs';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ListingsApi } from '../data-access/listings.api';
import { LISTINGS_TEXT } from '../listings.text';
import { labelOf, ORGANIZATION_TYPES, PublicOrganization } from '../models/listing';
import { normalize } from '../models/listing-query';
import { OrgMarkComponent } from '../ui/org-mark.component';

type Directory =
  | { readonly status: 'loading' | 'error' }
  | { readonly status: 'ready'; readonly items: readonly PublicOrganization[] };

@Component({
  selector: 'app-organization-list',
  imports: [IconComponent, OrgMarkComponent, RouterLink],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-pages.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationListComponent {
  protected readonly morph = inject(MorphStore).active;
  protected readonly text = LISTINGS_TEXT.organizations;
  protected readonly verified = BadgeCheck;
  protected readonly filter = signal('');

  protected readonly directory = toSignal(
    inject(ListingsApi)
      .organizations()
      .pipe(
        map((items): Directory => ({ status: 'ready', items })),
        catchError(() => of<Directory>({ status: 'error' })),
      ),
    { initialValue: { status: 'loading' } as Directory },
  );

  protected readonly shown = computed(() => {
    const directory = this.directory();
    if (directory.status !== 'ready') {
      return [];
    }
    const needle = normalize(this.filter().trim());
    return directory.items.filter((item) => normalize(item.name).includes(needle));
  });

  protected typeLabel(item: PublicOrganization): string {
    return labelOf(ORGANIZATION_TYPES, item.type);
  }
}
