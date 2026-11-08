import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { Link2, MessageCircle } from 'lucide-angular';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LISTINGS_TEXT } from '../listings.text';

export const whatsappLink = (title: string, url: string): string =>
  `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

@Component({
  selector: 'app-share-actions',
  imports: [IconComponent],
  templateUrl: './share-actions.component.html',
  styleUrl: './share-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareActionsComponent {
  readonly title = input.required<string>();

  protected readonly text = LISTINGS_TEXT.detail;
  protected readonly icons = { whatsapp: MessageCircle, link: Link2 };
  protected readonly feedback = signal('');
  /** L'adresse n'est connue que dans le navigateur : le domaine n'est pas encore décidé. */
  private readonly url = signal('');
  protected readonly whatsapp = computed(() => whatsappLink(this.title(), this.url()));

  constructor() {
    afterNextRender(() => this.url.set(location.href));
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.url());
      this.feedback.set(this.text.copied);
    } catch {
      this.feedback.set(this.text.copyFailed);
    }
  }
}
