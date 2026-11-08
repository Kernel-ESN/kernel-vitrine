import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CLOCK } from '@core/data/clock';
import { throwError } from 'rxjs';
import { ListingsApi } from '../data-access/listings.api';
import { SampleListingsApi } from '../data-access/sample-listings.api';
import { SampleSavedListingsApi, SavedListingsApi } from '../data-access/saved-listings.api';
import { buildSampleListings } from '../data-access/sample-listings.data';
import { runOrganizations } from '../models/listing-query';
import { organizationResolver } from '../state/organization.resolver';
import { SavedListingsStore } from '../state/saved-listings.store';
import { OrganizationDetailComponent } from './organization-detail.component';
import { OrganizationListComponent } from './organization-list.component';

const NOW = new Date('2026-11-06T10:00:00Z');
const ORGANIZATIONS = runOrganizations(buildSampleListings(NOW), NOW);

describe('pages des organisations', () => {
  async function open(url: string, api?: Partial<ListingsApi>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'organisations', component: OrganizationListComponent },
            {
              path: 'organisations/:slug',
              resolve: { detail: organizationResolver },
              component: OrganizationDetailComponent,
            },
          ],
          withComponentInputBinding(),
        ),
        api
          ? { provide: ListingsApi, useValue: api }
          : { provide: ListingsApi, useClass: SampleListingsApi },
        { provide: SavedListingsApi, useClass: SampleSavedListingsApi },
        SavedListingsStore,
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    return { harness, root: harness.routeNativeElement as HTMLElement };
  }

  it('liste les organisations avec leurs annonces ouvertes', async () => {
    const { root } = await open('/organisations');
    const tiles = root.querySelectorAll('[data-testid=organization-tile]');
    expect(tiles.length).toBe(ORGANIZATIONS.filter((item) => item.openListings > 0).length);
    expect(tiles[0].textContent).toContain(ORGANIZATIONS[0].name);
    expect(tiles[0].querySelector('a')?.getAttribute('href')).toBe(
      `/organisations/${ORGANIZATIONS[0].slug}`,
    );
  });

  it('filtre par nom, sans tenir compte des accents', async () => {
    const { harness, root } = await open('/organisations');
    const input = root.querySelector<HTMLInputElement>('[data-testid=organization-filter]')!;
    input.value = 'cooperative';
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
    const tiles = root.querySelectorAll('[data-testid=organization-tile]');
    expect(tiles.length).toBe(1);
    expect(tiles[0].textContent).toContain('Coopérative');
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
    expect(root.querySelector('[data-testid=organizations-empty]')).not.toBeNull();
  });

  it('signale un annuaire impossible à charger', async () => {
    const { root } = await open('/organisations', {
      organizations: () => throwError(() => new Error('réseau')),
    });
    expect(root.querySelector('[data-testid=organizations-error]')).not.toBeNull();
  });

  it('présente une organisation et toutes ses annonces ouvertes', async () => {
    const organization = ORGANIZATIONS[0];
    const { root } = await open(`/organisations/${organization.slug}`);
    expect(root.querySelector('[data-testid=organization-name]')?.textContent?.trim()).toBe(
      organization.name,
    );
    expect(root.querySelectorAll('[data-testid=listing-card]').length).toBe(
      organization.openListings,
    );
  });

  it('dit quand une organisation n’existe pas', async () => {
    const { root } = await open('/organisations/inconnue');
    expect(root.querySelector('[data-testid=organization-missing]')).not.toBeNull();
  });

  it('signale une erreur de chargement', async () => {
    const { root } = await open('/organisations/x', {
      organization: () => throwError(() => new Error('réseau')),
    });
    expect(root.querySelector('[data-testid=organization-error]')).not.toBeNull();
  });
});
