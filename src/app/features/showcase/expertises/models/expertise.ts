import { ExpertiseKey } from '@core/config/navigation';

export interface ExpertiseContent {
  readonly key: ExpertiseKey;
  readonly headline: string;
  readonly intro: string;
  readonly services: readonly { readonly title: string; readonly text: string }[];
  readonly deliverables: readonly string[];
  readonly faq: readonly { readonly question: string; readonly answer: string }[];
  readonly tools: readonly string[];
}
