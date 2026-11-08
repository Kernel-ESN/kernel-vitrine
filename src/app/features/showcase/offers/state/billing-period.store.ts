import { Injectable, signal } from '@angular/core';
import { Period } from '../models/offer';

/** La formule choisie suit le visiteur du catalogue à la commande. L'annuel est proposé d'abord. */
@Injectable({ providedIn: 'root' })
export class BillingPeriodStore {
  readonly period = signal<Period>('an');
}
