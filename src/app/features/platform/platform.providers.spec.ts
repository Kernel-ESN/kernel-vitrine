import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { EMPTY_QUERY } from '@features/listings/models/listing-query';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AccountApi, HttpAccountApi } from '@features/account/data-access/account.api';
import { HttpModerationApi, ModerationApi } from '@features/admin/data-access/moderation.api';
import { AlertsApi, HttpAlertsApi } from '@features/alerts/data-access/alerts.api';
import { Alert } from '@features/alerts/models/alert';
import { AuthApi, HttpAuthApi } from '@features/auth/data-access/auth.api';
import { SessionStore } from '@features/auth/state/session.store';
import { EmployerApi, HttpEmployerApi } from '@features/employer/data-access/employer.api';
import { ListingDraft } from '@features/employer/models/employer-listing';
import { HttpListingsApi } from '@features/listings/data-access/http-listings.api';
import { ListingsApi } from '@features/listings/data-access/listings.api';
import {
  HttpSavedListingsApi,
  SavedListingsApi,
} from '@features/listings/data-access/saved-listings.api';
import { SavedListing } from '@features/listings/models/saved-listing';
import { firstValueFrom } from 'rxjs';
import { provideHttpApis, provideSampleApis } from './platform.providers';

const SAVED: SavedListing = {
  id: 'a1',
  slug: 's',
  universe: 'EMPLOI',
  title: 'T',
  organizationName: 'O',
};
const DRAFT = { title: 'T' } as ListingDraft;

@Component({ template: '' })
class BlankComponent {}

