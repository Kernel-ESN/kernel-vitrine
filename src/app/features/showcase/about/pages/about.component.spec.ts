import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('présente la société, ses deux métiers et ses coordonnées', async () => {
    const root = await render();
    expect(root.querySelector('h1')?.textContent).toContain('née au Niger');
    expect([...root.querySelectorAll('.founder__name')].map((n) => n.textContent)).toEqual([
      'Ahmed Abdoulahi',
      'Saratou Anaroua Fodi',
    ]);
    expect(root.querySelector('address a')?.getAttribute('href')).toBe('tel:+22788898282');
  });

  it('affiche les compétences des deux fondateurs', async () => {
    const lists = [...(await render()).querySelectorAll('.founder__skills')];
    expect(lists).toHaveLength(2);
    expect(lists[1].textContent).toContain('Power BI');
  });

  it('montre le portrait de chaque fondateur, avec un texte alternatif', async () => {
    const photos = [...(await render()).querySelectorAll<HTMLImageElement>('.founder__photo')];
    expect(photos.map((p) => p.alt)).toEqual(['Ahmed Abdoulahi', 'Saratou Anaroua Fodi']);
    expect(photos[0].getAttribute('src')).toBe('images/founders/ahmed-abdoulahi.webp');
  });

  it('liste les domaines des collaborateurs, sans nom ni effectif', async () => {
    const root = await render();
    expect(root.querySelectorAll('.collaborators li')).toHaveLength(4);
    expect(root.querySelector('.collaborators')?.textContent).not.toMatch(/\d/);
  });

  it('présente les réalisations comme antérieures à Kernel', async () => {
    const root = await render();
    expect(root.querySelectorAll('.record__item')).toHaveLength(9);
    expect(root.textContent).toContain('Avant Kernel');
    expect(root.textContent).not.toContain('pas de missions de');
  });

  it("n'invente ni client, ni nom, ni chiffre d'équipe", async () => {
    const text = (await render()).textContent ?? '';
    expect(text).not.toMatch(/\d+ (clients|projets|ans|collaborateurs)/);
    expect(text).not.toMatch(
      /SOFTEAM|Galeries Lafayette|ANSES|SUEZ|PALOME|DGALN|DHUP|SYPLO|BALAE|Afuwa|BNIF|Assurance Maladie|CPAM|Sofratel|Olist/i,
    );
  });
});
