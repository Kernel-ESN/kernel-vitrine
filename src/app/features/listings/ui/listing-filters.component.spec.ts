import { TestBed } from '@angular/core/testing';
import { ListingFacets } from '../models/listing';
import { EMPTY_QUERY, ListingQuery } from '../models/listing-query';
import { FilterPatch, ListingFiltersComponent } from './listing-filters.component';

const FACETS: ListingFacets = {
  type: { CDI: 4, CDD: 2 },
  sector: { eau: 9, sante: 3, finance: 2, btp: 2, mines: 1, commerce: 1, tourisme: 1, services: 1 },
  region: { niamey: 12, zinder: 1 },
  education: {},
  organizationType: { ONG: 5 },
  within: { '7': 0, '30': 6 },
  since: { '1': 1, '7': 2, '30': 6 },
};

describe('ListingFiltersComponent', () => {
  async function setup(query: ListingQuery = EMPTY_QUERY, facets: ListingFacets | null = FACETS) {
    const fixture = TestBed.createComponent(ListingFiltersComponent);
    fixture.componentRef.setInput('query', query);
    fixture.componentRef.setInput('facets', facets);
    fixture.componentRef.setInput('total', 6);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = (id: string) => root.querySelector<HTMLInputElement>(`[data-testid=facet-${id}]`);
    return { fixture, root, input };
  }

  it('ouvre une fenêtre modale sur téléphone et annonce le nombre de résultats', async () => {
    const { root } = await setup();
    const dialog = root.querySelector('dialog')!;
    const show = vi.fn();
    const close = vi.fn();
    dialog.showModal = show;
    dialog.close = close;
    root.querySelector<HTMLButtonElement>('[data-testid=filters-toggle]')!.click();
    expect(show).toHaveBeenCalled();
    const apply = root.querySelector<HTMLButtonElement>('[data-testid=filters-apply]')!;
    expect(apply.textContent).toContain('Voir 6 annonces');
    apply.click();
    expect(close).toHaveBeenCalled();
  });

  it('ne propose que les types de l’univers, et pas de niveau d’études pour un marché', async () => {
    const { input } = await setup({ ...EMPTY_QUERY, universe: 'MARCHE' }, null);
    expect(input('type-APPEL_OFFRES')).not.toBeNull();
    expect(input('type-CDI')).toBeNull();
    expect(input('education-bac')).toBeNull();
  });

  it('ajoute une valeur à celles déjà cochées, et la retire', async () => {
    const { fixture, input } = await setup({ ...EMPTY_QUERY, region: ['niamey'] });
    const seen: FilterPatch[] = [];
    fixture.componentInstance.changed.subscribe((patch) => seen.push(patch));
    input('region-zinder')!.click();
    input('region-niamey')!.click();
    expect(seen).toEqual([{ region: ['niamey', 'zinder'] }, { region: [] }]);
  });

  it('affiche les compteurs et cache les valeurs sans annonce, sauf si elles sont cochées', async () => {
    const { root, input } = await setup({ ...EMPTY_QUERY, region: ['dosso'] });
    expect(input('region-niamey')!.closest('label')?.textContent).toContain('12');
    expect(input('region-agadez')).toBeNull();
    expect(input('region-dosso')?.checked).toBe(true);
    expect(root.querySelector('[data-testid=facet-education-bac]')).toBeNull();
  });

  it('replie une longue liste, les plus fournies d’abord, et la déplie', async () => {
    const { fixture, root, input } = await setup();
    expect(input('sector-eau')).not.toBeNull();
    expect(input('sector-services')).toBeNull();
    const more = root.querySelector<HTMLButtonElement>('[data-testid=facet-more-sector]')!;
    expect(more.textContent).toContain('Voir 2 de plus');
    more.click();
    await fixture.whenStable();
    expect(input('sector-services')).not.toBeNull();
    expect(more.textContent).toContain('Voir moins');
  });

  it('propose une seule durée à la fois, et désactive celle qui ne donne rien', async () => {
    const { fixture, input } = await setup();
    const seen: FilterPatch[] = [];
    fixture.componentInstance.changed.subscribe((patch) => seen.push(patch));
    expect(input('within-7')?.disabled).toBe(true);
    expect(input('since-any')?.checked).toBe(true);
    input('since-7')!.click();
    expect(seen).toEqual([{ since: '7' }]);
  });

  it('reste utilisable sans compteurs', async () => {
    const { input, root } = await setup(EMPTY_QUERY, null);
    expect(input('region-agadez')).not.toBeNull();
    expect(root.querySelector('.option__count')).toBeNull();
  });

  it('compte les filtres actifs et propose de les effacer', async () => {
    const { root } = await setup({ ...EMPTY_QUERY, sector: ['eau', 'sante'], region: ['dosso'] });
    expect(root.querySelector('[data-testid=filters-count]')?.textContent).toBe('3');
    expect(root.querySelector('[data-testid=clear-filters]')).not.toBeNull();
  });
});
