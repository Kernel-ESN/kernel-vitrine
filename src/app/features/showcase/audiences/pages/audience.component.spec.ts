import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUDIENCES } from '../data-access/audiences.data';
import { AudienceComponent } from './audience.component';

describe('AudienceComponent', () => {
  function render(slug: string) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AudienceComponent);
    fixture.componentRef.setInput('slug', slug);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche le contenu du public demandé', () => {
    const root = render('ong');
    expect(root.querySelector('h1')?.textContent).toContain('Le réseau coupe à Diffa');
    expect(root.querySelectorAll('.needs li')).toHaveLength(5);
    expect(root.textContent).toContain('fonctionnent hors ligne');
  });

  it('relie chaque réponse à la page du métier', () => {
    const links = [...render('particuliers').querySelectorAll('.response')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual([
      '/services/devops',
      '/services/data',
      '/services/cloud',
      '/services/cybersecurite',
    ]);
  });

  it('mène au contact avec le public déjà renseigné', () => {
    const cta = render('entreprises').querySelector('.band__primary');
    expect(cta?.textContent?.trim()).toBe('Parler à un ingénieur');
    expect(cta?.getAttribute('href')).toBe('/contact?public=entreprises');
  });

  it('propose les quatre autres publics, sans le public courant', () => {
    const links = [...render('ong').querySelectorAll('.others a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toHaveLength(4);
    expect(links).not.toContain('/ong');
  });

  it('a une page valide pour chaque public', () => {
    for (const audience of AUDIENCES) {
      expect(render(audience.slug).querySelector('h1')?.textContent).toContain(audience.tagline);
    }
  });
});
