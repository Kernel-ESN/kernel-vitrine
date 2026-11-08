import { InjectionToken } from '@angular/core';

/** Heure courante, injectable pour que les dates limites restent testables. */
export const CLOCK = new InjectionToken<() => Date>('CLOCK', { factory: () => () => new Date() });
