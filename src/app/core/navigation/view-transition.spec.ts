import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';
import { onViewTransition } from './view-transition';

describe('onViewTransition', () => {
  /** Comme le routeur : une racine commune, et la page au bout de la chaîne. */
  const atPage = (path: string, config = { path }) =>
    ({
      routeConfig: null,
      firstChild: { routeConfig: config, firstChild: null },
    }) as unknown as ActivatedRouteSnapshot;
  const list = { path: 'marches' };
  const hasClass = () => document.documentElement.classList.contains('instant-transition');

  function run(from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot, finished: Promise<void>) {
    const transition = { finished } as unknown as ViewTransition;
    TestBed.runInInjectionContext(() =>
      onViewTransition({ transition, from, to } as ViewTransitionInfo),
    );
  }

  afterEach(() => document.documentElement.classList.remove('instant-transition'));

  it('retire le fondu sur la même page, puis le rétablit', async () => {
    let end = (): void => undefined;
    run(
      atPage('marches', list),
      atPage('marches', list),
      new Promise<void>((resolve) => (end = resolve)),
    );
    expect(hasClass()).toBe(true);
    end();
    await Promise.resolve();
    await Promise.resolve();
    expect(hasClass()).toBe(false);
  });

  it('rétablit le fondu même si la transition échoue', async () => {
    run(atPage('marches', list), atPage('marches', list), Promise.reject(new Error('interrompue')));
    await Promise.resolve();
    await Promise.resolve();
    expect(hasClass()).toBe(false);
  });

  it('garde le fondu entre deux pages, même si leur racine est commune', () => {
    run(atPage('marches'), atPage('emplois'), Promise.resolve());
    expect(hasClass()).toBe(false);
  });
});
