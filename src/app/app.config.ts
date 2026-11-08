import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
  withPreloading,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { provideSmoothAnchors } from '@core/navigation/anchor-scrolling';
import { reloadOnChunkFailure } from '@core/navigation/chunk-failure';
import { LightPreloading } from '@core/navigation/light-preloading';
import { onViewTransition } from '@core/navigation/view-transition';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: onViewTransition,
      }),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withPreloading(LightPreloading),
      withNavigationErrorHandler(reloadOnChunkFailure),
    ),
    provideSmoothAnchors(),
    provideClientHydration(withEventReplay()),
  ],
};
