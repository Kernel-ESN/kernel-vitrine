import { TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  function render(variant?: 'default' | 'night') {
    const fixture = TestBed.createComponent(LogoComponent);
    if (variant) {
      fixture.componentRef.setInput('variant', variant);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('écrit « kerne » et remplace le « l » par le curseur', () => {
    const root = render();
    expect(root.querySelector('.logo__name')?.textContent?.trim()).toBe('kerne');
    expect(root.querySelector('[data-testid="logo-cursor"]')).not.toBeNull();
    expect(root.querySelector('.logo__tagline')?.textContent).toBe('CONSULTING');
  });

  it('expose le vrai nom de la marque aux lecteurs d’écran', () => {
    const image = render().querySelector('[role="img"]');
    expect(image?.getAttribute('aria-label')).toBe('Kernel Consulting');
  });

  it('applique la version pour fond Nuit uniquement quand elle est demandée', () => {
    expect(render().classList.contains('logo--night')).toBe(false);
    expect(render('night').classList.contains('logo--night')).toBe(true);
  });
});
