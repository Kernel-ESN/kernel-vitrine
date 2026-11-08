import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { METHOD_NAV } from '@core/config/navigation';
import { METHOD_STEPS } from '../data-access/method.data';
import { MethodComponent } from './method.component';

describe('MethodComponent', () => {
  it('présente les cinq étapes dans l’ordre et répond à la question du prix', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MethodComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect([...root.querySelectorAll('.step h2')].map((h) => h.textContent)).toEqual([
      'On vous écoute',
      'On regarde ce qui existe',
      'On chiffre un plan',
      'On livre par étapes',
      'On vous rend les clés',
    ]);
    expect(root.querySelector('details summary')?.textContent).toContain('Combien ça coûte');
  });

  it('possède la section visée par chaque entrée du menu, avec le même titre', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MethodComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    for (const item of METHOD_NAV) {
      expect(root.querySelector(`[id="${item.fragment}"]`), item.fragment).not.toBeNull();
    }
    expect(METHOD_NAV.slice(0, METHOD_STEPS.length).map((item) => item.label)).toEqual(
      METHOD_STEPS.map((step) => step.title),
    );
  });
});
