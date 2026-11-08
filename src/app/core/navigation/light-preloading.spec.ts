import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { hasRoomToPreload, LightPreloading } from './light-preloading';

describe('hasRoomToPreload', () => {
  it('précharge si la connexion est inconnue ou correcte', () => {
    expect(hasRoomToPreload(undefined)).toBe(true);
    expect(hasRoomToPreload({ effectiveType: '3g' })).toBe(true);
  });

  it('ne précharge pas en 2G ni en mode économie de données', () => {
    expect(hasRoomToPreload({ effectiveType: '2g' })).toBe(false);
    expect(hasRoomToPreload({ effectiveType: 'slow-2g' })).toBe(false);
    expect(hasRoomToPreload({ saveData: true, effectiveType: '4g' })).toBe(false);
  });
});

describe('LightPreloading', () => {
  it('ne charge pas une route marquée preload: false', () => {
    let loaded = false;
    TestBed.inject(LightPreloading)
      .preload({ data: { preload: false } }, () => {
        loaded = true;
        return of(null);
      })
      .subscribe();
    expect(loaded).toBe(false);
  });

  it('reste silencieux si le fichier ne se charge pas', async () => {
    vi.useFakeTimers();
    const result = firstValueFrom(
      TestBed.inject(LightPreloading).preload({}, () => throwError(() => new Error('réseau'))),
    );
    await vi.advanceTimersByTimeAsync(2000);
    vi.useRealTimers();
    expect(await result).toBeNull();
  });
});
