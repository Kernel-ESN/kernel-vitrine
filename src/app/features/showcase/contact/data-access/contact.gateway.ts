import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable, throwError, timeout } from 'rxjs';
import { ContactRequest } from '../models/contact-request';

/**
 * URL publique de la fonction serverless d'envoi. Vide tant qu'elle n'est pas déployée :
 * le formulaire annonce alors que l'envoi n'est pas actif. Aucun secret ni adresse e-mail ici.
 */
export const CONTACT_ENDPOINT = new InjectionToken<string>('CONTACT_ENDPOINT', {
  factory: () => '',
});

const SEND_TIMEOUT_MS = 20_000;

export abstract class ContactGateway {
  abstract readonly available: boolean;
  abstract send(request: ContactRequest): Observable<void>;
}

@Injectable()
export class HttpContactGateway extends ContactGateway {
  private readonly http = inject(HttpClient);
  private readonly endpoint = inject(CONTACT_ENDPOINT);

  readonly available = this.endpoint.length > 0;

  send(request: ContactRequest): Observable<void> {
    if (!this.available) {
      return throwError(() => new Error("Le service d'envoi n'est pas configuré."));
    }
    return this.http.post(this.endpoint, request, { responseType: 'text' }).pipe(
      timeout(SEND_TIMEOUT_MS),
      map(() => undefined),
    );
  }
}
