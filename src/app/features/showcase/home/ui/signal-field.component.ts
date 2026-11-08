import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';

const SPACING = 22;
const CYCLE_MS = 14000;
/** L'onde est lente : 20 images par seconde suffisent, et divisent le travail par trois. */
const FRAME_MS = 50;
/** Au-delà, l'appareil est trop lent pour une décoration : on fige l'image. */
const MAX_FRAME_COST_MS = 12;
const COST_SAMPLES = 20;

export interface SignalDot {
  readonly x: number;
  readonly y: number;
  readonly distance: number;
  readonly falloff: number;
}

/** Position et atténuation de chaque point : ne changent qu'au redimensionnement. */
export function buildDots(width: number, height: number): readonly SignalDot[] {
  const originX = width * 0.78;
  const originY = height * 0.42;
  const reach = Math.max(width, height) * 0.85;
  const dots: SignalDot[] = [];
  for (let y = SPACING / 2; y < height; y += SPACING) {
    for (let x = SPACING / 2; x < width; x += SPACING) {
      const distance = Math.hypot(x - originX, y - originY);
      dots.push({ x, y, distance, falloff: Math.max(0, 1 - distance / reach) });
    }
  }
  return dots;
}

/** Vrai quand la moyenne des dernières images dépasse le budget. */
export const tooSlow = (costs: readonly number[]): boolean =>
  costs.length >= COST_SAMPLES &&
  costs.reduce((total, cost) => total + cost, 0) / costs.length > MAX_FRAME_COST_MS;

/**
 * Trame de points traversée par un signal parti de Niamey. Le signal faiblit, coupe, puis
 * revient : c'est la promesse de la page. Décoratif : figé si le visiteur réduit les animations
 * ou active l'économie de données, en pause hors écran.
 */
@Component({
  selector: 'app-signal-field',
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      display: block;
      overflow: hidden;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFieldComponent {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.start());
  }

  private start(): void {
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      connection?.saveData === true;

    const color = getComputedStyle(canvas).getPropertyValue('--color-kernel').trim() || '#5ab4ec';
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let frame = 0;
    let timer = 0;
    let visible = true;
    let dots: readonly SignalDot[] = [];
    const costs: number[] = [];

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = buildDots(width, height);
      if (still) {
        draw(2600);
      }
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      const phase = (time % CYCLE_MS) / CYCLE_MS;
      // Le signal tient, s'éteint vers 70 % du cycle, puis repart.
      const strength =
        phase < 0.62 ? 1 : phase < 0.72 ? (0.72 - phase) * 10 : phase < 0.8 ? 0 : (phase - 0.8) * 5;

      const signal = Math.min(strength, 1);
      const pointerActive = pointerX > -9999;
      for (const dot of dots) {
        const wave = (Math.sin(dot.distance * 0.022 - time * 0.0016) + 1) / 2;
        const near = pointerActive
          ? Math.max(0, 1 - Math.hypot(dot.x - pointerX, dot.y - pointerY) / 150)
          : 0;
        const level = 0.1 + wave * wave * dot.falloff * 0.85 * signal + near * 0.6;
        context.globalAlpha = Math.min(level, 0.9);
        const size = 1.2 + level * 2;
        context.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
      }
      context.globalAlpha = 1;
    };

    const schedule = () => {
      timer = window.setTimeout(() => {
        frame = requestAnimationFrame(loop);
      }, FRAME_MS);
    };

    const loop = (time: number) => {
      if (visible && !document.hidden) {
        const start = performance.now();
        draw(time);
        costs.push(performance.now() - start);
        if (costs.length > COST_SAMPLES) {
          costs.shift();
        }
        if (tooSlow(costs)) {
          return;
        }
      }
      schedule();
    };

    const onPointer = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointerX = event.clientX - box.left;
      pointerY = event.clientY - box.top;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    visibility.observe(canvas);

    const section = canvas.closest('section');
    if (!still) {
      section?.addEventListener('pointermove', onPointer, { passive: true });
      frame = requestAnimationFrame(loop);
    }

    this.destroyRef.onDestroy(() => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      section?.removeEventListener('pointermove', onPointer);
    });
  }
}
