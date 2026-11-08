import { buildDots, tooSlow } from './signal-field.component';

describe('champ de signal', () => {
  it('prépare une trame qui couvre la surface, atténuée loin de la source', () => {
    const dots = buildDots(220, 110);
    expect(dots).toHaveLength(50);
    const origin = dots.reduce((best, dot) => (dot.distance < best.distance ? dot : best));
    const farthest = dots.reduce((best, dot) => (dot.distance > best.distance ? dot : best));
    expect(origin.falloff).toBeGreaterThan(farthest.falloff);
    expect(dots.every((dot) => dot.falloff >= 0 && dot.falloff <= 1)).toBe(true);
  });

  it("fige l'animation seulement si la moyenne des images dépasse le budget", () => {
    expect(tooSlow(Array.from({ length: 10 }, () => 50))).toBe(false);
    expect(tooSlow(Array.from({ length: 20 }, () => 5))).toBe(false);
    expect(tooSlow(Array.from({ length: 20 }, () => 13))).toBe(true);
  });
});
