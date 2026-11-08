import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ExpertiseDetailComponent } from './expertise-detail.component';

describe('ExpertiseDetailComponent', () => {
  function render(slug: string) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ExpertiseDetailComponent);
    fixture.componentRef.setInput('slug', slug);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche les services, les livrables et les questions du métier', () => {
    const root = render('cloud');
    expect(root.querySelector('h1')?.textContent).toContain('Vos serveurs, au bon endroit');
    expect(root.querySelectorAll('.service')).toHaveLength(4);
    expect(root.querySelectorAll('.deliverables li')).toHaveLength(3);
    expect(root.querySelector('details summary')?.textContent).toContain('rester au Niger');
  });

  it('liste les outils du métier', () => {
    expect(render('cybersecurite').querySelector('.tools')?.textContent).toContain('Keycloak');
  });

  it('propose les trois autres métiers', () => {
    const links = [...render('data').querySelectorAll('.others a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual(['/services/devops', '/services/cloud', '/services/cybersecurite']);
  });
});
