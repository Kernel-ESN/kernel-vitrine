import { ExpertiseContent } from '../models/expertise';

export const EXPERTISES: readonly ExpertiseContent[] = [
  {
    key: 'devops',
    headline: 'Mettre en ligne un mardi après-midi, sans retenir son souffle.',
    intro:
      "Beaucoup d'équipes livrent à la main, le soir, avec un collègue qui surveille. Nous automatisons le chemin du code jusqu'à la production pour qu'une mise à jour devienne une opération banale. Et quand il manque l'application elle-même, nous l'écrivons.",
    services: [
      {
        title: 'Applications web et mobiles',
        text: 'Portail de démarches, outil de gestion interne, application de collecte qui marche hors ligne. Nous écrivons le code, puis nous le maintenons.',
      },
      {
        title: 'Déploiement automatisé',
        text: 'Chaque modification passe par des tests, puis part en production sans manipulation à la main. Et si quelque chose ne va pas, on revient à la version précédente.',
      },
      {
        title: 'Conteneurs et serveurs',
        text: "Vos applications tournent de la même façon sur le poste du développeur et sur le serveur. On n'entend plus « chez moi, ça marche ».",
      },
      {
        title: "Reprise d'un existant",
        text: "Une application vieillissante, un prestataire parti sans laisser de notes. Nous relisons, nous documentons et nous remettons en état avant d'ajouter quoi que ce soit.",
      },
    ],
    deliverables: [
      'Le code source et tous les accès, à votre nom',
      'Une chaîne de déploiement que votre équipe sait relancer',
      "Un guide d'exploitation écrit pour des gens qui n'étaient pas là",
    ],
    faq: [
      {
        question: 'Notre application est vieille. Faut-il tout réécrire ?',
        answer:
          'Rarement. On commence par la stabiliser et la couvrir de tests. La réécriture se justifie pour des parties précises, et nous vous dirons lesquelles.',
      },
      {
        question: 'Notre connexion est mauvaise. Est-ce un obstacle ?',
        answer:
          'Non. Les mises à jour partent du serveur, pas de votre poste. Pour les applications de terrain, nous prévoyons le travail hors ligne et la synchronisation au retour du réseau.',
      },
      {
        question: 'Le code nous appartient-il ?',
        answer: 'Oui. Il est livré dans un dépôt à votre nom, avec sa documentation.',
      },
    ],
    tools: [
      'Angular',
      'Spring Boot',
      'Flutter',
      'Docker',
      'GitLab CI/CD',
      'GitHub Actions',
      'Jenkins',
      'Flyway',
    ],
  },
  {
    key: 'data',
    headline: 'Le bon chiffre, le jour de la réunion.',
    intro:
      'Les données existent presque toujours. Elles dorment dans des fichiers Excel, des registres papier et trois logiciels qui ne se parlent pas. Nous les rassemblons, nous les nettoyons et nous construisons les tableaux que vos équipes ouvriront vraiment.',
    services: [
      {
        title: 'Collecte sur le terrain',
        text: 'Formulaires sur téléphone, avec contrôles à la saisie, position GPS et photos si besoin. Ils fonctionnent sans réseau.',
      },
      {
        title: 'Base de données centrale',
        text: "Un seul endroit pour vos données, avec des règles claires : qui saisit, qui corrige, qui consulte. Les chargements sont automatiques, et des tests signalent une donnée anormale avant qu'elle n'atteigne un tableau.",
      },
      {
        title: 'Tableaux de bord',
        text: "Quelques indicateurs choisis avec ceux qui décident, à jour sans saisie manuelle. Si un chiffre surprend, on peut remonter jusqu'à la ligne d'origine.",
      },
      {
        title: 'Analyse et prévisions',
        text: 'Repérer ce qui change, estimer une demande, détecter une anomalie. Quand un simple tableau suffit à répondre à la question, nous nous arrêtons là.',
      },
    ],
    deliverables: [
      'Une base documentée, avec la définition de chaque indicateur',
      'Des tableaux que vos équipes peuvent modifier',
      "Les traitements écrits, testés et rejouables, pour refaire le calcul l'an prochain",
    ],
    faq: [
      {
        question: 'Nos données sont en désordre. Peut-on quand même commencer ?',
        answer:
          "C'est le cas le plus courant. Le nettoyage fait partie du travail, et il révèle souvent ce qu'il faut changer dans la manière de saisir.",
      },
      {
        question: 'Avons-nous besoin de data science ?',
        answer:
          'Pas toujours. Beaucoup de questions se règlent avec une base propre et un bon tableau. Nous proposons un modèle statistique seulement quand il apporte une réponse que le tableau ne donne pas.',
      },
      {
        question: 'Qui peut voir nos données pendant la mission ?',
        answer:
          "Seules les personnes nommées dans le contrat. Quand c'est possible, nous travaillons sur des données rendues anonymes.",
      },
    ],
    tools: [
      'SQL',
      'Python',
      'pandas',
      'Power BI',
      'dbt',
      'Apache Airflow',
      'Snowflake',
      'Oracle',
      'SQL Server',
      'PostgreSQL',
      'Excel et Power Query',
      'FastAPI',
    ],
  },
  {
    key: 'cloud',
    headline: 'Vos serveurs, au bon endroit et à la bonne taille.',
    intro:
      "Un serveur trop gros coûte cher tous les mois. Un serveur trop petit tombe le jour de la clôture des inscriptions. Et une donnée sensible n'a pas sa place n'importe où. Nous décidons avec vous de ce qui reste chez vous et de ce qui part ailleurs, puis nous le mettons en place.",
    services: [
      {
        title: 'Migration',
        text: 'Déplacer une application ou une messagerie sans arrêter le travail : inventaire, essai à blanc, bascule à une heure choisie et retour possible.',
      },
      {
        title: 'Hébergement local, privé ou hybride',
        text: 'Selon la sensibilité des données : un serveur dans vos murs, un hébergeur sur le territoire, un fournisseur international, ou un mélange des trois.',
      },
      {
        title: 'Sauvegardes testées',
        text: "Une sauvegarde qu'on n'a jamais restaurée n'est qu'un espoir. Nous planifions les copies, nous en gardons une hors site, et nous répétons la restauration.",
      },
      {
        title: 'Surveillance et coûts',
        text: 'Une alerte avant que les disques soient pleins. Une revue de la facture pour éteindre ce qui tourne pour rien.',
      },
    ],
    deliverables: [
      'Un schéma à jour de votre infrastructure',
      'Un plan de reprise écrit, avec la date du dernier essai',
      'Une estimation mensuelle, et ce qui la ferait monter',
    ],
    faq: [
      {
        question: 'Nos données peuvent-elles rester au Niger ?',
        answer:
          "Oui, sur un serveur chez vous ou chez un hébergeur local. Nous regardons d'abord ce que vos obligations exigent, puis ce que chaque option coûte et demande en entretien.",
      },
      {
        question: 'Et les coupures de courant ?',
        answer:
          "Nous en tenons compte dès la conception : onduleurs, arrêt propre des machines, redémarrage automatique et copie hors site. Quand le courant n'est pas fiable, un hébergement externe peut être le meilleur choix.",
      },
      {
        question: 'Combien coûte le cloud par mois ?',
        answer:
          'Cela dépend de ce que vous y mettez. Vous recevez une estimation écrite avant toute migration.',
      },
    ],
    tools: ['AWS', 'OVHcloud', 'Cloudflare', 'Linux', 'Docker', 'Nginx'],
  },
  {
    key: 'cyber',
    headline: "Savoir par où on peut entrer chez vous, avant quelqu'un d'autre.",
    intro:
      "Beaucoup d'incidents commencent par un mot de passe réutilisé, une mise à jour oubliée ou un e-mail piégé. Nous cherchons ces failles chez vous, nous les corrigeons et nous apprenons à vos équipes à repérer les suivantes.",
    services: [
      {
        title: "Audit et tests d'intrusion",
        text: 'Avec votre accord écrit et un périmètre défini, nous attaquons vos systèmes comme le ferait un intrus. Vous recevez la liste des failles, classées par gravité, et la façon de les corriger.',
      },
      {
        title: 'Durcissement',
        text: "Mises à jour, droits d'accès, double authentification, comptes oubliés à fermer. Un travail peu spectaculaire, qui ferme la plupart des portes.",
      },
      {
        title: 'Surveillance et incidents',
        text: 'Des alertes sur les connexions anormales, et une procédure écrite : qui appeler, quoi couper, quoi garder comme preuve.',
      },
      {
        title: 'Formation des équipes',
        text: 'Des séances courtes, avec de vrais exemples de messages frauduleux reçus au Niger. Vos collègues apprennent à reconnaître le piège et à le signaler.',
      },
    ],
    deliverables: [
      'Un rapport lisible par la direction, avec le détail technique en annexe',
      'Une liste de corrections classées par priorité',
      "Une procédure d'incident d'une page, à garder à portée de main",
    ],
    faq: [
      {
        question: 'Nous sommes petits. Sommes-nous vraiment visés ?',
        answer:
          "La plupart des attaques sont automatiques : elles cherchent des portes ouvertes, sans regarder la taille de l'organisation. Une petite structure est souvent moins protégée.",
      },
      {
        question: 'Nous venons de nous faire pirater. Que faire ?',
        answer:
          "Isolez les machines touchées du réseau, sans les éteindre ni les réinstaller, et ne payez rien. Puis appelez-nous : les traces restent utiles pour comprendre ce qui s'est passé.",
      },
      {
        question: 'Un audit peut-il perturber nos services ?',
        answer:
          'Nous fixons ensemble ce qui peut être testé, et à quel moment. Les tests risqués se font en dehors des heures de service, ou sur une copie du système.',
      },
    ],
    tools: ['Spring Security', 'Keycloak', 'OAuth2', 'JWT'],
  },
];
