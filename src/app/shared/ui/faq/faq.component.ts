import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Plus } from 'lucide-angular';
import { IconComponent } from '../icon/icon.component';

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'app-faq',
  imports: [IconComponent],
  template: `
    <div class="faq">
      @for (item of items(); track item.question) {
        <details>
          <summary>
            <span>{{ item.question }}</span>
            <app-icon [data]="plus" [size]="24" />
          </summary>
          <p>{{ item.answer }}</p>
        </details>
      }
    </div>
  `,
  styleUrl: './faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  readonly items = input.required<readonly FaqItem[]>();
  protected readonly plus = Plus;
}
