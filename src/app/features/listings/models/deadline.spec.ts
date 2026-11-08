import {
  deadlineLabel,
  formatDay,
  formatMoney,
  formatSize,
  isExpired,
  isUrgent,
  publishedLabel,
} from './deadline';

const NOW = new Date('2026-11-06T10:00:00Z');

describe('dates limites', () => {
  it('annonce le temps restant', () => {
    expect(deadlineLabel('2026-11-16T22:59:59Z', NOW)).toBe('Reste 11 jours');
    expect(deadlineLabel('2026-11-06T22:59:59Z', NOW)).toBe("Expire aujourd'hui");
  });

  it('marque une annonce expirée dès que la limite est passée', () => {
    expect(isExpired('2026-11-06T09:59:00Z', NOW)).toBe(true);
    expect(deadlineLabel('2026-11-05T22:59:59Z', NOW)).toBe('Expirée');
  });

  it('signale une urgence à trois jours, pas au-delà, ni après expiration', () => {
    expect(isUrgent('2026-11-09T09:00:00Z', NOW)).toBe(true);
    expect(isUrgent('2026-11-12T09:00:00Z', NOW)).toBe(false);
    expect(isUrgent('2026-11-01T09:00:00Z', NOW)).toBe(false);
  });

  it('affiche la date à l’heure de Niamey', () => {
    expect(formatDay('2026-11-30T23:30:00Z')).toBe('1 décembre 2026');
  });
});

describe('formats', () => {
  it('écrit les montants et les tailles à la française', () => {
    expect(formatMoney(12500000, 'FCFA').replace(/\s/g, ' ')).toBe('12 500 000 FCFA');
    expect(formatSize(842)).toBe('1 Ko');
    expect(formatSize(1_500_000)).toBe('1,5 Mo');
  });
});

describe('publishedLabel', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  it('dit la fraîcheur d’une annonce récente, puis sa date', () => {
    expect(publishedLabel('2026-11-06T08:00:00Z', now)).toBe('Publiée aujourd’hui');
    expect(publishedLabel('2026-11-05T08:00:00Z', now)).toBe('Publiée hier');
    expect(publishedLabel('2026-11-01T08:00:00Z', now)).toBe('Publiée il y a 5 jours');
    expect(publishedLabel('2026-09-01T08:00:00Z', now)).toBe('Publiée le 1 septembre 2026');
  });
});
