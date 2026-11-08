import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NavigationProgressComponent } from './navigation-progress.component';

@Component({ template: '' })
class BlankComponent {}

describe('NavigationProgressComponent', () => {
  it('montre le fil pendant la navigation et le retire ensuite', async () => {
    let release = (): void => undefined;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'lente',
            component: BlankComponent,
            canActivate: [() => new Promise<boolean>((resolve) => (release = () => resolve(true)))],
          },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(NavigationProgressComponent);
    const root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=navigation-progress]')).toBeNull();

    const done = TestBed.inject(Router).navigateByUrl('/lente');
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    expect(root.querySelector('[data-testid=navigation-progress]')).not.toBeNull();

    release();
    await done;
    fixture.detectChanges();
    expect(root.querySelector('[data-testid=navigation-progress]')).toBeNull();
  });
});
