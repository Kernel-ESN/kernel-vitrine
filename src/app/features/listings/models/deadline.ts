const DAY_MS = 86_400_000;
const NIAMEY = 'Africa/Niamey';

const dayFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: NIAMEY,
});

const moneyFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** Une date limite court jusqu'à la fin de sa journée à Niamey. */
export function daysLeft(deadline: string, now: Date): number {
  return Math.ceil((new Date(deadline).getTime() - now.getTime()) / DAY_MS);
}

export function isExpired(deadline: string, now: Date): boolean {
  return new Date(deadline).getTime() < now.getTime();
}

export function deadlineLabel(deadline: string, now: Date): string {
  if (isExpired(deadline, now)) {
    return 'Expirée';
  }
  const days = daysLeft(deadline, now);
  if (days <= 1) {
    return "Expire aujourd'hui";
  }
  return `Reste ${days} jours`;
}

/** Une offre récente se repère d'un coup d'œil ; au-delà d'un mois, la date suffit. */
export function publishedLabel(published: string, now: Date): string {
  const days = Math.floor((now.getTime() - new Date(published).getTime()) / DAY_MS);
  if (days <= 0) {
    return 'Publiée aujourd’hui';
  }
  if (days === 1) {
    return 'Publiée hier';
  }
  return days < 30 ? `Publiée il y a ${days} jours` : `Publiée le ${formatDay(published)}`;
}

export const isUrgent = (deadline: string, now: Date): boolean =>
  !isExpired(deadline, now) && daysLeft(deadline, now) <= 3;

export const formatDay = (date: string): string => dayFormat.format(new Date(date));

export const formatMoney = (amount: number, currency: string): string =>
  `${moneyFormat.format(amount)} ${currency}`;

export function formatSize(bytes: number): string {
  return bytes < 1_000_000
    ? `${Math.max(1, Math.round(bytes / 1000))} Ko`
    : `${(bytes / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;
}
