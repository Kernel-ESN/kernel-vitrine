import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

/** Fil discret pendant un changement de page. Il n'apparaît que si l'attente se voit. */
@Component({
  selector: 'app-navigation-progress',
  template: `@if (navigating()) {
    <div class="progress" data-testid="navigation-progress" aria-hidden="true"></div>
  }`,
  styles: `
    .progress {
      position: fixed;
      inset: 0 0 auto;
      z-index: 100;
      height: 2px;
      background: var(--color-kernel);
      transform-origin: left;
      animation: progress 1200ms var(--ease) 200ms both;
    }
    @keyframes progress {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(0.85);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationProgressComponent {
  private readonly router = inject(Router);

  protected readonly navigating = computed(() => this.router.currentNavigation() !== null);
}
