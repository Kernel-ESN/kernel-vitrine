import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ExpertisesComponent } from './expertises.component';

describe('ExpertisesComponent', () => {
  it('relie les quatre métiers à leur page, avec leur accroche', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ExpertisesComponent);
    fixture.detectChanges();
    const rows = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.row')];

    expect(rows.map((row) => row.getAttribute('href'))).toEqual([
      '/services/devops',
      '/services/data',
      '/services/cloud',
      '/services/cybersecurite',
    ]);
    expect(rows[1].textContent).toContain('Le bon chiffre, le jour de la réunion.');
  });
});
