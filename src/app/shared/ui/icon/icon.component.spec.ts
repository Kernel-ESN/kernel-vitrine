import { TestBed } from '@angular/core/testing';
import { Phone } from 'lucide-angular';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  it('dessine un seul SVG Lucide au trait de la charte, masqué aux lecteurs d’écran', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('data', Phone);
    fixture.componentRef.setInput('size', 32);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const svgs = root.querySelectorAll('svg');

    expect(svgs).toHaveLength(1);
    expect(svgs[0].getAttribute('width')).toBe('32');
    expect(Number(svgs[0].getAttribute('stroke-width')) * (32 / 24)).toBeCloseTo(1.5, 1);
    expect(root.getAttribute('aria-hidden')).toBe('true');
  });
});
