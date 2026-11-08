const IGNORED = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'd', 'l', 'pour', 'au']);

/** Deux initiales qui se reconnaissent : « Ministère fictif de la Santé » donne « MF ». */
export function initialsOf(name: string): string {
  const words = name.split(/[\s'’-]+/).filter((word) => word && !IGNORED.has(word.toLowerCase()));
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
