import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CLOCK } from '@core/data/clock';
import { SessionStore } from '@features/auth/state/session.store';
import { ListingsApi } from '@features/listings/data-access/listings.api';
import { SampleListingsApi } from '@features/listings/data-access/sample-listings.api';
import {
  SampleSavedListingsApi,
  SavedListingsApi,
} from '@features/listings/data-access/saved-listings.api';
import { buildSampleListings } from '@features/listings/data-access/sample-listings.data';
import { AccountApi, SampleAccountApi } from './data-access/account.api';
import { cvError, MAX_CV_BYTES } from './models/account';
import { AuthApi, SampleAuthApi } from '@features/auth/data-access/auth.api';
import { AccountComponent } from './pages/account.component';
import { ApplyComponent } from './pages/apply.component';
import { applyListingResolver } from './state/apply-listing.resolver';

const NOW = new Date('2026-11-06T10:00:00Z');
const online = buildSampleListings(NOW).find((l) => l.howToApply.mode === 'EN_LIGNE')!;
const byEmail = buildSampleListings(NOW).find(
  (l) => l.universe === 'EMPLOI' && l.howToApply.mode === 'EMAIL',
)!;

describe('cvError', () => {
  it('accepte un PDF et refuse les autres cas', () => {
    expect(cvError(null)).toBe('missing');
    expect(cvError({ size: 100, type: 'application/pdf' })).toBeNull();
    expect(cvError({ size: 100, type: 'application/x-msdownload' })).toBe('type');
    expect(cvError({ size: MAX_CV_BYTES + 1, type: 'application/pdf' })).toBe('size');
  });
});

