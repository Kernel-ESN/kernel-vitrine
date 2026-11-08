export const FIELD_SCENES: readonly string[] = [
  'Le site du ministère tombe le jour où tout le monde en a besoin.',
  'Les fiches de collecte dorment dans un téléphone à Diffa, et le rapport est dû lundi.',
  'Un seul collègue connaît le mot de passe du serveur. Il est en congé.',
  "Personne n'a jamais testé la sauvegarde. On va le découvrir aujourd'hui.",
];

export const LOCAL_CONDITIONS: readonly { readonly title: string; readonly text: string }[] = [
  {
    title: 'Le réseau qui coupe',
    text: 'Nos applications de terrain continuent de fonctionner hors ligne et se synchronisent au retour de la connexion.',
  },
  {
    title: 'Le courant qui saute',
    text: "On prévoit l'arrêt propre des machines, le redémarrage automatique et une copie des données ailleurs.",
  },
  {
    title: 'Le forfait qui coûte',
    text: "Une page lourde, c'est du crédit dépensé pour vos usagers. Nous comptons les kilo-octets.",
  },
  {
    title: 'Les données qui comptent',
    text: "Pour ce qui est sensible, nous regardons d'abord les solutions hébergées chez vous ou sur le territoire.",
  },
];

/** Chiffres publics et sourcés : ils expliquent nos choix techniques, rien de plus. */
export const NIGER_FIGURES: readonly { readonly value: string; readonly text: string }[] = [
  { value: '23,2 %', text: 'de la population utilisait internet fin 2025.' },
  {
    value: '17,4 millions',
    text: 'de connexions mobiles actives, pour un peu plus de 6 millions d’internautes.',
  },
  {
    value: '71,7 %',
    text: 'de ces connexions sont dites « haut débit » : la 3G et la 4G, quand le réseau suit.',
  },
];

export const NIGER_FIGURES_SOURCE = {
  label: 'DataReportal, Digital 2026 : Niger',
  url: 'https://datareportal.com/reports/digital-2026-niger',
};
