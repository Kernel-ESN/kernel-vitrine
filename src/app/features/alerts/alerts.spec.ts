import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { CLOCK } from '@core/data/clock';
import { SessionStore } from '@features/auth/state/session.store';
import { AlertsApi, SampleAlertsApi } from './data-access/alerts.api';
import { criteriaFromParams, describeCriteria } from './models/alert';
import { AlertNewComponent } from './pages/alert-new.component';
import { AlertsListComponent } from './pages/alerts-list.component';

describe('critères', () => {
  it('reprend ceux de la recherche et ignore les valeurs inconnues', () => {
    expect(
      criteriaFromParams({ univers: 'MARCHE', secteur: 'informatique', region: 'x', q: 'ao' }),
    ).toEqual({
      universe: 'MARCHE',
      type: undefined,
      sectorId: 'informatique',
      regionId: undefined,
      keywords: 'ao',
    });
  });

  it('se lit en français', () => {
    expect(describeCriteria({ universe: 'MARCHE', sectorId: 'informatique' })).toBe(
      'Marchés et projets · Informatique et numérique · Tout le Niger',
    );
  });
});

describe('écrans des alertes', () => {
  beforeEach(() => localStorage.clear());

  async function open(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'alertes', component: AlertsListComponent },
          { path: 'alertes/nouvelle', component: AlertNewComponent },
        ]),
        { provide: AlertsApi, useClass: SampleAlertsApi },
        { provide: CLOCK, useValue: () => new Date('2026-11-06T10:00:00Z') },
      ],
    });
    TestBed.inject(SessionStore).open({
      id: 'u',
      name: 'Awa',
      email: 'awa@example.org',
      role: 'CANDIDAT',
    });
    const harness = await RouterTestingHarness.create(url);
    return { harness, root: () => harness.routeNativeElement as HTMLElement };
  }

  it('crée une alerte depuis une recherche, la liste, puis la supprime (parcours A)', async () => {
    const { harness, root } = await open('/alertes/nouvelle?univers=MARCHE&secteur=informatique');
    expect(root().querySelector('[data-testid=alert-criteria]')?.textContent).toContain(
      'Informatique et numérique',
    );
    expect(root().querySelector<HTMLInputElement>('#alert-email')?.value).toBe('awa@example.org');
    expect(root().querySelector<HTMLInputElement>('#alert-email')?.readOnly).toBe(true);
    root().querySelector<HTMLButtonElement>('[data-testid=alert-submit]')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/alertes?creee=1');
    expect(root().querySelector('[data-testid=alert-created]')).not.toBeNull();
    expect(root().querySelector('[data-testid=alerts-list]')?.textContent).toContain(
      'awa@example.org',
    );

    root().querySelector<HTMLButtonElement>('[data-testid=alert-remove]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=alerts-empty]')).not.toBeNull();
    expect(await firstValueFrom(TestBed.inject(AlertsApi).list())).toHaveLength(0);
  });

  it('dit clairement que WhatsApp n’est pas encore disponible', async () => {
    const { root } = await open('/alertes/nouvelle');
    const off = root().querySelector<HTMLInputElement>('.choice--off input');
    expect(off?.disabled).toBe(true);
    expect(root().querySelector('.choice--off')?.textContent).toContain('bientôt');
  });
});
