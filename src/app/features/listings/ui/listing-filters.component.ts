import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SlidersHorizontal, X } from 'lucide-angular';
import { IconComponent } from '@shared/ui/icon/icon.component';
import {
  EDUCATION_LEVELS,
  ListingFacets,
  ORGANIZATION_TYPES,
  REGIONS,
  SECTORS,
  TYPE_LABELS,
  UNIVERSES,
} from '../models/listing';
import { activeFilterCount, ListingQuery } from '../models/listing-query';
import { LISTINGS_TEXT } from '../listings.text';

export type FilterPatch = Partial<
  Pick<
    ListingQuery,
    'type' | 'sector' | 'region' | 'education' | 'organizationType' | 'within' | 'since'
  >
>;

type MultiKey = 'type' | 'sector' | 'region' | 'education' | 'organizationType';
type SingleKey = 'within' | 'since';

interface FilterOption {
  readonly id: string;
  readonly label: string;
  readonly count: number | null;
  readonly checked: boolean;
}

interface FilterGroup {
  readonly key: MultiKey | SingleKey;
  readonly label: string;
  readonly single: boolean;
  readonly options: readonly FilterOption[];
  /** Options repliées derrière « Voir plus ». */
  readonly hidden: number;
  readonly expandable: boolean;
}

/** Au-delà, une liste se replie : les filtres ne doivent pas repousser les résultats. */
const VISIBLE_OPTIONS = 6;
const WIDE_SCREEN = 992;

@Component({
  selector: 'app-listing-filters',
  imports: [IconComponent],
  templateUrl: './listing-filters.component.html',
  styleUrl: './listing-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'closeOnWideScreen()' },
})
export class ListingFiltersComponent {
  readonly query = input.required<ListingQuery>();
  readonly facets = input<ListingFacets | null>(null);
  /** Nombre de résultats, repris sur le bouton qui referme le panneau sur téléphone. */
  readonly total = input(0);
  readonly changed = output<FilterPatch>();
  readonly cleared = output<void>();

  private readonly panel = viewChild.required<ElementRef<HTMLDialogElement>>('panel');

  protected readonly text = LISTINGS_TEXT.filters;
  protected readonly icons = { open: SlidersHorizontal, close: X };
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly count = computed(() => activeFilterCount(this.query()));

  protected readonly groups = computed((): readonly FilterGroup[] => {
    const query = this.query();
    const universes = query.universe
      ? UNIVERSES.filter((universe) => universe.id === query.universe)
      : UNIVERSES;
    const types = universes
      .flatMap((universe) => universe.types)
      .map((id) => ({ id, label: TYPE_LABELS[id] }));
    const text = this.text;
    return [
      this.multi('type', text.type, types),
      this.multi('sector', text.sector, SECTORS),
      this.multi('region', text.region, REGIONS),
      this.multi('organizationType', text.organizationType, ORGANIZATION_TYPES),
      ...(query.universe === 'MARCHE'
        ? []
        : [this.multi('education', text.education, EDUCATION_LEVELS)]),
      this.single('since', text.since, text.anySince, [
        { id: '1', label: text.since1 },
        { id: '7', label: text.since7 },
        { id: '30', label: text.since30 },
      ]),
      this.single('within', text.deadline, text.anyDeadline, [
        { id: '7', label: text.within7 },
        { id: '30', label: text.within30 },
      ]),
    ];
  });

  protected show(): void {
    this.panel().nativeElement.showModal();
  }

  protected hide(): void {
    this.panel().nativeElement.close();
  }

  protected closeOnWideScreen(): void {
    const panel = this.panel().nativeElement;
    if (panel.open && window.innerWidth >= WIDE_SCREEN) {
      panel.close();
    }
  }

  protected toggle(group: FilterGroup, id: string, checked: boolean): void {
    if (group.single) {
      this.changed.emit({ [group.key]: id });
      return;
    }
    const current = this.query()[group.key as MultiKey] as readonly string[];
    const next = checked ? [...current, id] : current.filter((value) => value !== id);
    this.changed.emit({ [group.key]: next });
  }

  protected toggleGroup(key: string): void {
    this.expanded.update((open) => {
      const next = new Set(open);
      if (!next.delete(key)) {
        next.add(key);
      }
      return next;
    });
  }

  /** Une valeur sans annonce disparaît, sauf si elle est cochée : on doit pouvoir la retirer. */
  private multi(
    key: MultiKey,
    label: string,
    options: readonly { readonly id: string; readonly label: string }[],
  ): FilterGroup {
    const selected = this.query()[key] as readonly string[];
    const counts = this.facets()?.[key];
    const available = options
      .map((option) => ({
        ...option,
        count: counts ? (counts[option.id] ?? 0) : null,
        checked: selected.includes(option.id),
      }))
      .filter((option) => option.checked || option.count !== 0);
    const ordered = counts
      ? [...available].sort(
          (a, b) => Number(b.checked) - Number(a.checked) || (b.count ?? 0) - (a.count ?? 0),
        )
      : available;
    const open = this.expanded().has(key);
    const shown = open ? ordered : ordered.slice(0, VISIBLE_OPTIONS);
    return {
      key,
      label,
      single: false,
      options: shown,
      hidden: ordered.length - shown.length,
      expandable: ordered.length > VISIBLE_OPTIONS,
    };
  }

  private single(
    key: SingleKey,
    label: string,
    anyLabel: string,
    options: readonly { readonly id: string; readonly label: string }[],
  ): FilterGroup {
    const value = this.query()[key];
    const counts = this.facets()?.[key];
    return {
      key,
      label,
      single: true,
      hidden: 0,
      expandable: false,
      options: [
        { id: '', label: anyLabel, count: null, checked: !value },
        ...options.map((option) => ({
          ...option,
          count: counts ? (counts[option.id] ?? 0) : null,
          checked: option.id === value,
        })),
      ],
    };
  }
}
