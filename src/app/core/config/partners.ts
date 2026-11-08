export interface PartnerLogo {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface Partner {
  readonly name: string;
  readonly text: string;
  // Sans fichier : le logo est composé en texte à partir de `wordmark`.
  readonly logo?: PartnerLogo;
  readonly wordmark?: { readonly main: string; readonly sub: string };
}

// Partenaires cités à la demande de l'utilisateur. Publier ce que fait chacun, pas ses données internes.
export const PARTNERS: readonly Partner[] = [
  {
    name: 'Gaggawa',
    text: 'Livraison de colis en ville à Niamey, commandée depuis une application mobile.',
    logo: { src: 'images/partners/gaggawa.webp', width: 248, height: 46 },
  },
  {
    name: 'Sahel Inter Services',
    text: 'Location de véhicules à la journée à Niamey, avec sa propre flotte et celle de ses partenaires.',
    logo: { src: 'images/partners/sahel-inter-services.webp', width: 391, height: 192 },
  },
  {
    name: 'N.H.H',
    text: 'Commerce général, import-export et représentation commerciale, au Grand Marché de Niamey.',
    logo: { src: 'images/partners/nhh.webp', width: 404, height: 188 },
  },
  {
    name: 'ONG ADL Tanat',
    text: "Créée en 2020, elle travaille à l'intégration des personnes en situation de handicap, des personnes âgées, des femmes et des enfants.",
    wordmark: { main: 'ADL', sub: 'Tanat' },
  },
  {
    name: 'ONG Tagot',
    text: "Basée à Tahoua, elle appuie les populations les plus démunies, notamment pour l'accès à l'eau et le développement local.",
    logo: { src: 'images/partners/tagot.webp', width: 179, height: 192 },
  },
  {
    name: 'Safrna Travel Agency',
    text: 'Agence de voyage en ligne pour le Niger et la zone UEMOA, avec paiement par mobile money.',
    logo: { src: 'images/partners/safrna.webp', width: 159, height: 192 },
  },
];
