import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CLOCK } from '@core/data/clock';
import { SampleSavedListingsApi, SavedListingsApi } from '../data-access/saved-listings.api';
import { buildSampleListings } from '../data-access/sample-listings.data';
import { MorphStore } from '../state/morph.store';
import { SavedListingsStore } from '../state/saved-listings.store';
import { ListingCardComponent } from './listing-card.component';

const NOW = new Date('2026-11-06T10:00:00Z');
const [FIRST, SECOND] = buildSampleListings(NOW);

/** La même annonce deux fois, comme sur l'accueil des annonces. */
@Component({
  imports: [ListingCardComponent],
  template: `<app-listing-card [listing]="first" /><app-listing-card
      [listing]="first"
    /><app-listing-card [listing]="second" />`,
})
class HostComponent {
  protected readonly first = FIRST;
  protected readonly second = SECOND;
}

describe('ListingCardComponent : transition vers la fiche', () => {
  it('ne nomme que la carte cliquée, même si l’annonce figure deux fois', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: CLOCK, useValue: () => NOW },
        { provide: SavedListingsApi, useClass: SampleSavedListingsApi },
        SavedListingsStore,
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const named = () =>
      [...root.querySelectorAll<HTMLElement>('.card__title')].filter(
        (title) => title.style.viewTransitionName === 'listing-title',
      );
    expect(named()).toHaveLength(0);

    root.querySelectorAll<HTMLAnchorElement>('.card__title a')[2].click();
    await fixture.whenStable();
    expect(TestBed.inject(MorphStore).active()).toBe(SECOND.id);
    expect(named()).toHaveLength(1);
    expect(named()[0].textContent).toContain(SECOND.title);
  });
});
