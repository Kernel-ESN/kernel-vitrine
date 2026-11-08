import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { ContactGateway } from '../data-access/contact.gateway';
import { ContactRequest } from '../models/contact-request';
import { ContactComponent } from './contact.component';

class FakeGateway extends ContactGateway {
  readonly requests: ContactRequest[] = [];
  constructor(
    readonly available: boolean,
    private readonly result: () => Observable<void>,
  ) {
    super();
  }
  send(request: ContactRequest): Observable<void> {
    this.requests.push(request);
    return this.result();
  }
}

describe('ContactComponent', () => {
  async function setup(gateway: FakeGateway) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ContactGateway, useValue: gateway }],
    });
    const fixture = TestBed.createComponent(ContactComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const fill = (id: string, value: string) => {
      const field = root.querySelector<HTMLInputElement>(`#${id}`)!;
      field.value = value;
      field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
    };
    const submitValid = async () => {
      fill('name', 'Awa Moussa');
      fill('audience', 'ong');
      fill('email', 'awa@example.org');
      fill('message', 'Nous cherchons un outil de collecte.');
      root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
    };
    return { root, submitValid, fixture };
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('confirme l’envoi uniquement après la réussite du service', async () => {
    const pending = new Subject<void>();
    const gateway = new FakeGateway(true, () => pending);
    const { root, submitValid, fixture } = await setup(gateway);

    await submitValid();
    expect(gateway.requests[0].name).toBe('Awa Moussa');
    expect(root.querySelector('[data-testid="confirmation"]')).toBeNull();
    expect(root.querySelector('button')?.textContent?.trim()).toBe('Envoi en cours…');

    pending.next();
    await fixture.whenStable();
    const confirmation = root.querySelector('[data-testid="confirmation"]');
    expect(confirmation?.textContent).toContain('Votre message est envoyé');
    expect(document.activeElement).toBe(confirmation);
    expect(root.querySelector('form')).toBeNull();
  });

  it('affiche l’erreur avec le téléphone et conserve la saisie en cas d’échec', async () => {
    const gateway = new FakeGateway(true, () => throwError(() => new Error('panne')));
    const { root, submitValid } = await setup(gateway);

    await submitValid();
    const error = root.querySelector('[data-testid="send-error"]');
    expect(error?.textContent).toContain('+227 88 89 82 82');
    expect(root.querySelector('[data-testid="confirmation"]')).toBeNull();
    expect(root.querySelector<HTMLInputElement>('#name')?.value).toBe('Awa Moussa');
  });

  it("annonce que l'envoi n'est pas actif, sans fausse confirmation, sans service configuré", async () => {
    const gateway = new FakeGateway(false, () => of(undefined));
    const { root, submitValid } = await setup(gateway);

    expect(root.querySelector('[data-testid="unavailable"]')?.textContent).toContain(
      '+227 88 89 82 82',
    );
    expect(root.querySelector<HTMLButtonElement>('form button')?.disabled).toBe(true);
    await submitValid();
    expect(gateway.requests).toHaveLength(0);
    expect(root.querySelector('[data-testid="confirmation"]')).toBeNull();
  });

  it('ouvre le formulaire sur un devis et le confirme comme tel (parcours D)', async () => {
    const gateway = new FakeGateway(true, () => of(undefined));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ContactGateway, useValue: gateway }],
    });
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.componentRef.setInput('objet', 'devis');
    fixture.componentRef.setInput('service', 'cloud');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('Demander un devis');
    expect(root.querySelector<HTMLSelectElement>('#subject')?.value).toBe('devis');
    expect(root.querySelector<HTMLSelectElement>('#service')?.value).toBe('cloud');

    const fill = (id: string, value: string) => {
      const field = root.querySelector<HTMLInputElement>(`#${id}`)!;
      field.value = value;
      field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
    };
    fill('name', 'Awa Moussa');
    fill('audience', 'ong');
    fill('email', 'awa@example.org');
    fill('message', 'Nous voulons migrer notre messagerie.');
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(gateway.requests[0].subject).toBe('devis');
    expect(gateway.requests[0].service).toBe('cloud');
    expect(root.querySelector('[data-testid=confirmation] h2')?.textContent).toContain('devis');
  });
});
