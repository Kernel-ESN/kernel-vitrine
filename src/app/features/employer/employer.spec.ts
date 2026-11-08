import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CLOCK } from '@core/data/clock';
import { AuthApi, SampleAuthApi } from '@features/auth/data-access/auth.api';
import { SessionStore } from '@features/auth/state/session.store';
import { EmployerApi, SampleEmployerApi } from './data-access/employer.api';
import { DashboardComponent } from './pages/dashboard.component';
import { futureDate } from './pages/listing-form';
import { PublishComponent } from './pages/publish.component';

const NOW = new Date('2026-11-06T10:00:00Z');

describe('futureDate', () => {
  const check = futureDate(() => NOW);
  it('refuse une date passée et accepte une date à venir', () => {
    expect(check(new FormControl('2026-11-01'))).toEqual({ past: true });
    expect(check(new FormControl('2026-11-20'))).toBeNull();
  });
});

describe('espace employeur (parcours C)', () => {
  beforeEach(() => localStorage.clear());

  async function open(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'employeur', component: DashboardComponent },
          { path: 'employeur/publier', component: PublishComponent },
        ]),
        { provide: EmployerApi, useClass: SampleEmployerApi },
        { provide: AuthApi, useClass: SampleAuthApi },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    TestBed.inject(SessionStore).open({
      id: 'e1',
      name: 'Awa',
      email: 'e@example.org',
      role: 'EMPLOYEUR',
      organization: { name: 'Mon ONG', type: 'ONG', verification: 'EN_ATTENTE' },
    });
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    const root = () => harness.routeNativeElement as HTMLElement;
    const click = async (testid: string) => {
      root().querySelector<HTMLElement>(`[data-testid=${testid}]`)!.click();
      await harness.fixture.whenStable();
    };
    const fill = (id: string, value: string) => {
      const field = root().querySelector<HTMLInputElement>(`#${id}`)!;
      field.value = value;
      field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
    };
    return { harness, root, click, fill };
  }
  async function fillContent(page: Awaited<ReturnType<typeof open>>) {
    page.fill('p-title', 'Comptable pour un projet');
    page.fill('p-summary', 'Nous cherchons un comptable pour un projet de deux ans.');
    page.fill('p-sector', 'finance');
    page.fill('p-region', 'niamey');
    page.fill('p-city', 'Niamey');
    page.fill('p-deadline', '2026-12-01');
    await page.harness.fixture.whenStable();
  }

  it('affiche que la vérification de l’organisation est en cours', async () => {
    const page = await open('/employeur');
    expect(page.root().querySelector('[data-testid=employer-verification]')?.textContent).toContain(
      'Vérification en cours',
    );
  });

  it('affiche le motif d’un refus de l’annonce et du justificatif', async () => {
    const page = await open('/employeur');
    const session = TestBed.inject(SessionStore);
    session.open({
      id: 'e1',
      name: 'Awa',
      email: 'e@example.org',
      role: 'EMPLOYEUR',
      organization: {
        name: 'Mon ONG',
        type: 'ONG',
        verification: 'REFUSEE',
        verificationNote: 'Récépissé illisible.',
      },
    });
    await page.harness.fixture.whenStable();
    expect(page.root().querySelector('[data-testid=verification-note]')?.textContent).toContain(
      'Récépissé illisible.',
    );
    expect(page.root().querySelector('[data-testid=new-document]')).not.toBeNull();

    localStorage.setItem(
      'kernel.sample.employer',
      JSON.stringify([
        {
          id: 'x',
          ownerId: 'e1',
          type: 'CDI',
          title: 'Poste',
          status: 'BROUILLON',
          moderationNote: 'Précisez le lieu.',
          views: 0,
          applications: 0,
        },
      ]),
    );
    await page.harness.navigateByUrl('/employeur/publier?id=x');
    await page.harness.fixture.whenStable();
    expect(page.root().querySelector('[data-testid=draft-moderation-note]')?.textContent).toContain(
      'Précisez le lieu.',
    );
    await page.harness.navigateByUrl('/employeur');
    await page.harness.fixture.whenStable();
    expect(page.root().querySelector('[data-testid=moderation-note]')?.textContent).toContain(
      'Précisez le lieu.',
    );
  });

  it('un nouveau justificatif relance la vérification', async () => {
    const page = await open('/employeur');
    TestBed.inject(SessionStore).open({
      id: 'e1',
      name: 'Awa',
      email: 'e@example.org',
      role: 'EMPLOYEUR',
      organization: { name: 'Mon ONG', type: 'ONG', verification: 'REFUSEE' },
    });
    await page.harness.fixture.whenStable();
    const input = page.root().querySelector<HTMLInputElement>('[data-testid=new-document]')!;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'programme.exe', { type: 'application/x-msdownload' })],
    });
    input.dispatchEvent(new Event('change'));
    await page.harness.fixture.whenStable();
    expect(page.root().querySelector('#new-document-error')?.textContent).toContain('format');

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'arrete.pdf', { type: 'application/pdf' })],
    });
    input.dispatchEvent(new Event('change'));
    await page.harness.fixture.whenStable();
    const organization = TestBed.inject(SessionStore).user()?.organization;
    expect(organization?.verification).toBe('EN_ATTENTE');
    expect(organization?.documentName).toBe('arrete.pdf');
  });

  it('exige un type avant de continuer', async () => {
    const page = await open('/employeur/publier');
    await page.click('wizard-next');
    expect(page.root().querySelector('[data-testid=type-error]')).not.toBeNull();
    expect(page.root().querySelector('#p-title')).toBeNull();
  });

  it('prépare un modèle selon le type choisi', async () => {
    const page = await open('/employeur/publier');
    await page.click('type-APPEL_OFFRES');
    await page.click('wizard-next');
    expect(page.root().querySelector<HTMLTextAreaElement>('#p-description')?.value).toContain(
      'Objet du marché',
    );
  });

  it('bloque un contenu incomplet à la deuxième étape', async () => {
    const page = await open('/employeur/publier');
    await page.click('type-CDI');
    await page.click('wizard-next');
    page.fill('p-description', '');
    await page.click('wizard-next');
    expect(page.root().querySelector('[data-testid=publish-preview]')).toBeNull();
    expect(page.root().querySelectorAll('.form-field__error').length).toBeGreaterThan(0);
  });

  it('exige une adresse quand la réponse se fait par e-mail', async () => {
    const page = await open('/employeur/publier');
    await page.click('type-APPEL_OFFRES');
    await page.click('wizard-next');
    await fillContent(page);
    await page.click('wizard-next');
    expect(page.root().querySelector('[data-testid=publish-preview]')).toBeNull();
    expect(page.root().querySelector('#p-email')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('montre un aperçu, soumet, puis affiche « En attente » au tableau de bord', async () => {
    const page = await open('/employeur/publier');
    await page.click('type-CDI');
    await page.click('wizard-next');
    await fillContent(page);
    await page.click('wizard-next');
    expect(page.root().querySelector('[data-testid=publish-preview]')?.textContent).toContain(
      'Comptable pour un projet',
    );
    await page.click('wizard-submit');
    expect(TestBed.inject(Router).url).toBe('/employeur');
    expect(page.root().querySelector('[data-testid=employer-status]')?.textContent).toContain(
      'En attente',
    );
  });

  it('garde un brouillon, sans créer de doublon', async () => {
    const page = await open('/employeur/publier');
    await page.click('type-CDD');
    await page.click('wizard-next');
    await fillContent(page);
    await page.click('wizard-draft');
    await page.click('wizard-draft');
    expect(page.root().querySelector('[data-testid=draft-saved]')).not.toBeNull();
    await page.harness.navigateByUrl('/employeur');
    await page.harness.fixture.whenStable();
    const items = page.root().querySelectorAll('[data-testid=employer-item]');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Brouillon');
  });

  it('clôture, republie et duplique une annonce', async () => {
    const page = await open('/employeur');
    expect(page.root().querySelector('[data-testid=employer-empty]')).not.toBeNull();
    TestBed.inject(EmployerApi)
      .save(
        {
          type: 'CDI',
          title: 'Poste',
          summary: 's',
          description: 'd',
          sectorId: 'finance',
          regionId: 'niamey',
          city: 'Niamey',
          deadline: '2026-12-01',
          applyMode: 'EN_LIGNE',
          applyEmail: '',
          applyUrl: '',
          instructions: 'i',
          budget: null,
        },
        null,
        true,
      )
      .subscribe();
    await page.harness.navigateByUrl('/employeur/publier');
    await page.harness.navigateByUrl('/employeur');
    await page.harness.fixture.whenStable();
    await page.click('employer-close');
    expect(page.root().querySelector('[data-testid=employer-status]')?.textContent).toContain(
      'Clôturée',
    );
    await page.click('employer-republish');
    expect(page.root().querySelector('[data-testid=employer-status]')?.textContent).toContain(
      'En attente',
    );
    await page.click('employer-duplicate');
    expect(page.root().querySelectorAll('[data-testid=employer-item]')).toHaveLength(2);
    expect(page.root().querySelector('[data-testid=employer-item]')?.textContent).toContain(
      '(copie)',
    );
  });
});