describe('candidature et compte', () => {
  beforeEach(() => localStorage.clear());

  async function open(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'emplois/:slug/postuler',
              data: { universe: 'EMPLOI' },
              resolve: { listing: applyListingResolver },
              component: ApplyComponent,
            },
            { path: 'compte', component: AccountComponent },
          ],
          withComponentInputBinding(),
        ),
        { provide: ListingsApi, useClass: SampleListingsApi },
        { provide: AccountApi, useClass: SampleAccountApi },
        { provide: AuthApi, useClass: SampleAuthApi },
        { provide: SavedListingsApi, useClass: SampleSavedListingsApi },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    TestBed.inject(SessionStore).open({
      id: 'u1',
      name: 'Awa',
      email: 'awa@example.org',
      role: 'CANDIDAT',
    });
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    return { harness, root: () => harness.routeNativeElement as HTMLElement };
  }
  function attach(root: HTMLElement, file: File) {
    const input = root.querySelector<HTMLInputElement>('[data-testid=apply-cv]')!;
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    input.dispatchEvent(new Event('change'));
  }
  const pdf = new File(['x'], 'cv.pdf', { type: 'application/pdf' });

  it('bloque une candidature incomplète et explique pourquoi', async () => {
    const { harness, root } = await open(`/emplois/${online.slug}/postuler`);
    root().querySelector<HTMLButtonElement>('[data-testid=apply-submit]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('#apply-cv-error')?.textContent).toContain('Joignez');
    expect(root().querySelector('[data-testid=apply-confirmation]')).toBeNull();
  });

  it('confirme la candidature et la retrouve dans le compte (parcours B)', async () => {
    const { harness, root } = await open(`/emplois/${online.slug}/postuler`);
    attach(root(), pdf);
    const letter = root().querySelector<HTMLTextAreaElement>('#apply-letter')!;
    letter.value = 'Je souhaite rejoindre votre équipe comptable.';
    letter.dispatchEvent(new Event('input'));
    root().querySelector<HTMLInputElement>('[data-testid=apply-consent]')!.click();
    root().querySelector<HTMLButtonElement>('[data-testid=apply-submit]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=apply-confirmation]')).not.toBeNull();

    await harness.navigateByUrl('/compte');
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=application]')?.textContent).toContain(online.title);
  });

  it('ne laisse pas postuler deux fois', async () => {
    const first = await open(`/emplois/${online.slug}/postuler`);
    TestBed.inject(AccountApi)
      .apply(
        {
          id: online.id,
          slug: online.slug,
          universe: 'EMPLOI',
          title: online.title,
          organizationName: 'x',
        },
        { cv: pdf, letter: 'Bonjour à vous', keepCv: false },
      )
      .subscribe();
    await first.harness.navigateByUrl('/compte');
    await first.harness.navigateByUrl(`/emplois/${online.slug}/postuler`);
    await first.harness.fixture.whenStable();
    expect(first.root().querySelector('[data-testid=apply-already]')).not.toBeNull();
  });

  it("refuse la candidature en ligne si l'annonce se fait par e-mail", async () => {
    const { root } = await open(`/emplois/${byEmail.slug}/postuler`);
    expect(root().querySelector('[data-testid=apply-unavailable]')).not.toBeNull();
    expect(root().querySelector('form')).toBeNull();
  });

  it('retire une annonce enregistrée', async () => {
    const { harness, root } = await open('/compte');
    TestBed.inject(SavedListingsApi)
      .set(
        { id: 'a', slug: 'b', universe: 'EMPLOI', title: 'Annonce gardée', organizationName: 'x' },
        true,
      )
      .subscribe();
    await harness.navigateByUrl('/emplois/inconnue/postuler');
    await harness.navigateByUrl('/compte');
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=saved]')?.textContent).toContain('Annonce gardée');
    root().querySelector<HTMLButtonElement>('[data-testid=saved] button')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=saved]')).toBeNull();
  });

  it('enregistre un CV dans le compte, le remplace et le supprime', async () => {
    const { harness, root } = await open('/compte');
    const pick = async (file: File) => {
      const input = root().querySelector<HTMLInputElement>('[data-testid=saved-cv-file]')!;
      Object.defineProperty(input, 'files', { configurable: true, value: [file] });
      input.dispatchEvent(new Event('change'));
      await harness.fixture.whenStable();
    };
    await pick(new File(['x'], 'photo.exe', { type: 'application/x-msdownload' }));
    expect(root().querySelector('#saved-cv-file-error')?.textContent).toContain('format');
    expect(root().querySelector('[data-testid=saved-cv-name]')).toBeNull();

    await pick(pdf);
    expect(root().querySelector('#saved-cv-file-error')).toBeNull();
    expect(root().querySelector('[data-testid=saved-cv-name]')?.textContent).toContain('cv.pdf');

    root().querySelector<HTMLButtonElement>('[data-testid=saved-cv-remove]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=saved-cv-name]')).toBeNull();
  });

  it('propose le CV enregistré et postule sans joindre de fichier', async () => {
    const { harness, root } = await open('/compte');
    TestBed.inject(AccountApi).saveCv(pdf).subscribe();
    await harness.navigateByUrl(`/emplois/${online.slug}/postuler`);
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=apply-cv-choice]')?.textContent).toContain('cv.pdf');
    expect(root().querySelector('[data-testid=apply-cv]')).toBeNull();

    const letter = root().querySelector<HTMLTextAreaElement>('#apply-letter')!;
    letter.value = 'Je souhaite rejoindre votre équipe comptable.';
    letter.dispatchEvent(new Event('input'));
    root().querySelector<HTMLInputElement>('[data-testid=apply-consent]')!.click();
    root().querySelector<HTMLButtonElement>('[data-testid=apply-submit]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=apply-confirmation]')).not.toBeNull();
    let documents: readonly string[] = [];
    TestBed.inject(AccountApi)
      .applications()
      .subscribe((items) => (documents = items[0].documents));
    expect(documents).toEqual(['cv.pdf']);
  });

  it('peut joindre un autre fichier et le garder pour la prochaine fois', async () => {
    const { harness, root } = await open('/compte');
    TestBed.inject(AccountApi).saveCv(pdf).subscribe();
    await harness.navigateByUrl(`/emplois/${online.slug}/postuler`);
    await harness.fixture.whenStable();
    root().querySelector<HTMLInputElement>('[data-testid=apply-cv-other]')!.click();
    await harness.fixture.whenStable();
    attach(root(), new File(['x'], 'nouveau.pdf', { type: 'application/pdf' }));
    root().querySelector<HTMLInputElement>('[data-testid=apply-keep-cv]')!.click();
    const letter = root().querySelector<HTMLTextAreaElement>('#apply-letter')!;
    letter.value = 'Je souhaite rejoindre votre équipe comptable.';
    letter.dispatchEvent(new Event('input'));
    root().querySelector<HTMLInputElement>('[data-testid=apply-consent]')!.click();
    root().querySelector<HTMLButtonElement>('[data-testid=apply-submit]')!.click();
    await harness.fixture.whenStable();
    let name = '';
    TestBed.inject(AccountApi)
      .cv()
      .subscribe((cv) => (name = cv?.name ?? ''));
    expect(name).toBe('nouveau.pdf');
  });

  it('modifie le profil depuis le compte et confirme', async () => {
    const { harness, root } = await open('/compte');
    const name = root().querySelector<HTMLInputElement>('#profile-name')!;
    expect(name.value).toBe('Awa');
    expect(root().querySelector<HTMLInputElement>('#profile-email')?.readOnly).toBe(true);
    name.value = 'Awa Moussa';
    name.dispatchEvent(new Event('input'));
    root().querySelector<HTMLButtonElement>('[data-testid=profile-save]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=profile-status]')?.textContent).toContain(
      'enregistrées',
    );
    expect(root().querySelector('[data-testid=account-user]')?.textContent).toContain('Awa Moussa');
  });

  it('refuse un téléphone invalide dans le profil', async () => {
    const { harness, root } = await open('/compte');
    const phone = root().querySelector<HTMLInputElement>('#profile-phone')!;
    phone.value = 'abc';
    phone.dispatchEvent(new Event('input'));
    root().querySelector<HTMLButtonElement>('[data-testid=profile-save]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('#profile-phone-error')).not.toBeNull();
    expect(TestBed.inject(SessionStore).user()?.phone).toBeUndefined();
  });
});
