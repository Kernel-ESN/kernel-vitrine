import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { initialsOf } from '@shared/text/initials';
import { EmptyStateComponent } from './empty-state.component';
import { PanelComponent } from './panel.component';
import { WorkspaceComponent } from './workspace.component';

@Component({
  imports: [WorkspaceComponent, PanelComponent, EmptyStateComponent],
  template: `<app-workspace
    eyebrow="Espace candidat"
    heading="Awa Moussa"
    subtitle="awa@example.org"
    mark="Awa Moussa"
    headingTestId="who"
    [sections]="sections"
  >
    <button workspaceActions type="button">Action</button>
    <p workspaceAside class="aside-slot">Compteurs</p>
    <app-panel id="un" data-spy index="01" heading="Premier" lead="Une phrase.">
      <button panelActions type="button">Modifier</button>
      <p class="body-slot">Contenu</p>
    </app-panel>
    <app-panel id="deux" data-spy index="02" heading="Second">
      <app-empty-state message="Rien pour le moment." />
    </app-panel>
  </app-workspace>`,
})
class HostComponent {
  readonly sections = [
    { id: 'un', label: 'Premier' },
    { id: 'deux', label: 'Second' },
  ];
}

@Component({
  imports: [WorkspaceComponent],
  template: `<app-workspace eyebrow="Alertes" heading="Mes alertes"><p>Seul</p></app-workspace>`,
})
class SingleHostComponent {}

describe('initialsOf', () => {
  it('ignore les petits mots et garde deux lettres', () => {
    expect(initialsOf('Ministère de la Santé publique')).toBe('MS');
    expect(initialsOf('awa')).toBe('A');
  });
});

describe('WorkspaceComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('place chaque contenu projeté dans sa zone', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('[data-testid="who"]')?.textContent?.trim()).toBe('Awa Moussa');
    expect(el.querySelector('.identity__mark')?.textContent?.trim()).toBe('AM');
    expect(el.querySelector('.band__actions button')?.textContent).toBe('Action');
    expect(el.querySelector('.layout__aside .aside-slot')).not.toBeNull();
    expect(el.querySelectorAll('.layout__aside app-toc a')).toHaveLength(2);
    expect(el.querySelector('.layout__body .body-slot')).not.toBeNull();
  });

  it('passe en une colonne sans sommaire quand aucune section n’est donnée', async () => {
    const fixture = TestBed.createComponent(SingleHostComponent);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.layout--single')).not.toBeNull();
    expect(el.querySelector('.layout__aside')).toBeNull();
    expect(el.querySelector('.identity__mark')).toBeNull();
  });
});

describe('PanelComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('relie la section à son titre et garde l’ancre sur l’hôte', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const panel = (fixture.nativeElement as HTMLElement).querySelector('app-panel#un')!;
    const section = panel.querySelector('section')!;
    const title = panel.querySelector('h2')!;

    expect(panel.hasAttribute('data-spy')).toBe(true);
    expect(section.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.textContent).toBe('Premier');
    expect(panel.querySelector('.panel__lead')?.textContent).toBe('Une phrase.');
    expect(panel.querySelector('.panel__head button')?.textContent).toBe('Modifier');
  });

  it('affiche l’état vide avec son message', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const empty = (fixture.nativeElement as HTMLElement).querySelector('app-panel#deux .empty');
    expect(empty?.textContent).toContain('Rien pour le moment.');
  });
});
