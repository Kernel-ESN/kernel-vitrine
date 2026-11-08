import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KernelCoreComponent } from './kernel-core.component';

describe('KernelCoreComponent', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(KernelCoreComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const tabs = () => [...root.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    return { fixture, root, tabs };
  }

  it('affiche la première couche au départ, seule atteignable au clavier', async () => {
    const { root, tabs } = await setup();
    expect(root.querySelector('.panel__headline')?.textContent).toContain(
      'Mettre en ligne un mardi',
    );
    expect(root.querySelector('.panel__more')?.getAttribute('href')).toBe('/services/devops');
    expect(tabs().map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it('relie onglets et panneau comme le modèle d’onglets du W3C', async () => {
    const { root, tabs } = await setup();
    const panel = root.querySelector('[role=tabpanel]')!;
    expect(root.querySelector('[role=tablist]')?.getAttribute('aria-orientation')).toBe('vertical');
    expect(tabs()[0].getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs()[0].id);
  });

  it('change la couche au clic', async () => {
    const { fixture, root, tabs } = await setup();
    tabs()[3].click();
    await fixture.whenStable();
    expect(root.querySelector('.panel__headline')?.textContent).toContain(
      'Savoir par où on peut entrer',
    );
    expect(tabs()[3].getAttribute('aria-selected')).toBe('true');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('false');
  });

  it('se parcourt aux flèches, avec retour au début et touches Début et Fin', async () => {
    const { fixture, tabs } = await setup();
    // Le focus n'existe que dans le document : le composant y est attaché pour ce test.
    document.body.appendChild(fixture.nativeElement);
    // Le CDK lit le code numérique de la touche, comme les navigateurs le fournissent.
    const codes: Readonly<Record<string, number>> = { ArrowDown: 40, End: 35, Home: 36 };
    const press = async (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true });
      Object.defineProperty(event, 'keyCode', { value: codes[key] });
      document.activeElement!.dispatchEvent(event);
      await fixture.whenStable();
    };
    tabs()[0].focus();
    await press('ArrowDown');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    await press('End');
    expect(tabs()[3].getAttribute('aria-selected')).toBe('true');
    await press('ArrowDown');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    await press('End');
    await press('Home');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs()[0].tabIndex).toBe(0);
    fixture.nativeElement.remove();
  });
});
