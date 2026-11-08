import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStore } from '@core/data/local-store';
import { User } from '../models/user';

const KEY = 'kernel.sample.session';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly store = inject(LocalStore);

  readonly user = signal<User | null>(this.store.read<User | null>(KEY, null));
  readonly loggedIn = computed(() => this.user() !== null);

  open(user: User): void {
    this.user.set(user);
    this.store.write(KEY, user);
  }

  close(): void {
    this.user.set(null);
    this.store.write(KEY, null);
  }
}
