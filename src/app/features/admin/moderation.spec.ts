import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CLOCK } from '@core/data/clock';
import { SessionStore } from '@features/auth/state/session.store';
import { requireUser } from '@features/auth/auth.guard';
import { EmployerApi, SampleEmployerApi } from '@features/employer/data-access/employer.api';
import { ListingDraft } from '@features/employer/models/employer-listing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ModerationApi, SampleModerationApi } from './data-access/moderation.api';
import { ModerationListing, ModerationOrganization } from './models/moderation';
import { ModerationComponent } from './pages/moderation.component';

const DRAFT: ListingDraft = {
  type: 'APPEL_OFFRES',
  title: 'Audit du réseau',
  summary: 'Un cabinet pour auditer notre réseau informatique.',
  description: 'Objet du marché : auditer le réseau.',
  sectorId: 'informatique',
  regionId: 'niamey',
  city: 'Niamey',
  deadline: '2026-12-01',
  applyMode: 'EMAIL',
  applyEmail: 'offres@example.org',
  applyUrl: '',
  instructions: 'Envoyez votre offre.',
  budget: 1500000,
};
const EMPLOYER = {
  id: 'demo-e',
  name: 'E',
  email: 'employeur@example.org',
  role: 'EMPLOYEUR' as const,
  organization: { name: 'Org', type: 'ONG' as const, verification: 'VERIFIEE' as const },
};
const ADMIN = { id: 'demo-m', name: 'M', email: 'm@example.org', role: 'ADMIN' as const };

describe('modération', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  async function open(api?: Partial<ModerationApi>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'moderation',
            canActivate: [requireUser('ADMIN')],
            component: ModerationComponent,
          },
          { path: 'compte', children: [] },
          { path: 'connexion', children: [] },
        ]),
        api
          ? { provide: ModerationApi, useValue: api }
          : { provide: ModerationApi, useClass: SampleModerationApi },
        { provide: EmployerApi, useClass: SampleEmployerApi },
        { provide: CLOCK, useValue: () => new Date('2026-11-06T10:00:00Z') },
      ],
    });
    const session = TestBed.inject(SessionStore);
    if (!api) {
      session.open(EMPLOYER);
      await firstValueFrom(TestBed.inject(EmployerApi).save(DRAFT, null, true));
    }
    session.open(ADMIN);
    const harness = await RouterTestingHarness.create('/moderation');
    await harness.fixture.whenStable();
    const root = () => harness.routeNativeElement as HTMLElement;
    const click = async (testid: string) => {
      root().querySelector<HTMLElement>(`[data-testid=${testid}]`)!.click();
      await harness.fixture.whenStable();
    };
    return { harness, root, click };
  }
  const myListings = async () => {
    TestBed.inject(SessionStore).open(EMPLOYER);
    return firstValueFrom(TestBed.inject(EmployerApi).list());
  };

  it('présente une annonce en attente avec tout ce qu’il faut pour décider', async () => {
    const { root } = await open();
    const item = root().querySelector('[data-testid=pending-item]')?.textContent;
    expect(item).toContain('Audit du réseau');
    expect(item).toContain('employeur@example.org');
    expect(item).toContain('Informatique et numérique');
    expect(item).toContain('offres@example.org');
    expect(root().querySelector('h2')?.textContent).toContain('(1)');
  });

  it('publie : l’annonce quitte la file et change de statut chez l’employeur', async () => {
    const { root, click } = await open();
    await click('publish');
    expect(root().querySelector('[data-testid=moderation-status]')?.textContent).toContain(
      'publiée',
    );
    expect(root().querySelector('[data-testid=pending-empty]')).not.toBeNull();
    expect(root().querySelector('[data-testid=published-item]')?.textContent).toContain('Audit');
    expect((await myListings())[0].status).toBe('PUBLIEE');
  });

  it('exige un motif pour refuser, puis le transmet à l’employeur', async () => {
    const { harness, root, click } = await open();
    await click('reject');
    await click('reason-confirm');
    expect(root().querySelector('.form-field__error')?.textContent).toContain('Expliquez');
    expect(root().querySelector('[data-testid=pending-item]')).not.toBeNull();

    const reason = root().querySelector<HTMLTextAreaElement>('[data-testid=reason-form] textarea')!;
    reason.value = 'Le budget ne correspond pas au dossier.';
    reason.dispatchEvent(new Event('input'));
    await click('reason-confirm');
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=pending-empty]')).not.toBeNull();
    const [listing] = await myListings();
    expect(listing.status).toBe('BROUILLON');
    expect(listing.moderationNote).toBe('Le budget ne correspond pas au dossier.');
  });

  it('permet d’annuler un refus sans rien changer', async () => {
    const { root, click, harness } = await open();
    await click('reject');
    [...root().querySelectorAll<HTMLButtonElement>('[data-testid=reason-form] button')][1].click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=reason-form]')).toBeNull();
    expect((await myListings())[0].status).toBe('EN_ATTENTE');
  });

  it('dit quand une action échoue et que la liste a changé', async () => {
    const { root, click } = await open({
      listings: (status) => (status === 'EN_ATTENTE' ? pendingOne() : of([])),
      organizations: () => of([]),
      publish: () => throwError(() => new Error('conflit')),
      documentUrl: () => null,
    });
    await click('publish');
    expect(root().querySelector('[data-testid=moderation-failed]')).not.toBeNull();
  });

  it('ne propose pas de lien vers un justificatif absent', async () => {
    const organization = (documentName?: string): ModerationOrganization => ({
      id: documentName ?? 'sans',
      name: documentName ?? 'Sans fichier',
      type: 'ONG',
      verification: 'EN_ATTENTE',
      documentName,
      createdAt: '2026-11-06T10:00:00Z',
    });
    const { root } = await open({
      listings: () => of([]),
      organizations: () => of([organization(), organization('statuts.pdf')]),
      documentUrl: (id) => `/doc/${id}`,
    });
    const links = root().querySelectorAll('[data-testid=organization-document]');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('statuts.pdf');
    expect(root().textContent).toContain('Aucun justificatif déposé.');
    expect(root().textContent).not.toContain('Contact :');
  });

  it('signale une file impossible à charger', async () => {
    const failing = () => throwError(() => new Error('réseau'));
    const { root } = await open({
      listings: failing,
      organizations: failing,
      documentUrl: () => null,
    });
    expect(root().querySelector('[data-testid=moderation-load-failed]')).not.toBeNull();
  });
});

describe('modération : accès', () => {
  afterEach(() => localStorage.clear());

  it('n’ouvre pas la page à un employeur', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'moderation',
            canActivate: [requireUser('ADMIN')],
            component: ModerationComponent,
          },
          { path: 'compte', children: [] },
        ]),
        { provide: ModerationApi, useClass: SampleModerationApi },
      ],
    });
    TestBed.inject(SessionStore).open(EMPLOYER);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/moderation');
    expect(harness.routeNativeElement?.querySelector('h1')).toBeFalsy();
  });
});

function pendingOne() {
  return of([
    {
      id: 'a',
      slug: 'a',
      universe: 'MARCHE',
      type: 'AMI',
      title: 'T',
      summary: 'S',
      description: 'D',
      organization: { id: 'o', name: 'O', verification: 'EN_ATTENTE' },
      sectorId: 'eau',
      regionId: 'niamey',
      city: 'Niamey',
      deadline: '2026-12-01T12:00:00Z',
      applyMode: 'EMAIL',
      instructions: 'I',
      status: 'EN_ATTENTE',
      updatedAt: '2026-11-06T10:00:00Z',
    } as ModerationListing,
  ]);
}
