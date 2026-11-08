export interface Founder {
  readonly photo: string;
  readonly name: string;
  readonly role: string;
  readonly bio: readonly string[];
  readonly skills: readonly string[];
}

export interface CollaboratorDomain {
  readonly title: string;
  readonly text: string;
}

export interface TrackRecordItem {
  readonly figure: string;
  readonly text: string;
}

// Règle : aucun nom de client ni d'employeur sur le site.
export const FOUNDERS: readonly Founder[] = [
  {
    photo: 'images/founders/ahmed-abdoulahi.webp',
    name: 'Ahmed Abdoulahi',
    role: 'Cofondateur. Développement, cloud et exploitation',
    bio: [
      'Ingénieur en informatique, diplômé de Sup Galilée (Université Sorbonne Paris Nord) après un cycle à la FST de Tanger. Certifié AWS Cloud Practitioner.',
      "En mission, Ahmed développe des applications Java et Angular pour le secteur public et le commerce, et construit les chaînes qui les amènent jusqu'en production. Ses projets personnels l'ont amené à intégrer le mobile money et à faire tourner ses propres plateformes en production.",
      'Il travaille en français et en anglais, et parle aussi tamajaght, tamasghalalt et arabe.',
    ],
    skills: [
      'Java',
      'Spring Boot',
      'Angular',
      'Flutter',
      'Python',
      'GitLab CI/CD',
      'GitHub Actions',
      'Docker',
      'AWS',
      'Linux',
      'PostgreSQL',
      'Flyway',
      'Keycloak',
    ],
  },
  {
    photo: 'images/founders/saratou-anaroua-fodi.webp',
    name: 'Saratou Anaroua Fodi',
    role: 'Cofondatrice. Ingénieure Data Sciences',
    bio: [
      "Titulaire d'un master en systèmes d'information et aide à la décision, parcours Data Science, de l'Université de Lille, après des études d'économie à Kénitra et à Dijon.",
      'En poste, Saratou traduit les besoins des métiers en indicateurs et en tableaux de bord, écrit les requêtes SQL qui les alimentent sur de grandes bases et contrôle ce qui en sort : écarts, anomalies, fiabilité.',
      'Elle a aussi mené des enquêtes pour des clients, du questionnaire à la présentation des résultats, et construit ses propres chaînes de données automatisées.',
    ],
    skills: [
      'SQL',
      'Power BI',
      'DAX',
      'Python',
      'pandas',
      'NumPy',
      'dbt',
      'Apache Airflow',
      'Snowflake',
      'Oracle',
      'SQL Server',
      'Docker',
      'GitHub Actions',
      'Excel avancé',
      'Power Query',
      'VBA',
    ],
  },
];

// Domaines seulement : ni nom ni effectif tant que l'utilisateur ne les a pas fournis.
export const COLLABORATOR_DOMAINS: readonly CollaboratorDomain[] = [
  {
    title: 'Développement mobile',
    text: 'Des applications sur Android et iOS, y compris pour les équipes qui travaillent loin du réseau.',
  },
  {
    title: 'Cybersécurité',
    text: "Tests d'intrusion, durcissement des systèmes et conduite à tenir le jour d'un incident.",
  },
  {
    title: "Assistance à maîtrise d'ouvrage",
    text: 'Cadrer le besoin avec vos services, écrire le cahier des charges et vérifier ce qui est livré.',
  },
  {
    title: 'Architecture',
    text: 'Décider comment un système est découpé et hébergé, avant que le code ne fige ces choix.',
  },
];

export const TRACK_RECORD: readonly TrackRecordItem[] = [
  {
    figure: '3 × 3',
    text: "Trois applications livrées sur trois environnements par une même chaîne d'intégration continue, pour une administration.",
  },
  {
    figure: '6 services',
    text: 'Une plateforme entière mise en conteneurs : serveurs applicatifs, bases de données et migrations.',
  },
  {
    figure: '½ journée',
    text: "Le temps d'installation d'un nouveau développeur, contre plusieurs jours avant, grâce à un guide technique de 20 pages.",
  },
  {
    figure: '65 tests',
    text: 'Une chaîne de données complète sur un jeu public de commerce en ligne : chargement vers Snowflake, modèles dbt testés, orchestration Airflow, intégration continue et tableau de bord Power BI.',
  },
  {
    figure: 'Java 21',
    text: 'Une application du secteur public migrée depuis Java 8, avec reprise de la compatibilité et du code.',
  },
  {
    figure: 'Safrna',
    text: "Une plateforme de réservation de billets d'avion pour l'Afrique de l'Ouest : API, mobile, web, paiements mobile money et carte, conçue et exploitée en autonomie.",
  },
  {
    figure: 'UEMOA',
    text: "Le backend d'une solution de paiement mobile pour la zone UEMOA, avec gestion transactionnelle des portefeuilles, déployé sur AWS.",
  },
  {
    figure: 'Power BI',
    text: "Des tableaux de bord de suivi opérationnel construits sur de grandes bases de données, depuis le recueil du besoin jusqu'à l'analyse des écarts.",
  },
  {
    figure: 'Enquêtes',
    text: 'Des enquêtes conduites pour des clients : questionnaire, collecte, nettoyage des réponses, rapport et présentation des résultats.',
  },
];
