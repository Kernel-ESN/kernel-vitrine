import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BellPlus, X } from 'lucide-angular';
import { map, tap } from 'rxjs';
import { IconComponent } from '@shared/ui/icon/icon.component';
import {
  EDUCATION_LEVELS,
  labelOf,
  ORGANIZATION_TYPES,
  REGIONS,
  SECTORS,
  TYPE_LABELS,
  Universe,
  universeInfo,
} from '../models/listing';
import {
  EMPTY_QUERY,
  ListingQuery,
  ListingSort,
  parseQuery,
  toQueryParams,
} from '../models/listing-query';
import { LISTINGS_TEXT } from '../listings.text';
import { ListingSearchStore } from '../state/listing-search.store';
import { SavedListingsStore } from '../state/saved-listings.store';
import { ListingCardComponent } from '../ui/listing-card.component';
import { FilterPatch, ListingFiltersComponent } from '../ui/listing-filters.component';
import { ListingSearchInput, SearchBoxComponent } from '../ui/search-box.component';

@Component({
  selector: 'app-listing-list',
  imports: [
    IconComponent,
    ListingCardComponent,
    ListingFiltersComponent,
    RouterLink,
    SearchBoxComponent,
  ],
  providers: [ListingSearchStore],
  templateUrl: './listing-list.component.html',
  styleUrl: './listing-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly universe = this.route.snapshot.data['universe'] as Universe | undefined;

  protected readonly store = inject(ListingSearchStore);
  protected readonly text = LISTINGS_TEXT;
  protected readonly icons = { alert: BellPlus, remove: X };
  protected readonly skeletons = [1, 2, 3, 4];

  /** L'URL est la seule source de vérité : une recherche se partage par son lien. */
  protected readonly query = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => parseQuery(params, this.universe)),
      tap((query) => this.store.load(query)),
    ),
    { requireSync: true },
  );

  protected readonly title = computed(() => {
    if (this.universe) {
      return universeInfo(this.universe).label;
    }
    const text = this.query().text;
    return text ? this.text.search.resultsFor(text) : this.text.search.allTitle;
  });

  protected readonly alertParams = computed(() => {
    const query = this.query();
    return {
      ...toQueryParams({ ...query, page: 1, sort: query.text ? 'pertinence' : 'recent' }),
      ...(this.universe ? { univers: this.universe } : {}),
    };
  });

  protected readonly chips = computed(() => {
    const query = this.query();
    const f = this.text.filters;
    const chips: { field: keyof FilterPatch; value: string; label: string }[] = [];
    const add = (field: keyof FilterPatch, value: string, label: string) =>
      chips.push({ field, value, label });
    query.type.forEach((value) => add('type', value, TYPE_LABELS[value]));
    query.sector.forEach((value) => add('sector', value, labelOf(SECTORS, value)));
    query.region.forEach((value) => add('region', value, labelOf(REGIONS, value)));
    query.organizationType.forEach((value) =>
      add('organizationType', value, labelOf(ORGANIZATION_TYPES, value)),
    );
    query.education.forEach((value) => add('education', value, labelOf(EDUCATION_LEVELS, value)));
    if (query.since) {
      const labels = { '1': f.since1, '7': f.since7, '30': f.since30 };
      add('since', query.since, labels[query.since]);
    }
    if (query.within) {
      add('within', query.within, query.within === '7' ? f.within7 : f.within30);
    }
    return chips;
  });

  /** La liste de la barre de recherche ne montre qu'une région à la fois. */
  protected readonly searchRegion = computed(() => {
    const { region } = this.query();
    return region.length === 1 ? region[0] : '';
  });

  protected readonly hasMore = computed(() => {
    const page = this.store.page();
    return page !== null && page.items.length < page.total;
  });

  constructor() {
    inject(SavedListingsStore).refresh();
  }

  protected search({ text, region }: ListingSearchInput): void {
    const query = this.query();
    // « Tout le Niger » ne doit pas effacer plusieurs régions cochées dans les filtres.
    const regions = region ? [region] : query.region.length > 1 ? query.region : [];
    this.go({ ...query, text, region: regions, sort: text ? 'pertinence' : 'recent', page: 1 });
  }

  protected applyFilters(patch: FilterPatch): void {
    this.go({ ...this.query(), ...patch, page: 1 });
  }

  protected removeFilter(field: keyof FilterPatch, value: string): void {
    const current = this.query()[field];
    this.applyFilters({
      [field]: Array.isArray(current) ? current.filter((item) => item !== value) : '',
    });
  }

  protected clearFilters(): void {
    const { text, sort } = this.query();
    this.go({ ...EMPTY_QUERY, universe: this.universe, text, sort });
  }

  protected sort(event: Event): void {
    this.go({
      ...this.query(),
      sort: (event.target as HTMLSelectElement).value as ListingSort,
      page: 1,
    });
  }

  protected more(): void {
    this.go({ ...this.query(), page: this.query().page + 1 }, true);
  }

  private go(query: ListingQuery, replaceUrl = false): void {
    // Changer un filtre ne doit pas renvoyer la personne en haut de la page.
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toQueryParams(query),
      replaceUrl,
      scroll: 'manual',
    });
  }
}
