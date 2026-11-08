import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/http/api';
import { Observable, of } from 'rxjs';
import { CLOCK } from '@core/data/clock';
import { LocalStore } from '@core/data/local-store';
import { SessionStore } from '@features/auth/state/session.store';
import { Alert, NewAlert } from '../models/alert';

export abstract class AlertsApi {
  abstract list(): Observable<readonly Alert[]>;
  abstract create(alert: NewAlert): Observable<Alert>;
  abstract remove(id: string): Observable<void>;
}

const KEY = 'kernel.sample.alerts';

/** Simulation : les alertes restent dans ce navigateur et aucun envoi n'a lieu (phase 4). */
@Injectable()
export class SampleAlertsApi extends AlertsApi {
  private readonly store = inject(LocalStore);
  private readonly now = inject(CLOCK);
  private readonly session = inject(SessionStore);

  list(): Observable<readonly Alert[]> {
    return of(this.store.read<readonly Alert[]>(KEY, []));
  }

  create(alert: NewAlert): Observable<Alert> {
    const created: Alert = {
      ...alert,
      email: this.session.user()?.email ?? '',
      id: `alert-${this.now().getTime()}`,
      createdAt: this.now().toISOString(),
    };
    this.store.write(KEY, [created, ...this.store.read<readonly Alert[]>(KEY, [])]);
    return of(created);
  }

  remove(id: string): Observable<void> {
    this.store.write(
      KEY,
      this.store.read<readonly Alert[]>(KEY, []).filter((a) => a.id !== id),
    );
    return of(undefined);
  }
}

@Injectable()
export class HttpAlertsApi extends AlertsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/alerts`;

  list(): Observable<readonly Alert[]> {
    return this.http.get<readonly Alert[]>(this.url);
  }

  create(alert: NewAlert): Observable<Alert> {
    return this.http.post<Alert>(this.url, alert);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
