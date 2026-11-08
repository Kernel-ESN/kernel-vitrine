import { Injectable, signal } from '@angular/core';

/**
 * Élément qui part d'une liste vers sa page, pour la transition d'élément partagé.
 * Seul l'élément cliqué porte un nom : une même annonce affichée deux fois sur une page
 * donnerait deux noms identiques, et le navigateur annulerait la transition.
 */
@Injectable({ providedIn: 'root' })
export class MorphStore {
  /** Identifiant de l'annonce ou de l'organisation ouverte en dernier. */
  readonly active = signal<string | null>(null);
}
