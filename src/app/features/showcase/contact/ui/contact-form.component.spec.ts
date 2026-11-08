import { TestBed } from '@angular/core/testing';
import { AUDIENCE_NAV } from '@core/config/navigation';
import { ContactFormValue } from '../models/contact-request';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  function setup(initialAudience?: string) {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.componentRef.setInput('audiences', AUDIENCE_NAV);
    fixture.componentRef.setInput('initialAudience', initialAudience);
    const emitted: ContactFormValue[] = [];
    fixture.componentInstance.submitted.subscribe((value) => emitted.push(value));
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);

    const fill = (id: string, value: string) => {
      const field = root.querySelector<HTMLInputElement>(`#${id}`)!;
      field.value = value;
      field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
    };
    const submit = async () => {
      root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const fillValid = () => {
      fill('name', 'Awa Moussa');
      fill('audience', 'ong');
      fill('email', 'awa@example.org');
      fill('message', 'Nous cherchons un outil de collecte.');
    };
    return { fixture, root, emitted, fill, submit, fillValid };
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('bloque un envoi vide, affiche les erreurs et place le focus sur le premier champ', async () => {
    const { root, emitted, submit } = setup();
    await submit();
    expect(emitted).toHaveLength(0);
    expect(root.querySelector('#name-error')?.textContent).toBe('Indiquez votre nom.');
    expect(root.querySelector('#contact-error')?.textContent).toBe(
      'Indiquez un e-mail ou un téléphone.',
    );
    expect(document.activeElement).toBe(root.querySelector('#name'));
  });

  it('transmet la demande quand seul le téléphone est renseigné', async () => {
    const { emitted, fill, fillValid, submit } = setup();
    fillValid();
    fill('email', '');
    fill('phone', '+227 90 00 00 00');
    await submit();
    expect(emitted).toHaveLength(1);
    expect(emitted[0].phone).toBe('+227 90 00 00 00');
  });

  it('refuse un e-mail invalide', async () => {
    const { root, emitted, fill, fillValid, submit } = setup();
    fillValid();
    fill('email', 'pas-une-adresse');
    await submit();
    expect(emitted).toHaveLength(0);
    expect(root.querySelector('#email-error')).not.toBeNull();
  });

  it("n'envoie rien quand le champ piège est rempli", async () => {
    const { emitted, fill, fillValid, submit } = setup();
    fillValid();
    fill('website', 'https://spam.example');
    await submit();
    expect(emitted).toHaveLength(0);
  });

  it('présélectionne le public venu du lien, en ignorant une valeur inconnue', async () => {
    const known = setup('entreprises');
    await known.fixture.whenStable();
    expect(known.root.querySelector<HTMLSelectElement>('#audience')?.value).toBe('entreprises');

    const unknown = setup('inconnu');
    await unknown.fixture.whenStable();
    expect(unknown.root.querySelector<HTMLSelectElement>('#audience')?.value).toBe('');
  });

  it('désactive le bouton et change son libellé pendant l’envoi', async () => {
    const { fixture, root } = setup();
    fixture.componentRef.setInput('sending', true);
    await fixture.whenStable();
    const button = root.querySelector<HTMLButtonElement>('button');
    expect(button?.disabled).toBe(true);
    expect(button?.textContent?.trim()).toBe('Envoi en cours…');
  });
});
