import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContactRequest } from '../models/contact-request';
import { CONTACT_ENDPOINT, HttpContactGateway } from './contact.gateway';

const REQUEST: ContactRequest = {
  subject: 'question',
  service: null,
  name: 'Awa',
  organization: null,
  audience: 'ong',
  email: 'awa@example.org',
  phone: null,
  message: 'Bonjour',
};

describe('HttpContactGateway', () => {
  function setup(endpoint: string) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpContactGateway,
        { provide: CONTACT_ENDPOINT, useValue: endpoint },
      ],
    });
    return {
      gateway: TestBed.inject(HttpContactGateway),
      http: TestBed.inject(HttpTestingController),
    };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('poste la demande et réussit sur une réponse 200', () => {
    const { gateway, http } = setup('https://envoi.example/contact');
    let done = false;
    gateway.send(REQUEST).subscribe(() => (done = true));
    const call = http.expectOne('https://envoi.example/contact');
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(REQUEST);
    call.flush('');
    expect(done).toBe(true);
    http.verify();
  });

  it('remonte une erreur sur une réponse 500', () => {
    const { gateway, http } = setup('https://envoi.example/contact');
    let failed = false;
    gateway.send(REQUEST).subscribe({ error: () => (failed = true) });
    http
      .expectOne('https://envoi.example/contact')
      .flush('', { status: 500, statusText: 'Erreur' });
    expect(failed).toBe(true);
    http.verify();
  });

  it('remonte une erreur si le service ne répond pas à temps', () => {
    vi.useFakeTimers();
    const { gateway, http } = setup('https://envoi.example/contact');
    let failed = false;
    gateway.send(REQUEST).subscribe({ error: () => (failed = true) });
    http.expectOne('https://envoi.example/contact');
    vi.advanceTimersByTime(20_001);
    expect(failed).toBe(true);
    http.verify();
  });

  it("n'envoie rien et échoue tant qu'aucun service n'est configuré", () => {
    const { gateway, http } = setup('');
    let failed = false;
    gateway.send(REQUEST).subscribe({ error: () => (failed = true) });
    expect(gateway.available).toBe(false);
    expect(failed).toBe(true);
    http.verify();
  });
});
