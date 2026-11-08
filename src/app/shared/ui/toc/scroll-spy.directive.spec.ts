import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollSpyDirective } from './scroll-spy.directive';

@Component({
  imports: [ScrollSpyDirective],
  template: `<div appScrollSpy #spy="scrollSpy">
    <section id="un" data-spy></section>
    <section id="deux" data-spy></section>
    <p>{{ spy.active() }}</p>
  </div>`,
})
class HostComponent {}

describe('ScrollSpyDirective', () => {
  it('part de la première section, même sans observateur d’intersection', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('p')?.textContent).toBe('un');
  });
});
