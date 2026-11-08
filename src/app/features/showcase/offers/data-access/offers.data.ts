import { OFFER_NAV } from '@core/config/navigation';
import { Offer, OfferContent } from '../models/offer';

const DOMAIN_FAQ = {
  question: 'Le nom de domaine sera-t-il à notre nom ?',
  answer:
    'Oui, toujours. Il est enregistré au nom de votre organisation, et vous recevez les accès. Si vous changez un jour de prestataire, il part avec vous.',
};

/**
 * Prix indicatifs PROVISOIRES, à remplacer par la grille de Kernel Consulting. Repères :
 * tarifs publiés par des agences de la région (sites de 250 000 à 1 200 000 FCFA).
 * Les abonnements sont exprimés par mois ; l'annuel en découle (voir ANNUAL_MONTHS_BILLED).
 */
const OFFER_CONTENT: Readonly<Record<string, OfferContent>> = {
  'site-web-ong': {
    headline: 'Montrer vos projets à ceux qui les financent.',
    audience: 'ONG, associations, projets financés par des bailleurs.',
    intro:
      "Un bailleur qui reçoit votre dossier va chercher votre site. Il veut voir où vous travaillez, ce que vous avez fait et vos derniers rapports. Nous construisons un site qui répond à ces questions et s'ouvre vite sur un téléphone en 3G.",
    billing: 'creation-et-abonnement',
    price: { setup: 450_000, monthly: 9_000 },
    includes: [
      'Pages : qui vous êtes, zones d’intervention, projets, actualités, contact',
      'Une fiche par projet : objectifs, zone, période, partenaires, résultats',
      'Rapports et documents à télécharger',
      'Vos offres d’emploi et appels d’offres publiés aussi sur notre plateforme d’annonces',
      'Le nom de domaine et cinq adresses mail la première année',
      'L’hébergement, les sauvegardes et le certificat HTTPS la première année',
      'Une formation pour que votre équipe publie seule',
    ],
    options: [
      'Version anglaise',
      'Carte interactive des zones d’intervention',
      'Collecte de dons par mobile money',
      'Espace réservé aux membres ou au conseil d’administration',
    ],
    fromYou: [
      'Votre logo et, si vous en avez, votre charte graphique',
      'Les textes de présentation : nous pouvons les rédiger avec vous',
      'Des photos de vos projets, avec l’accord des personnes photographiées',
      'Les rapports que vous acceptez de publier',
    ],
    asksDomain: true,
    faq: [
      DOMAIN_FAQ,
      {
        question: 'Pouvons-nous modifier le site nous-mêmes ?',
        answer:
          'Oui. Ajouter une actualité ou un rapport se fait depuis un espace d’administration simple, et la formation est incluse.',
      },
      {
        question: 'Nous avons déjà un site. Pouvez-vous le reprendre ?',
        answer:
          'Oui. Nous récupérons les contenus et le nom de domaine, puis nous basculons sans couper l’ancien site avant que le nouveau soit prêt.',
      },
    ],
  },
  'site-web-entreprise': {
    headline: 'Qu’on vous trouve, et qu’on puisse vous appeler.',
    audience: 'Commerces, cabinets, cliniques, écoles, artisans, hôtels.',
    intro:
      'Avant de passer vous voir, un client cherche votre nom sur son téléphone. Il veut vos services, vos horaires, l’itinéraire et un numéro qui répond. Un site court, rapide et à jour suffit souvent.',
    billing: 'creation-et-abonnement',
    price: { setup: 250_000, monthly: 6_000 },
    includes: [
      'Pages : accueil, services ou produits, à propos, contact',
      'Bouton WhatsApp et appel direct depuis le téléphone',
      'Plan d’accès et horaires d’ouverture',
      'Formulaire de demande de devis ou de rendez-vous',
      'Votre fiche Google, créée ou mise à jour, pour apparaître sur la carte',
      'Le nom de domaine et trois adresses mail la première année',
      'L’hébergement et les sauvegardes la première année',
    ],
    options: [
      'Catalogue de produits avec photos et prix',
      'Prise de rendez-vous en ligne',
      'Version anglaise',
      'Rédaction des textes',
    ],
    fromYou: [
      'Votre logo, ou l’envie d’en créer un',
      'La liste de vos services ou produits',
      'Quelques photos de vos locaux et de votre travail',
    ],
    asksDomain: true,
    faq: [
      DOMAIN_FAQ,
      {
        question: 'Une page Facebook ne suffit-elle pas ?',
        answer:
          'Elle aide, mais elle ne vous appartient pas et elle ne remonte pas dans une recherche comme un site. Le site peut afficher vos dernières publications.',
      },
    ],
  },
  'boutique-en-ligne': {
    headline: 'Vendre en ligne, encaisser comme vos clients paient déjà.',
    audience: 'Commerces, grossistes, créateurs, producteurs.',
    intro:
      'Ici, beaucoup de clients paient par mobile money, et beaucoup préfèrent encore payer à la livraison. Une boutique doit accepter les deux, rester légère et prévenir le vendeur dès qu’une commande arrive.',
    billing: 'creation-et-abonnement',
    price: { setup: 600_000, monthly: 12_000 },
    includes: [
      'Catalogue avec photos, prix, tailles ou variantes',
      'Panier et commande pensés pour le téléphone',
      'Paiement par mobile money et paiement à la livraison',
      'Chaque commande vous est envoyée par WhatsApp et par e-mail',
      'Suivi simple du stock et des commandes',
      'Le nom de domaine, les adresses mail et l’hébergement la première année',
    ],
    options: [
      'Zones et frais de livraison par quartier ou par ville',
      'Codes de réduction',
      'Plusieurs vendeurs ou plusieurs boutiques',
      'Saisie de votre catalogue par notre équipe',
    ],
    fromYou: [
      'Vos produits, avec photos et prix',
      'Un compte marchand mobile money à votre nom : nous montons le dossier avec vous',
      'Vos conditions de livraison et de retour',
    ],
    asksDomain: true,
    faq: [
      {
        question: 'L’argent arrive-t-il chez vous ?',
        answer:
          'Non. Les paiements arrivent directement sur votre compte marchand. Nous ne touchons jamais l’argent de vos ventes.',
      },
      DOMAIN_FAQ,
    ],
  },
  'domaine-et-messagerie': {
    headline: 'Écrire depuis votre nom, pas depuis une adresse gratuite.',
    audience: 'Toute organisation qui écrit à des clients, des bailleurs ou une administration.',
    intro:
      'Une adresse en gmail.com passe mal dans une réponse à un appel d’offres. Nous enregistrons votre nom de domaine, créons vos adresses et réglons ce qu’il faut pour que vos messages n’arrivent pas dans les indésirables.',
    billing: 'abonnement',
    price: { monthly: 3_500 },
    includes: [
      'Recherche d’un nom disponible avec vous',
      'Enregistrement du nom de domaine au nom de votre organisation',
      'Création des adresses, sur le nombre de comptes choisi',
      'Réglages qui évitent les indésirables (SPF, DKIM, DMARC)',
      'Configuration sur les téléphones et les ordinateurs de l’équipe',
      'Renouvellement suivi : le nom n’expire pas par oubli',
    ],
    options: [
      'Reprise des anciens messages',
      'Agenda et contacts partagés',
      'Adresses de groupe, comme contact@ ou recrutement@',
    ],
    fromYou: [
      'Les noms souhaités, par ordre de préférence',
      'La liste des personnes qui auront une adresse',
    ],
    asksDomain: true,
    faq: [
      DOMAIN_FAQ,
      {
        question: 'Faut-il prendre un nom en .ne ?',
        answer:
          'Ce n’est pas obligatoire. Le .ne coûte nettement plus cher que le .com ou le .org chez la plupart des bureaux d’enregistrement. Nous vous donnons le prix exact de chaque extension avant de commander.',
      },
    ],
  },
  'integration-ia': {
    headline: 'Faire lire, trier et résumer par la machine, sous votre contrôle.',
    audience:
      'Administrations, ONG et entreprises qui reçoivent beaucoup de documents et de demandes.',
    intro:
      'Des centaines de courriers, de rapports et de demandes à lire chaque mois. Un modèle de langage peut retrouver la bonne réponse dans vos documents, classer les demandes entrantes ou extraire les données d’un formulaire scanné. Nous l’installons sur vos données, avec une personne qui valide avant tout envoi.',
    billing: 'devis',
    price: { onQuote: true },
    includes: [
      'Un atelier pour choisir les tâches où l’IA fait gagner du temps, et celles où elle n’a pas sa place',
      'Un assistant qui répond à partir de vos documents, en citant la page d’origine',
      'Le tri et le résumé des demandes entrantes : e-mails, formulaires, courriers scannés',
      'L’extraction des données de documents scannés vers vos tableaux',
      'Une validation humaine avant tout envoi ou décision',
      'Le choix de l’hébergement du modèle selon la sensibilité de vos données',
    ],
    options: [
      'Réponses en français et en anglais',
      'Accès par WhatsApp',
      'Modèle hébergé sur vos propres serveurs',
      'Formation des équipes à l’usage de l’IA',
    ],
    fromYou: [
      'Des exemples des documents ou des demandes à traiter',
      'Une personne qui juge la qualité des réponses pendant les essais',
    ],
    asksDomain: false,
    faq: [
      {
        question: 'Nos données partent-elles chez un fournisseur d’IA ?',
        answer:
          'Pas sans votre accord. Pour les données sensibles, nous utilisons un modèle hébergé chez vous ou sur un serveur que vous contrôlez.',
      },
      {
        question: 'L’IA peut-elle se tromper ?',
        answer:
          'Oui. C’est pourquoi chaque réponse cite sa source et qu’une personne valide avant tout envoi. Nous mesurons les erreurs pendant les essais, avant la mise en service.',
      },
    ],
  },
  automatisation: {
    headline: 'Ce qui se fait à la main chaque semaine, une machine peut le faire chaque nuit.',
    audience:
      'Équipes informatiques, services statistiques, projets qui produisent des rapports réguliers.',
    intro:
      'Une mise en production faite à la main un vendredi soir. Un rapport mensuel recopié depuis trois fichiers Excel. Nous automatisons ces chaînes : le code passe ses tests et part en production seul, les données sont collectées, nettoyées et publiées à heure fixe, et vous êtes prévenu quand quelque chose échoue.',
    billing: 'devis',
    price: { onQuote: true },
    includes: [
      'L’inventaire des tâches répétitives et du temps qu’elles prennent',
      'Une chaîne d’intégration et de déploiement : tests, construction, mise en production',
      'Des traitements de données planifiés : collecte, nettoyage, publication',
      'Des alertes par e-mail ou WhatsApp en cas d’échec',
      'Le retour à la version précédente en une opération',
      'La documentation, pour que votre équipe modifie les chaînes elle-même',
    ],
    options: [
      'Tableaux de bord mis à jour automatiquement',
      'Rapports aux bailleurs produits à date fixe',
      'Restauration des sauvegardes vérifiée automatiquement',
    ],
    fromYou: [
      'Les accès à vos dépôts de code ou à vos fichiers de données',
      'La liste des tâches que vous refaites chaque semaine',
    ],
    asksDomain: false,
    faq: [
      {
        question: 'Faut-il changer nos outils ?',
        answer:
          'Rarement. Nous automatisons d’abord avec ce que vous avez : GitLab, GitHub, un serveur, des fichiers Excel. Un changement d’outil se discute seulement s’il fait gagner du temps.',
      },
    ],
  },
  numerisation: {
    headline: 'Du registre papier à la démarche en ligne, même en partant de zéro.',
    audience:
      'Ministères, collectivités, écoles, cliniques et entreprises qui travaillent encore sur papier.',
    intro:
      'Un dossier qui passe de bureau en bureau, un registre qu’une seule personne sait consulter, des usagers qui reviennent trois fois au guichet. Nous partons de votre façon de travailler, puis nous mettons en ligne les démarches, les circuits de validation et les archives, étape par étape, sans arrêter le service.',
    billing: 'devis',
    price: { onQuote: true },
    includes: [
      'L’étude du circuit actuel, sur place, avec les agents qui le font vivre',
      'Des formulaires en ligne qui fonctionnent sur téléphone',
      'Des circuits de validation : qui reçoit, qui signe, dans quel délai',
      'La numérisation et l’indexation des archives papier utiles',
      'Le suivi du dossier par l’usager, par SMS ou en ligne',
      'La formation des agents et un guide d’utilisation',
    ],
    options: [
      'Paiement des frais par mobile money',
      'Signature électronique',
      'Saisie au guichet pour les usagers sans téléphone',
    ],
    fromYou: [
      'Les formulaires et registres actuels',
      'Un responsable du service qui arbitre les choix',
    ],
    asksDomain: false,
    faq: [
      {
        question: 'Et les usagers qui n’ont pas internet ?',
        answer:
          'Le guichet reste ouvert. L’agent saisit la démarche pour l’usager, et le dossier suit le même circuit.',
      },
      {
        question: 'Nous partons de zéro, sans informatique. Est-ce possible ?',
        answer:
          'Oui. Nous commençons par le matériel et les comptes, puis par une seule démarche. Les suivantes s’ajoutent quand la première fonctionne.',
      },
    ],
  },
  'hebergement-gere': {
    headline: 'Votre site reste en ligne, et quelqu’un s’en occupe.',
    audience: 'Organisations dont le site a été fait par nous ou par un autre prestataire.',
    intro:
      'Un site sans entretien finit par tomber, être piraté ou disparaître parce qu’une facture n’a pas été payée. L’abonnement couvre le serveur, les copies de sécurité et les mises à jour, avec un compte rendu chaque mois.',
    billing: 'abonnement',
    price: { monthly: 10_000 },
    includes: [
      'Le serveur et le certificat HTTPS',
      'Une sauvegarde chaque jour, avec une copie hors site',
      'Une restauration d’essai régulière',
      'Les mises à jour de sécurité',
      'Une surveillance qui nous alerte si le site ne répond plus',
      'Un compte rendu mensuel',
    ],
    options: [
      'Hébergement des données au Niger quand c’est exigé',
      'Serveur réservé à votre organisation',
    ],
    fromYou: ['Les accès actuels du site et du nom de domaine, si nous reprenons un existant'],
    asksDomain: false,
    faq: [
      {
        question: 'Notre site a été fait par quelqu’un d’autre. Est-ce possible ?',
        answer:
          'Oui. Nous l’examinons d’abord, puis nous vous disons ce qu’il faut remettre en état avant de le reprendre.',
      },
    ],
  },
  maintenance: {
    headline: 'Un numéro à appeler quand le site a besoin d’un changement.',
    audience: 'Organisations qui n’ont pas de développeur dans l’équipe.',
    intro:
      'Une page à modifier, un formulaire qui ne part plus, une nouvelle rubrique avant un événement. Vous écrivez ou vous envoyez un message WhatsApp, et la demande est traitée et suivie.',
    billing: 'abonnement',
    price: { monthly: 25_000 },
    includes: [
      'Corrections des anomalies',
      'Petites évolutions, dans un volume d’heures fixé au contrat',
      'Mises à jour de contenu à votre demande',
      'Suivi écrit de chaque demande',
    ],
    options: ['Astreinte pendant un événement ou une campagne'],
    fromYou: ['Un interlocuteur désigné dans votre équipe'],
    asksDomain: false,
    faq: [
      {
        question: 'Et si nous dépassons le volume prévu ?',
        answer: 'Nous vous prévenons avant, avec le prix du travail supplémentaire.',
      },
    ],
  },
  'collecte-hors-ligne': {
    headline: 'Des données de terrain qui arrivent, même sans réseau.',
    audience: 'ONG, services de santé, projets de développement, bureaux d’études.',
    intro:
      'Les enquêteurs saisissent sur un téléphone Android, hors connexion. Les fiches partent dès que le réseau revient, et le tableau de bord se met à jour. Plus de papier à ressaisir, plus de fichier perdu dans un téléphone.',
    billing: 'unique',
    price: { setup: 500_000 },
    includes: [
      'Formulaires avec contrôles à la saisie, position GPS et photos',
      'Fonctionnement complet sans réseau, synchronisation au retour',
      'Une base centrale, avec qui voit quoi',
      'Un tableau de bord des indicateurs du projet',
      'Exports pour vos rapports aux bailleurs',
      'Formation des enquêteurs et des superviseurs',
    ],
    options: [
      'Saisie en langue nationale',
      'Envoi de SMS de rappel',
      'Hébergement des données au Niger',
    ],
    fromYou: ['Vos questionnaires actuels', 'La liste des indicateurs attendus par le bailleur'],
    asksDomain: false,
    faq: [
      {
        question: 'Quels téléphones faut-il ?',
        answer:
          'Des téléphones Android ordinaires suffisent. Nous vérifions les vôtres avant de lancer la collecte.',
      },
    ],
  },
  'outil-de-gestion': {
    headline: 'Sortir du cahier et du fichier Excel partagé.',
    audience: 'Écoles, cliniques, commerces, coopératives, administrations.',
    intro:
      'Gestion des stocks, inscriptions et frais de scolarité, dossiers des patients, adhérents d’une coopérative. Nous construisons l’outil autour de votre façon de travailler, et il fonctionne même quand la connexion est faible.',
    billing: 'creation-et-abonnement',
    price: { setup: 800_000, monthly: 15_000 },
    includes: [
      'Étude de votre façon de travailler, sur place',
      'Un outil sur ordinateur et sur téléphone',
      'Comptes et droits par personne',
      'Reprise de vos fichiers Excel existants',
      'Formation des utilisateurs',
      'Hébergement, sauvegardes et maintenance la première année',
    ],
    options: ['Paiements par mobile money', 'Envoi de SMS', 'Fonctionnement hors ligne'],
    fromYou: ['Vos fichiers et documents actuels', 'Une personne de référence dans l’équipe'],
    asksDomain: false,
    faq: [
      {
        question: 'Le logiciel nous appartient-il ?',
        answer: 'Oui. Le code et les données sont à votre nom, avec la documentation.',
      },
    ],
  },
  'protection-du-bureau': {
    headline: 'Un ordinateur volé ne doit pas emporter vos dossiers.',
    audience: 'Bureaux de cinq à cinquante personnes.',
    intro:
      'Nous faisons l’inventaire des postes et des comptes, nous fermons ce qui est ouvert et nous mettons en place une sauvegarde qui fonctionne. Puis nous expliquons à l’équipe comment reconnaître un faux message.',
    billing: 'unique',
    price: { setup: 200_000 },
    includes: [
      'Inventaire des postes, des comptes et des accès',
      'Mises à jour et protection des postes',
      'Double authentification sur les comptes importants',
      'Sauvegarde automatique, avec une copie hors du bureau',
      'Wi-Fi séparé pour les visiteurs',
      'Séance de sensibilisation aux faux messages pour l’équipe',
    ],
    options: ['Suivi trimestriel par abonnement', 'Chiffrement des ordinateurs portables'],
    fromYou: ['L’accès aux postes, en présence d’une personne de l’équipe'],
    asksDomain: false,
    faq: [
      {
        question: 'Allez-vous voir nos fichiers ?',
        answer:
          'Non. Nous travaillons sur les réglages, pas sur le contenu. Les règles d’accès sont écrites dans le contrat.',
      },
    ],
  },
};

