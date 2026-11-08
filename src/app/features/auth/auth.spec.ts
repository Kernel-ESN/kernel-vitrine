import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { requireUser, safeReturnUrl } from './auth.guard';
import { AuthApi, SampleAuthApi } from './data-access/auth.api';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { SessionStore } from './state/session.store';

@Component({ template: 'protégé' })
class ProtectedComponent {}

describe('authentification simulée', () => {
  beforeEach(() => localStorage.clear());

  async function open(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'connexion', component: LoginComponent },
          { path: 'inscription', component: RegisterComponent },
          { path: 'compte', component: ProtectedComponent },
          { path: 'employeur', component: ProtectedComponent },
          { path: 'protege', canActivate: [requireUser()], component: ProtectedComponent },
          { path: 'pro', canActivate: [requireUser('EMPLOYEUR')], component: ProtectedComponent },
        ]),
        { provide: AuthApi, useClass: SampleAuthApi },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    return { harness, root: () => harness.routeNativeElement as HTMLElement };
  }
  const fill = (root: HTMLElement, id: string, value: string) => {
    const field = root.querySelector<HTMLInputElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };

  it('renvoie vers la connexion, puis vers la page demandée (parcours B)', async () => {
    const { harness, root } = await open('/protege');
    expect(TestBed.inject(Router).url).toBe('/connexion?retour=%2Fprotege');
    fill(root(), 'login-email', 'candidat@example.org');
    fill(root(), 'login-password', 'motdepasse');
    root().querySelector<HTMLButtonElement>('[data-testid=login-submit]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/protege');
    expect(TestBed.inject(SessionStore).user()?.role).toBe('CANDIDAT');
  });

  it('refuse un e-mail inconnu et reste sur la page', async () => {
    const { harness, root } = await open('/connexion');
    fill(root(), 'login-email', 'personne@example.org');
    fill(root(), 'login-password', 'motdepasse');
    root().querySelector<HTMLButtonElement>('[data-testid=login-submit]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('[data-testid=login-error]')).not.toBeNull();
    expect(TestBed.inject(SessionStore).user()).toBeNull();
  });

  it("n'ouvre pas l'espace employeur à un candidat", async () => {
    const { harness } = await open('/connexion');
    TestBed.inject(SessionStore).open({
      id: 'c',
      name: 'C',
      email: 'c@example.org',
      role: 'CANDIDAT',
    });
    await harness.navigateByUrl('/pro');
    expect(TestBed.inject(Router).url).toBe('/compte');
  });

  it('exige le nom, le contact et un justificatif valide pour un employeur', async () => {
    const { harness, root } = await open('/inscription');
    root().querySelector<HTMLInputElement>('[data-testid=role-employer]')!.click();
    await harness.fixture.whenStable();
    fill(root(), 'reg-name', 'Awa');
    fill(root(), 'reg-email', 'awa@example.org');
    fill(root(), 'reg-password', 'motdepasse');
    root().querySelector<HTMLButtonElement>('[data-testid=register-submit]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(SessionStore).user()).toBeNull();
    fill(root(), 'reg-org', 'Mon ONG');
    fill(root(), 'reg-org-phone', '+227 90 00 00 00');
    root().querySelector<HTMLButtonElement>('[data-testid=register-submit]')!.click();
    await harness.fixture.whenStable();
    expect(root().querySelector('#reg-org-document-error')?.textContent).toContain('Joignez');
    expect(TestBed.inject(SessionStore).user()).toBeNull();

    const input = root().querySelector<HTMLInputElement>('[data-testid=reg-org-document]')!;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'recepisse.exe', { type: 'application/x-msdownload' })],
    });
    input.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(root().querySelector('#reg-org-document-error')?.textContent).toContain('format');

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'recepisse.pdf', { type: 'application/pdf' })],
    });
    input.dispatchEvent(new Event('change'));
    root().querySelector<HTMLButtonElement>('[data-testid=register-submit]')!.click();
    await harness.fixture.whenStable();
    const organization = TestBed.inject(SessionStore).user()?.organization;
    expect(organization?.name).toBe('Mon ONG');
    expect(organization?.verification).toBe('EN_ATTENTE');
    expect(organization?.documentName).toBe('recepisse.pdf');
    expect(TestBed.inject(Router).url).toBe('/employeur');
  });

  it('refuse un e-mail déjà pris et ne conserve aucun mot de passe', async () => {
    TestBed.configureTestingModule({ providers: [SampleAuthApi] });
    const api = TestBed.inject(SampleAuthApi);
    await firstValueFrom(
      api.register({ name: 'A', email: 'A@Example.org', password: 'secret-123', role: 'CANDIDAT' }),
    );
    expect(JSON.stringify(localStorage)).not.toContain('secret-123');
    await expect(
      firstValueFrom(
        api.register({ name: 'B', email: 'a@example.org', password: 'x', role: 'CANDIDAT' }),
      ),
    ).rejects.toBe('EMAIL_TAKEN');
  });

  it('modifie le profil et le retrouve à la connexion suivante', async () => {
    TestBed.configureTestingModule({ providers: [SampleAuthApi] });
    const api = TestBed.inject(SampleAuthApi);
    const session = TestBed.inject(SessionStore);
    session.open(await firstValueFrom(TestBed.inject(SampleAuthApi).login('candidat@example.org')));
    const user = await firstValueFrom(
      api.updateProfile({ name: ' Awa Moussa ', phone: ' +227 90 ' }),
    );
    expect(user).toMatchObject({
      name: 'Awa Moussa',
      phone: '+227 90',
      email: 'candidat@example.org',
    });
    expect((await firstValueFrom(api.login('candidat@example.org'))).name).toBe('Awa Moussa');
  });

  it('ne redirige jamais vers un site extérieur', () => {
    expect(safeReturnUrl('/emplois/a')).toBe('/emplois/a');
    expect(safeReturnUrl('https://malveillant.test')).toBe('/compte');
    expect(safeReturnUrl('//malveillant.test')).toBe('/compte');
    expect(safeReturnUrl(null)).toBe('/compte');
  });
});
