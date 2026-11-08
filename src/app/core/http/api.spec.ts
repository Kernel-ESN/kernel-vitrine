import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { apiInterceptor, HANDLES_UNAUTHORIZED, ON_UNAUTHORIZED } from './api';

describe('apiInterceptor', () => {
  let expired = 0;

  function setup() {
    expired = 0;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: ON_UNAUTHORIZED, useValue: () => (expired += 1) },
      ],
    });
    return { http: TestBed.inject(HttpClient), mock: TestBed.inject(HttpTestingController) };
  }

  it("envoie le cookie de session à l'API", () => {
    const { http, mock } = setup();
    http.get('/api/listings').subscribe();
    expect(mock.expectOne('/api/listings').request.withCredentials).toBe(true);
    mock.verify();
  });

  it('ne touche pas aux appels extérieurs', () => {
    const { http, mock } = setup();
    http.get('https://example.org/x').subscribe();
    expect(mock.expectOne('https://example.org/x').request.withCredentials).toBe(false);
    mock.verify();
  });

  it('signale une session expirée et laisse passer l’erreur', async () => {
    const { http, mock } = setup();
    const call = firstValueFrom(http.get('/api/me/saved'));
    mock.expectOne('/api/me/saved').flush('x', { status: 401, statusText: 'Non autorisé' });
    await expect(call).rejects.toBeTruthy();
    expect(expired).toBe(1);
  });

  it('ne confond pas un mauvais mot de passe avec une session expirée', async () => {
    const { http, mock } = setup();
    const call = firstValueFrom(http.post('/api/auth/login', {}));
    mock.expectOne('/api/auth/login').flush('x', { status: 401, statusText: 'Non autorisé' });
    await expect(call).rejects.toBeTruthy();
    expect(expired).toBe(0);
  });

  it('laisse un appel gérer lui-même son 401', async () => {
    const { http, mock } = setup();
    const context = new HttpContext().set(HANDLES_UNAUTHORIZED, true);
    const call = firstValueFrom(http.get('/api/me', { context }));
    mock.expectOne('/api/me').flush('x', { status: 401, statusText: 'Non autorisé' });
    await expect(call).rejects.toBeTruthy();
    expect(expired).toBe(0);
  });
});
