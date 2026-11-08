/**
 * Photos de Kernel Consulting, et photos sous licence libre vérifiées sur leur page d'origine.
 * Aucun visage reconnaissable : une licence libre ne couvre pas le droit à l'image.
 */
export interface Photo {
  readonly name: string;
  /** Largeurs disponibles en WebP, dans `public/images/photos`. */
  readonly widths: readonly number[];
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  /** Absents pour une photo fournie par Kernel Consulting. */
  readonly author?: string;
  readonly license?: string;
  readonly licenseUrl?: string;
  readonly source?: string;
}

export const PHOTOS = {
  niameyFleuve: {
    name: 'niamey-fleuve',
    widths: [800, 1600, 2000],
    width: 2000,
    height: 1122,
    alt: 'Niamey vue du ciel : le fleuve Niger, les grands carrefours et les immeubles du centre.',
  },
  niameyPlaceLiptako: {
    name: 'niamey-place-liptako',
    widths: [800, 1600],
    width: 1600,
    height: 1200,
    alt: 'Le rond-point du Liptako-Gourma à Niamey, bordé de lampadaires solaires.',
    author: 'NigerTZai',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr',
    source:
      'https://commons.wikimedia.org/wiki/File:Niger,_Niamey,_Place_du_Liptako-Gourma_(1).jpg',
  },
  routeN4Sahel: {
    name: 'route-n4-sahel',
    widths: [800, 1600],
    width: 1600,
    height: 900,
    alt: 'La route nationale 4, entre Niamey et Téra, traverse une plaine verte du Sahel.',
    author: 'NigerTZai',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr',
    source:
      'https://commons.wikimedia.org/wiki/File:Niger,_Route_N4_near_Sarando_B%C3%A9n%C3%A9.jpg',
  },
  niameyVille: {
    name: 'niamey-ville',
    widths: [800, 1600],
    width: 1600,
    height: 1233,
    alt: 'Niamey vue depuis la Grande Mosquée : une avenue, des voitures et des étals.',
    author: 'Roland Huziaker',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/deed.fr',
    source: 'https://commons.wikimedia.org/wiki/File:Niamey_from_grand_mosque_theatre_2006.jpg',
  },
  villageMaradi: {
    name: 'village-maradi',
    widths: [800, 1600],
    width: 1600,
    height: 953,
    alt: 'Greniers en terre où l’on conserve les oignons, à Maradi.',
    author: 'amylizreed',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.fr',
    source: 'https://commons.wikimedia.org/wiki/File:Village_maradi_niger.jpg',
  },
  telephoneMain: {
    name: 'telephone-main',
    widths: [800, 1024],
    width: 1024,
    height: 681,
    alt: 'Une main tient un téléphone portable.',
    author: 'whiteafrican',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/deed.fr',
    source: 'https://www.flickr.com/photos/18288598@N00/2736563610',
  },
  relectureCode: {
    name: 'relecture-code',
    widths: [800, 960],
    width: 960,
    height: 641,
    alt: 'Deux personnes relisent du code sur un ordinateur portable.',
    author: 'Christina Morillo',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://stocksnap.io/photo/developer-discuss-OEIJJX36TI',
  },
  schemaFlux: {
    name: 'schema-flux',
    widths: [800, 960],
    width: 960,
    height: 640,
    alt: 'Une personne dessine un schéma de flux sur un tableau blanc.',
    author: 'Startup Stock Photos',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://stocksnap.io/photo/flowchart-whiteboard-CDC8HFPYWR',
  },
  salleServeurs: {
    name: 'salle-serveurs',
    widths: [800, 1024],
    width: 1024,
    height: 768,
    alt: 'Une salle de serveurs : des baies alignées, câbles en façade.',
    author: 'rawpixel',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://www.rawpixel.com/image/5912401/image-public-domain-black-technology',
  },
  baieReseau: {
    name: 'baie-reseau',
    widths: [800, 1542],
    width: 1542,
    height: 2048,
    alt: 'Une baie réseau aux câbles emmêlés, en attente d’être remise en ordre.',
    author: 'Moses Cursor Ssebunya',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://wordpress.org/photos/photo/64767dd6fa/',
  },
  planningSemaines: {
    name: 'planning-semaines',
    widths: [800, 960],
    width: 960,
    height: 640,
    alt: 'Un planning semaine par semaine sur un tableau blanc, couvert de notes adhésives.',
    author: 'Startup Stock Photos',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://stocksnap.io/photo/whiteboard-post-itnotes-YR89OQFMT1',
  },
  reunionTravail: {
    name: 'reunion-travail',
    widths: [800, 960],
    width: 960,
    height: 641,
    alt: 'Une réunion de travail autour d’une table, ordinateurs ouverts.',
    author: 'Christina Morillo',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://stocksnap.io/photo/conferenceroom-meeting-GVUWVKUHZE',
  },
  professionnelBureau: {
    name: 'professionnel-bureau',
    widths: [800, 960],
    width: 960,
    height: 640,
    alt: 'Un professionnel sourit à son bureau, devant son ordinateur portable.',
    author: 'Kristin Hardwick',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://stocksnap.io/photo/male-professional-6QXAIH13O6',
  },
  femmeOrdinateur: {
    name: 'femme-ordinateur',
    widths: [800, 960],
    width: 960,
    height: 1438,
    alt: 'Une femme travaille sur son ordinateur portable, assise dans un fauteuil.',
    author: 'Christina Morillo',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://stocksnap.io/photo/woman-working-KXZFG9X7XC',
  },
  developpeuseCode: {
    name: 'developpeuse-code',
    widths: [800, 960],
    width: 960,
    height: 641,
    alt: 'Une développeuse écrit du code sur son ordinateur, téléphone en main.',
    author: 'Christina Morillo',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: 'https://stocksnap.io/photo/woman-developer-HMPNPRBUJ7',
  },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;
