import { AUDIENCE_NAV, EXPERTISE_NAV, PLATFORM_NAV } from '@core/config/navigation';
import { PARTNERS } from '@core/config/partners';
import { OFFERS } from '@features/showcase/offers/data-access/offers.data';
import { OFFERS_TEXT } from '@features/showcase/offers/offers.text';
import { MODERATION_TEXT } from '@features/admin/moderation.text';
import { ACCOUNT_TEXT } from '@features/account/account.text';
import { ALERTS_TEXT } from '@features/alerts/alerts.text';
import { AUTH_TEXT } from '@features/auth/auth.text';
import { EMPLOYER_TEXT } from '@features/employer/employer.text';
import { LISTINGS_TEXT } from '@features/listings/listings.text';
import {
  COLLABORATOR_DOMAINS,
  FOUNDERS,
  TRACK_RECORD,
} from '@features/showcase/about/data-access/founders.data';
import { AUDIENCES } from '@features/showcase/audiences/data-access/audiences.data';
import { EXPERTISES } from '@features/showcase/expertises/data-access/expertises.data';
import { FIELD_SCENES, LOCAL_CONDITIONS } from '@features/showcase/home/data-access/home.data';
import { METHOD_STEPS } from '@features/showcase/method/data-access/method.data';

const BANNED = [
  'holistique',
  'sur mesure',
  'de bout en bout',
  'au cœur de',
  'transformation digitale',
  'à la pointe',
  'solutions innovantes',
  "n'hésitez pas",
  'leader',
  'excellence',
  'synergie',
  'écosystème',
  'accompagn',
  'sans compromis',
];

describe('ton des textes', () => {
  const corpus = JSON.stringify([
    AUDIENCE_NAV,
    EXPERTISE_NAV,
    PLATFORM_NAV,
    AUDIENCES,
    EXPERTISES,
    FIELD_SCENES,
    LOCAL_CONDITIONS,
    METHOD_STEPS,
    FOUNDERS,
    COLLABORATOR_DOMAINS,
    PARTNERS,
    LISTINGS_TEXT,
    ALERTS_TEXT,
    AUTH_TEXT,
    ACCOUNT_TEXT,
    EMPLOYER_TEXT,
    MODERATION_TEXT,
    OFFERS_TEXT,
    OFFERS.map((offer) => offer.content),
    TRACK_RECORD,
  ]);

  it.each(BANNED)('n’utilise pas la formule « %s »', (phrase) => {
    expect(corpus.toLowerCase()).not.toContain(phrase);
  });

  it('ne contient ni point d’exclamation, ni tiret long, ni emoji', () => {
    expect(corpus).not.toMatch(/[!—\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it('ne cite aucun client ni employeur', () => {
    expect(corpus).not.toMatch(
      /SOFTEAM|Galeries Lafayette|ANSES|SUEZ|PALOME|DGALN|DHUP|SYPLO|BALAE|Afuwa|BNIF|LIPN|Assurance Maladie|CPAM|Sofratel|Olist/i,
    );
  });
});
