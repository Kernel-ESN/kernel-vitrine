import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ArrowRight, Briefcase, FileText, GraduationCap, LucideIconData } from 'lucide-angular';
import { catchError, map, of } from 'rxjs';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ListingsApi } from '../data-access/listings.api';
import {
  Listing,
  ListingFacets,
  Option,
  REGIONS,
  SECTORS,
  Universe,
  UNIVERSES,
} from '../models/listing';
import { EMPTY_QUERY } from '../models/listing-query';
import { LISTINGS_TEXT } from '../listings.text';
import { ListingCardComponent } from '../ui/listing-card.component';
import { OrgMarkComponent } from '../ui/org-mark.component';
import { ListingSearchInput, SearchBoxComponent } from '../ui/search-box.component';
import { SavedListingsStore } from '../state/saved-listings.store';

const HOME_LIMIT = 4;
const BROWSE_LIMIT = 8;
const ORGANIZATION_LIMIT = 6;

function browse(
  options: readonly Option[],
  counts: Readonly<Record<string, number>> | undefined,
): readonly (Option & { readonly count: number })[] {
  return options
    .map((option) => ({ ...option, count: counts?.[option.id] ?? 0 }))
    .filter((option) => option.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, BROWSE_LIMIT);
}

@Component({
  selector: 'app-platform-home',
  imports: [IconComponent, ListingCardComponent, OrgMarkComponent, RouterLink, SearchBoxComponent],
  templateUrl: './platform-home.component.html',
  styleUrl: './platform-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformHomeComponent {
  private readonly api = inject(ListingsApi);
  private readonly router = inject(Router);

  protected readonly text = LISTINGS_TEXT.home;
  protected readonly listText = LISTINGS_TEXT.list;
  protected readonly organizationText = LISTINGS_TEXT.organizations;
  protected readonly arrow = ArrowRight;
  protected readonly counts = toSignal(this.api.counts().pipe(catchError(() => of(null))), {
    initialValue: null,
  });
  private readonly facets = toSignal(
    this.api.facets(EMPTY_QUERY).pipe(catchError(() => of<ListingFacets | null>(null))),
    { initialValue: null },
  );
  /** Les entrées les plus fournies : un lien qui mène à une liste vide n'aide personne. */
  protected readonly sectors = computed(() => browse(SECTORS, this.facets()?.sector));
  protected readonly regions = computed(() => browse(REGIONS, this.facets()?.region));
  protected readonly organizations = toSignal(
    this.api.organizations().pipe(
      map((items) => items.slice(0, ORGANIZATION_LIMIT)),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );
  protected readonly recent = this.latest('recent');
  protected readonly closing = this.latest('expire');

  private readonly blurbs: Readonly<Record<Universe, string>> = {
    EMPLOI: this.text.jobsBlurb,
    MARCHE: this.text.marketsBlurb,
    AUTRE: this.text.othersBlurb,
  };
  private readonly icons: Readonly<Record<Universe, LucideIconData>> = {
    EMPLOI: Briefcase,
    MARCHE: FileText,
    AUTRE: GraduationCap,
  };
  protected readonly entries = UNIVERSES.map((universe) => ({
    ...universe,
    blurb: this.blurbs[universe.id],
    icon: this.icons[universe.id],
  }));

  constructor() {
    inject(SavedListingsStore).refresh();
  }

  protected search({ text, region }: ListingSearchInput): void {
    void this.router.navigate(['/annonces/recherche'], {
      queryParams: { ...(text ? { q: text } : {}), ...(region ? { region } : {}) },
    });
  }

  private latest(sort: 'recent' | 'expire') {
    return toSignal(
      this.api.search({ ...EMPTY_QUERY, sort }).pipe(
        map((page): readonly Listing[] => page.items.slice(0, HOME_LIMIT)),
        catchError(() => of<readonly Listing[]>([])),
      ),
      { initialValue: [] as readonly Listing[] },
    );
  }
}
