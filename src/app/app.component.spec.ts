import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

// Ces tests chargent de vraies pages à la demande : marge prévue pour une machine chargée.
vi.setConfig({ testTimeout: 30_000 });

describe('AppComponent', () => {
  async function renderAt(url: string) {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes, withComponentInputBinding())],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("affiche l'accueil entre l'en-tête et le pied de page", async () => {
    const root = await renderAt('/');
    expect(root.querySelector('main h1')?.textContent).toContain('Des systèmes qui tiennent');
    expect(root.querySelector('header nav')).not.toBeNull();
    expect(root.querySelector('footer address')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Kernel Consulting | Ingénierie informatique à Niamey',
    );
  });

  it('affiche la page introuvable sur une adresse inconnue', async () => {
    const root = await renderAt('/adresse-inconnue');
    expect(root.querySelector('main h1')?.textContent).toBe("Cette page n'existe pas.");
    expect(root.querySelector('main a[href="/"]')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Page introuvable | Kernel Consulting');
  });

  it('génère une page par public avec son titre et son contenu', async () => {
    const root = await renderAt('/particuliers');
    expect(root.querySelector('main h1')?.textContent).toContain('Vous avez un projet');
    expect(TestBed.inject(Title).getTitle()).toBe('Particuliers | Kernel Consulting');
  });

  it('génère une page par métier et les pages de la société', async () => {
    const root = await renderAt('/services/data');
    expect(root.querySelector('main h1')?.textContent).toContain('Le bon chiffre');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/methode');
    expect(TestBed.inject(Title).getTitle()).toBe('Méthode | Kernel Consulting');
    await router.navigateByUrl('/a-propos');
    expect(TestBed.inject(Title).getTitle()).toBe('À propos | Kernel Consulting');
  });

  it('place le focus sur le contenu avec le lien d’évitement', async () => {
    const root = await renderAt('/');
    document.body.appendChild(root);
    root.querySelector<HTMLAnchorElement>('.skip-link')?.click();
    expect(document.activeElement).toBe(root.querySelector('main'));
    root.remove();
  });
});
