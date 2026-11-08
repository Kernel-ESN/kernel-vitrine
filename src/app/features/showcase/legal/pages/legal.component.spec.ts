import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PHOTOS } from '@shared/ui/photo/photos';
import { CREDITS, LegalComponent, originOf } from './legal.component';

describe('LegalComponent', () => {
  async function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LegalComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it("présente l'éditeur et son téléphone, sans inventer d'immatriculation", async () => {
    const root = await render();
    expect(root.querySelector('h1')?.textContent).toContain('Mentions légales');
    expect(root.querySelector('a[href="tel:+22788898282"]')).not.toBeNull();
    expect(root.textContent).not.toMatch(/RCCM|NIF|capital/i);
  });

  it('relie chaque entrée du sommaire à une section, la première étant marquée', async () => {
    const root = await render();
    const links = [...root.querySelectorAll<HTMLAnchorElement>('app-toc a')];
    expect(links).toHaveLength(5);
    for (const link of links) {
      const id = link.getAttribute('href')!.split('#')[1];
      expect(root.querySelector(`section#${id}[data-spy]`), id).not.toBeNull();
    }
    expect(links[0].getAttribute('aria-current')).toBe('location');
    expect(links[1].getAttribute('aria-current')).toBeNull();
  });

  it('présente une ligne de tableau par photo créditée, sans ponctuation doublée', async () => {
    const root = await render();
    const rows = root.querySelectorAll('[data-testid=photo-credit]');
    expect(rows.length).toBe(CREDITS.length);
    expect(root.querySelector('[data-testid=photo-credits]')?.textContent).not.toContain('. :');
  });
});

describe('crédits photographiques', () => {
  it('crédite chaque photo libre, avec sa licence et son origine', () => {
    const credited = Object.values(PHOTOS).filter((item) => 'author' in item);
    expect(CREDITS.length).toBe(credited.length);
    for (const credit of CREDITS) {
      expect(credit.author, credit.name).toBeTruthy();
      expect(credit.licenseUrl, credit.name).toMatch(/^https:\/\/creativecommons\.org\//);
      expect(credit.subject.endsWith('.'), credit.name).toBe(false);
      expect(credit.origin, credit.name).not.toContain('.');
    }
  });

  it('reconnaît la plateforme d’origine', () => {
    expect(originOf('https://commons.wikimedia.org/wiki/File:X.jpg')).toBe('Wikimedia Commons');
    expect(originOf('https://stocksnap.io/photo/x')).toBe('StockSnap');
    expect(originOf('https://wordpress.org/photos/photo/x/')).toBe('WordPress Photos');
  });
});
