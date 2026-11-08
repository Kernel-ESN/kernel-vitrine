import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("affiche l'accroche et les deux actions principales", async () => {
    const root = await render();
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Des systèmes qui tiennent, même quand le réseau lâche.',
    );
    const actions = [...root.querySelectorAll('.hero__actions a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(actions).toEqual(['/contact', '/methode']);
  });

  it('relie les quatre métiers dès le premier écran', async () => {
    const links = [...(await render()).querySelectorAll('.hero__strip a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual([
      '/services/devops',
      '/services/data',
      '/services/cloud',
      '/services/cybersecurite',
    ]);
  });

  it('contient toutes les sections de la page dans l’ordre', async () => {
    const titles = [...(await render()).querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(titles).toEqual([
      "Ce qui arrive quand personne ne s'occupe du système.",
      'Le code, la base, le serveur et les accès, regardés par la même équipe.',
      'Les demandes les plus courantes, avec un prix de départ affiché.',
      'Vous êtes…',
      "Au Niger, le site se consulte d'abord sur un téléphone.",
      "Construit pour les conditions d'ici.",
      'Vous savez toujours où on en est, et combien ça coûte.',
      'Vous parlez à ceux qui font le travail.',
      'Ceux pour qui nous avons travaillé.',
      'Dites-nous ce qui bloque.',
    ]);
  });

  it('expose la section ciblée par le lien « Comparer les besoins »', async () => {
    expect((await render()).querySelector('#clients app-audience-console')).not.toBeNull();
  });
});
