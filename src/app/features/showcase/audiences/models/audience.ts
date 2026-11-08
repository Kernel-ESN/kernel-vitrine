import { ExpertiseKey } from '@core/config/navigation';

export interface Audience {
  readonly slug: string;
  readonly tagline: string;
  readonly intro: string;
  readonly scene: string;
  readonly needs: readonly string[];
  readonly responses: Readonly<Record<ExpertiseKey, string>>;
  readonly cta: string;
}