export const OFFERS: readonly Offer[] = OFFER_NAV.map((nav) => ({
  nav,
  content: OFFER_CONTENT[nav.slug],
}));

export const offerBySlug = (slug: string): Offer | undefined =>
  OFFERS.find((offer) => offer.nav.slug === slug);

/** Ce que comprend chaque offre, quelle qu'elle soit. */
export const ALWAYS_INCLUDED: readonly { readonly title: string; readonly text: string }[] = [
  {
    title: 'À votre nom',
    text: 'Le nom de domaine, les comptes et le code sont enregistrés au nom de votre organisation.',
  },
  {
    title: 'Un prix écrit avant de payer',
    text: 'Vous recevez un devis détaillé, avec ce qui est compris et ce qui ne l’est pas.',
  },
  {
    title: 'Pensé pour le téléphone',
    text: 'Chaque page est testée sur un téléphone ordinaire, avec une connexion lente.',
  },
  {
    title: 'Une équipe qui répond',
    text: 'Par téléphone, par e-mail ou par WhatsApp, avec quelqu’un qui connaît votre dossier.',
  },
];

export type ComparisonValue = boolean | string;

/** Comparatif des trois offres de site : chaque valeur reprend ce que dit la fiche de l'offre. */
export const SITE_COMPARISON: {
  readonly slugs: readonly string[];
  readonly rows: readonly { readonly label: string; readonly values: readonly ComparisonValue[] }[];
} = {
  slugs: ['site-web-entreprise', 'site-web-ong', 'boutique-en-ligne'],
  rows: [
    { label: 'Pages de présentation', values: [true, true, false] },
    { label: 'Bouton WhatsApp et appel direct', values: [true, false, false] },
    { label: 'Commandes reçues par WhatsApp', values: [false, false, true] },
    { label: 'Fiches projets et rapports à télécharger', values: [false, true, false] },
    { label: 'Catalogue de produits', values: ['En option', false, true] },
    { label: 'Paiement par mobile money', values: [false, 'Dons, en option', true] },
    { label: 'Nom de domaine, la première année', values: [true, true, true] },
    { label: 'Adresses mail, la première année', values: ['3 adresses', '5 adresses', 'Incluses'] },
    { label: 'Hébergement et sauvegardes, la première année', values: [true, true, true] },
    { label: 'Formation de votre équipe', values: [false, true, false] },
  ],
};
