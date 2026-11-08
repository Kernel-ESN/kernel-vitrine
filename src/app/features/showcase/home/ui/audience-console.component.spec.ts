import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AudienceConsoleComponent } from './audience-console.component';

describe('AudienceConsoleComponent', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AudienceConsoleComponent);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('propose les cinq publics', async () => {
    const { root } = await setup();
    expect(root.querySelectorAll('.choice')).toHaveLength(5);
  });

  it('remplace tout le contenu du terminal et le lien quand on change de public', async () => {
    const { fixture, root } = await setup();
    const output = () => root.querySelector('.console__output')?.textContent ?? '';
    expect(output()).toContain('--pour=etats-institutions');

    root.querySelectorAll<HTMLButtonElement>('.choice')[1].click();
    await fixture.whenStable();

    expect(output()).toContain('--pour=ong');
    expect(output()).toContain('Collecter sur le terrain');
    expect(output()).not.toContain('Ministères');
    expect(output()).not.toContain('Mettre les démarches en ligne');
    expect(root.querySelector('.console__link')?.getAttribute('href')).toBe('/ong');
  });
});
