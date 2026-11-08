import { TestBed } from '@angular/core/testing';
import { PartnersComponent } from './partners.component';

describe('PartnersComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(PartnersComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('présente les six partenaires', () => {
    const names = [...render().querySelectorAll('.partner__name')].map((n) => n.textContent);
    expect(names).toEqual([
      'Gaggawa',
      'Sahel Inter Services',
      'N.H.H',
      'ONG ADL Tanat',
      'ONG Tagot',
      'Safrna Travel Agency',
    ]);
  });

  it('donne un texte alternatif à chaque logo image', () => {
    const images = [...render().querySelectorAll('img')];
    expect(images).toHaveLength(5);
    expect(images.every((image) => image.alt.startsWith('Logo '))).toBe(true);
  });

  it('compose le logo ADL avec Tanat en dessous', () => {
    const mark = render().querySelector('.partner__wordmark');
    expect(mark?.querySelector('.partner__wordmark-main')?.textContent).toBe('ADL');
    expect(mark?.querySelector('.partner__wordmark-sub')?.textContent).toBe('Tanat');
  });

  it("ne publie ni donnée interne ni coordonnée d'un partenaire", () => {
    expect(render().textContent).not.toMatch(
      /simulé|préproduction|AmanaTa|Flyvora|Himadou|NE-NIM|97793992|92793992|FCFA/i,
    );
  });
});