describe('API réelle', () => {
  // Les fichiers de test partagent le stockage : une session restante changerait le démarrage.
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'connexion', component: BlankComponent }]),
        provideHttpApis(),
        provideHttpClientTesting(),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    // Le démarrage dépose le cookie CSRF : tout le reste vient après.
    TestBed.inject(ListingsApi);
    http.expectOne('/api/auth/csrf').flush(null);
    return http;
  }

  /** Une connexion ou une inscription demande d'abord le jeton CSRF. */
  const flushCsrf = (http: HttpTestingController) => http.expectOne('/api/auth/csrf').flush(null);

  it('remplace chaque API simulée par sa version HTTP', () => {
    setup();
    expect(TestBed.inject(ListingsApi)).toBeInstanceOf(HttpListingsApi);
    expect(TestBed.inject(SavedListingsApi)).toBeInstanceOf(HttpSavedListingsApi);
    expect(TestBed.inject(AlertsApi)).toBeInstanceOf(HttpAlertsApi);
    expect(TestBed.inject(AuthApi)).toBeInstanceOf(HttpAuthApi);
    expect(TestBed.inject(AccountApi)).toBeInstanceOf(HttpAccountApi);
    expect(TestBed.inject(EmployerApi)).toBeInstanceOf(HttpEmployerApi);
    expect(TestBed.inject(ModerationApi)).toBeInstanceOf(HttpModerationApi);
  });

  it('modération : respecte le contrat', () => {
    const http = setup();
    const api = TestBed.inject(ModerationApi);
    api.listings('PUBLIEE').subscribe();
    expect(http.expectOne('/api/admin/listings?status=PUBLIEE').request.method).toBe('GET');
    api.publish('x').subscribe();
    expect(http.expectOne('/api/admin/listings/x/publish').request.method).toBe('POST');
    api.reject('x', 'Motif').subscribe();
    expect(http.expectOne('/api/admin/listings/x/reject').request.body).toEqual({
      reason: 'Motif',
    });
    api.withdraw('x', 'Motif').subscribe();
    expect(http.expectOne('/api/admin/listings/x/withdraw').request.body).toEqual({
      reason: 'Motif',
    });
    api.organizations().subscribe();
    http.expectOne('/api/admin/organizations');
    api.verify('o').subscribe();
    http.expectOne('/api/admin/organizations/o/verify');
    api.rejectOrganization('o', 'Motif').subscribe();
    http.expectOne('/api/admin/organizations/o/reject');
    expect(api.documentUrl('o')).toBe('/api/admin/organizations/o/document');
    http.verify();
  });

  it('justificatif : envoie un nouveau fichier', () => {
    const http = setup();
    const file = new File(['x'], 'arrete.pdf', { type: 'application/pdf' });
    TestBed.inject(AuthApi).replaceOrganizationDocument(file).subscribe();
    const call = http.expectOne('/api/me/organization/document');
    expect(call.request.method).toBe('PUT');
    expect(((call.request.body as FormData).get('document') as File).name).toBe('arrete.pdf');
    http.verify();
  });

  it('annonces : respecte le contrat des compteurs et des organisations', () => {
    const http = setup();
    const api = TestBed.inject(ListingsApi);
    api.facets({ ...EMPTY_QUERY, region: ['niamey', 'zinder'], since: '7' }).subscribe();
    http.expectOne('/api/listings/facets?regionId=niamey&regionId=zinder&publishedWithinDays=7');
    api.organizations().subscribe();
    http.expectOne('/api/organizations');
    let found: unknown = 'non lu';
    api.organization('inconnue').subscribe((value) => (found = value));
    http
      .expectOne('/api/organizations/inconnue')
      .flush(null, { status: 404, statusText: 'Absent' });
    expect(found).toBeNull();
    http.verify();
  });

  it('déconnexion : ferme la session côté serveur', () => {
    const http = setup();
    TestBed.inject(AuthApi).logout().subscribe();
    expect(http.expectOne('/api/auth/logout').request.method).toBe('POST');
    http.verify();
  });

  it('alertes : respecte le contrat', async () => {
    const http = setup();
    const api = TestBed.inject(AlertsApi);
    const created = firstValueFrom(
      api.create({ criteria: {}, channel: 'EMAIL', frequency: 'HEBDO' }),
    );
    const post = http.expectOne('/api/alerts');
    expect(post.request.method).toBe('POST');
    expect(post.request.withCredentials).toBe(true);
    post.flush({ id: '1' } as Alert);
    expect((await created).id).toBe('1');

    api.remove('1').subscribe();
    expect(http.expectOne('/api/alerts/1').request.method).toBe('DELETE');
    http.verify();
  });

  it('connexion : traduit les erreurs du serveur', async () => {
    const http = setup();
    const api = TestBed.inject(AuthApi);
    const bad = firstValueFrom(api.login('a@example.org', 'motdepasse'));
    flushCsrf(http);
    http.expectOne('/api/auth/login').flush('x', { status: 401, statusText: 'KO' });
    await expect(bad).rejects.toBe('INVALID_CREDENTIALS');

    const taken = firstValueFrom(
      api.register({ name: 'A', email: 'a@example.org', password: 'motdepasse', role: 'CANDIDAT' }),
    );
    flushCsrf(http);
    http.expectOne('/api/auth/register').flush('x', { status: 409, statusText: 'KO' });
    await expect(taken).rejects.toBe('EMAIL_TAKEN');

    const down = firstValueFrom(api.login('a@example.org', 'motdepasse'));
    flushCsrf(http);
    http.expectOne('/api/auth/login').flush('x', { status: 500, statusText: 'KO' });
    await expect(down).rejects.toBe('UNAVAILABLE');
    http.verify();
  });

  it('favoris : enregistre, puis relit la liste à jour', async () => {
    const http = setup();
    const result = firstValueFrom(TestBed.inject(SavedListingsApi).set(SAVED, true));
    const put = http.expectOne('/api/me/saved/a1');
    expect(put.request.method).toBe('PUT');
    put.flush(null);
    http.expectOne('/api/me/saved').flush([SAVED]);
    expect(await result).toEqual([SAVED]);
    http.verify();
  });

  it('candidature : envoie le CV et la lettre en multipart', () => {
    const http = setup();
    const cv = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    TestBed.inject(AccountApi).apply(SAVED, { cv, letter: 'Bonjour', keepCv: true }).subscribe();
    const body = http.expectOne('/api/listings/a1/applications').request.body as FormData;
    expect((body.get('cv') as File).name).toBe('cv.pdf');
    expect(body.get('letter')).toBe('Bonjour');
    expect(body.get('consent')).toBe('true');
    expect(body.get('keepCv')).toBe('true');
    http.verify();
  });

  it('candidature : reprend le CV enregistré sans envoyer de fichier', () => {
    const http = setup();
    TestBed.inject(AccountApi)
      .apply(SAVED, { cv: null, letter: 'Bonjour', keepCv: false })
      .subscribe();
    const body = http.expectOne('/api/listings/a1/applications').request.body as FormData;
    expect(body.get('cv')).toBeNull();
    expect(body.get('useSavedCv')).toBe('true');
    http.verify();
  });

  it('CV du compte : traite l’absence de CV, enregistre et supprime', async () => {
    const http = setup();
    const api = TestBed.inject(AccountApi);
    const none = firstValueFrom(api.cv());
    http.expectOne('/api/me/cv').flush(null, { status: 204, statusText: 'No Content' });
    expect(await none).toBeNull();
    api.saveCv(new File(['x'], 'cv.pdf', { type: 'application/pdf' })).subscribe();
    const put = http.expectOne('/api/me/cv');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toBeInstanceOf(FormData);
    api.removeCv().subscribe();
    expect(http.expectOne('/api/me/cv').request.method).toBe('DELETE');
    http.verify();
  });

  it('profil et justificatif : respectent le contrat', () => {
    const http = setup();
    const api = TestBed.inject(AuthApi);
    api.updateProfile({ name: 'A', phone: '' }).subscribe();
    expect(http.expectOne('/api/me').request.method).toBe('PUT');
    api
      .register({
        name: 'A',
        email: 'a@example.org',
        password: 'motdepasse',
        role: 'EMPLOYEUR',
        phone: '+227 90 00 00 00',
        organization: {
          name: 'O',
          type: 'ONG',
          document: new File(['x'], 'recepisse.pdf', { type: 'application/pdf' }),
        },
      })
      .subscribe();
    flushCsrf(http);
    const body = http.expectOne('/api/auth/register').request.body as FormData;
    expect((body.get('document') as File).name).toBe('recepisse.pdf');
    expect(JSON.parse(body.get('data') as string).organization).toEqual({ name: 'O', type: 'ONG' });
    http.verify();
  });

  it('employeur : crée, soumet, modifie et agit sur une annonce', () => {
    const http = setup();
    const api = TestBed.inject(EmployerApi);
    api.save(DRAFT, null, true).subscribe();
    const create = http.expectOne('/api/employer/listings?submit=true');
    expect(create.request.method).toBe('POST');
    api.save(DRAFT, 'x', false).subscribe();
    expect(http.expectOne('/api/employer/listings/x?submit=false').request.method).toBe('PUT');
    api.close('x').subscribe();
    expect(http.expectOne('/api/employer/listings/x/close').request.method).toBe('POST');
    http.verify();
  });

  it('session expirée : ferme la session et renvoie vers la connexion', async () => {
    const http = setup();
    TestBed.inject(SessionStore).open({
      id: 'u',
      name: 'A',
      email: 'a@example.org',
      role: 'CANDIDAT',
    });
    const call = firstValueFrom(TestBed.inject(SavedListingsApi).list());
    http.expectOne('/api/me/saved').flush('x', { status: 401, statusText: 'KO' });
    await expect(call).rejects.toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve));
    expect(TestBed.inject(SessionStore).user()).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/connexion?retour=%2F');
  });
});

