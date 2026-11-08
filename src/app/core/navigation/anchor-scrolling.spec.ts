import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideSmoothAnchors } from './anchor-scrolling';

@Component({ template: '' })
class BlankComponent {}

describe('provideSmoothAnchors', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: BlankComponent },
          { path: 'autre', component: BlankComponent },
        ]),
        provideSmoothAnchors(),
      ],
    });
    return TestBed.inject(Router);
  }
  const isSmooth = () => document.documentElement.classList.contains('smooth-anchors');

  afterEach(() => document.documentElement.classList.remove('smooth-anchors'));

  it('anime une ancre de la page en cours', async () => {
    const router = setup();
    await router.navigateByUrl('/');
    await router.navigateByUrl('/#clients');
    expect(isSmooth()).toBe(true);
  });

  it('arrête les ancres sous l’en-tête fixe, quelle que soit sa hauteur', () => {
    // L'environnement de test ne calcule aucune mise en page : la hauteur est simulée.
    let height = 100;
    const header = document.createElement('app-site-header');
    vi.spyOn(header, 'getBoundingClientRect').mockImplementation(() => ({ height }) as DOMRect);
    document.body.appendChild(header);
    setup();
    const scroller = TestBed.inject(ViewportScroller);
    const offset = (scroller as unknown as { offset: () => [number, number] }).offset;
    expect(offset()).toEqual([0, 116]);
    height = 60;
    expect(offset()).toEqual([0, 76]);
    header.remove();
  });

  it("n'anime pas le passage à une autre page, même avec une ancre", async () => {
    const router = setup();
    await router.navigateByUrl('/#clients');
    await router.navigateByUrl('/autre');
    expect(isSmooth()).toBe(false);
    await router.navigateByUrl('/#clients');
    expect(isSmooth()).toBe(false);
  });
});
