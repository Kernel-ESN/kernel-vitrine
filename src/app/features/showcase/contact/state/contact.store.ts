import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactGateway } from '../data-access/contact.gateway';
import { ContactRequest } from '../models/contact-request';

export type ContactStatus = 'idle' | 'sending' | 'sent' | 'error';

@Injectable()
export class ContactStore {
  private readonly gateway = inject(ContactGateway);
  private readonly destroyRef = inject(DestroyRef);

  readonly available = this.gateway.available;
  readonly status = signal<ContactStatus>('idle');

  submit(request: ContactRequest): void {
    if (!this.available || this.status() === 'sending' || this.status() === 'sent') {
      return;
    }
    this.status.set('sending');
    this.gateway
      .send(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.status.set('sent'),
        error: () => this.status.set('error'),
      });
  }
}
