import { TestBed } from '@angular/core/testing';
import { ShareActionsComponent, whatsappLink } from './share-actions.component';

describe('ShareActionsComponent', () => {
  it('encode le titre et le lien pour WhatsApp', () => {
    expect(whatsappLink('Comptable & aide', 'https://x.test/a')).toBe(
      'https://wa.me/?text=Comptable%20%26%20aide%20https%3A%2F%2Fx.test%2Fa',
    );
  });

  it('confirme la copie du lien, et dit si elle échoue', async () => {
    const fixture = TestBed.createComponent(ShareActionsComponent);
    fixture.componentRef.setInput('title', 'Annonce');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const feedback = () => root.querySelector('[data-testid=share-feedback]')?.textContent;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
    root.querySelector<HTMLButtonElement>('[data-testid=copy-link]')!.click();
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
    expect(feedback()).toContain('Lien copié');

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('refus')) },
    });
    root.querySelector<HTMLButtonElement>('[data-testid=copy-link]')!.click();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    expect(feedback()).toContain('Copie impossible');
  });
});
