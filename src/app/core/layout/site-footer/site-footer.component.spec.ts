import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteFooterComponent } from './site-footer.component';

describe('SiteFooterComponent', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SiteFooterComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche la localisation et un numéro de téléphone cliquable', () => {
    const contact = render().querySelector('address');
    const phone = contact?.querySelector('a');
    expect(contact?.textContent).toContain('Niamey, Niger');
    expect(phone?.textContent?.trim()).toBe('+227 88 89 82 82');
    expect(phone?.getAttribute('href')).toBe('tel:+22788898282');
  });

  it('relie toutes les pages du site', () => {
    const links = [...render().querySelectorAll('a')].map((a) => a.getAttribute('href'));
    for (const path of ['/services/cybersecurite', '/ong', '/methode', '/a-propos', '/contact']) {
      expect(links).toContain(path);
    }
  });

  it('utilise le logo pour fond Nuit', () => {
    expect(render().querySelector('app-logo')?.classList.contains('logo--night')).toBe(true);
  });

  it("n'expose aucune adresse e-mail", () => {
    const root = render();
    expect(root.textContent).not.toContain('@');
    expect(root.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
