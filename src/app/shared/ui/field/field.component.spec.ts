import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FIELD } from './field.component';
import { FocusInvalidDirective } from './focus-invalid.directive';

@Component({
  imports: [...FIELD, FocusInvalidDirective, ReactiveFormsModule],
  template: `<form appFocusInvalid [formGroup]="form" (ngSubmit)="form.markAllAsTouched()">
    <app-field controlId="nom" label="Nom" note="obligatoire" hint="Aide" error="Indiquez un nom.">
      <input appControl formControlName="name" />
    </app-field>
    <app-field
      controlId="tel"
      label="Téléphone"
      describedBy="groupe"
      [externalError]="external()"
      [markInvalid]="marked()"
    >
      <input appControl formControlName="phone" />
    </app-field>
    <button type="submit">Envoyer</button>
  </form>`,
})
class HostComponent {
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    phone: new FormControl('', { nonNullable: true }),
  });
  readonly external = signal<string | null>(null);
  readonly marked = signal(false);
}

describe('FieldComponent', () => {
  async function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    return { fixture, root, input: () => root.querySelector<HTMLInputElement>('#nom')! };
  }

  it('relie le libellé et l’aide au contrôle, sans erreur au départ', async () => {
    const { root, input } = await setup();
    expect(root.querySelector('label[for=nom]')?.textContent).toContain('Nom');
    expect(root.querySelector('label[for=nom]')?.textContent).toContain('(obligatoire)');
    expect(input().classList.contains('control')).toBe(true);
    expect(input().getAttribute('aria-invalid')).toBe('false');
    expect(input().getAttribute('aria-describedby')).toBe('nom-hint');
    expect(root.querySelector('#nom-error')).toBeNull();
  });

  it('montre l’erreur après envoi et la relie au contrôle, puis la retire', async () => {
    const { fixture, root, input } = await setup();
    root.querySelector('button')!.click();
    await fixture.whenStable();
    expect(root.querySelector('#nom-error')?.textContent).toContain('Indiquez un nom.');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(input().getAttribute('aria-describedby')).toBe('nom-error nom-hint');

    input().value = 'Awa';
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('#nom-error')).toBeNull();
    expect(input().getAttribute('aria-invalid')).toBe('false');
  });

  it('place le focus sur le premier champ à corriger', async () => {
    const { fixture, root, input } = await setup();
    root.querySelector('button')!.click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(input());
  });

  it('accepte une erreur décidée par le formulaire, ou une erreur de groupe', async () => {
    const { fixture, root } = await setup();
    const phone = () => root.querySelector<HTMLInputElement>('#tel')!;
    fixture.componentInstance.marked.set(true);
    await fixture.whenStable();
    expect(phone().getAttribute('aria-invalid')).toBe('true');
    expect(phone().getAttribute('aria-describedby')).toBe('groupe');

    fixture.componentInstance.marked.set(false);
    fixture.componentInstance.external.set('Numéro requis.');
    await fixture.whenStable();
    expect(root.querySelector('#tel-error')?.textContent).toContain('Numéro requis.');
    expect(phone().getAttribute('aria-describedby')).toBe('tel-error');
  });
});