describe('reprise de session au démarrage', () => {
  beforeEach(() => localStorage.clear());

  const user = { id: 'u', name: 'A', email: 'a@example.org', role: 'CANDIDAT' as const };

  function start() {
    // La session existe déjà dans le navigateur quand la plateforme démarre.
    localStorage.setItem('kernel.sample.session', JSON.stringify(user));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpApis(), provideHttpClientTesting()],
    });
    return TestBed.inject(HttpTestingController);
  }

  afterEach(() => localStorage.clear());

  it('ferme une session expirée sans renvoyer vers la connexion', async () => {
    const http = start();
    TestBed.inject(ListingsApi);
    http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/me').flush('x', { status: 401, statusText: 'KO' });
    expect(TestBed.inject(SessionStore).user()).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('met à jour la session si elle est encore valide', () => {
    const http = start();
    TestBed.inject(ListingsApi);
    http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/me').flush({ ...user, name: 'Nouveau nom' });
    expect(TestBed.inject(SessionStore).user()?.name).toBe('Nouveau nom');
  });

  it('garde la session si le serveur ne répond pas', () => {
    const http = start();
    TestBed.inject(ListingsApi);
    http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/me').flush('x', { status: 500, statusText: 'KO' });
    expect(TestBed.inject(SessionStore).user()?.id).toBe('u');
  });
});

describe('API simulée', () => {
  it('ne déclenche aucun appel réseau', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideSampleApis(), provideHttpClientTesting()],
    });
    await firstValueFrom(TestBed.inject(AlertsApi).list());
    TestBed.inject(HttpTestingController).verify();
  });
});
