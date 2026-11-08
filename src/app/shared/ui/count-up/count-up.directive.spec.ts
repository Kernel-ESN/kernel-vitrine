import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CountUpDirective, formatFigure, parseFigure } from './count-up.directive';

@Component({
  imports: [CountUpDirective],
  template: `<p appCountUp>23,2 %</p>`,
})
class HostComponent {}

describe('CountUpDirective', () => {
  it('lit la valeur, ses décimales et la suite du texte', () => {
    expect(parseFigure('23,2 %')).toEqual({ value: 23.2, decimals: 1, suffix: ' %' });
    expect(parseFigure('17,4 millions')).toEqual({ value: 17.4, decimals: 1, suffix: ' millions' });
    expect(parseFigure('12')).toEqual({ value: 12, decimals: 0, suffix: '' });
    expect(parseFigure('Niamey')).toBeNull();
  });

  it('écrit les décimales à la française', () => {
    expect(formatFigure(71.7, 1)).toBe('71,7');
    expect(formatFigure(3, 0)).toBe('3');
  });

  it('garde la valeur finale quand l’animation est impossible', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('23,2 %');
  });
});
