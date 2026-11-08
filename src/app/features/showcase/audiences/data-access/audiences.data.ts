import { Audience } from '../models/audience';

export const AUDIENCES: readonly Audience[] = [
  {
    slug: 'etats-institutions',
    tagline: "Un service public ne ferme pas parce qu'un serveur est tombé.",
    intro:
      "Le citoyen qui vient chercher un acte ne connaît rien à votre infrastructure. Il voit seulement si le guichet répond. Pour un ministère, une collectivité ou une agence, l'informatique est devenue une partie du service rendu.",
    scene:
      "Une plateforme d'inscription ouvre lundi matin. À neuf heures, tout le pays se connecte en même temps. C'est ce jour-là qu'on sait si le système a été préparé.",
    needs: [
      'Mettre les démarches en ligne sans laisser de côté ceux qui viennent encore au guichet',
      'Savoir exactement où sont stockées les données des citoyens, et qui peut les lire',
      'Continuer à servir pendant une panne, puis repartir sans rien perdre',
      "Disposer de chiffres que le ministre peut citer sans crainte d'être contredit",
      'Ne plus dépendre du seul fournisseur qui connaît le système',
    ],
    responses: {
      devops:
        'Portails de démarches livrés par étapes, testés avant chaque mise en production et mis à jour sans fermer le service.',
      data: 'Registres, état civil, statistiques : des bases propres et des tableaux de pilotage que les directions peuvent ouvrir elles-mêmes.',
      cloud:
        'Hébergement dans vos murs, sur le territoire ou en hybride selon la sensibilité des données, avec un plan de reprise écrit et répété.',
      cyber:
        "Audit de l'existant, surveillance des accès, mise en conformité et formation des agents aux pièges courants.",
    },
    cta: 'Planifier un diagnostic',
  },
  {
    slug: 'ong',
    tagline: 'Le réseau coupe à Diffa. Le rapport au bailleur reste dû vendredi.',
    intro:
      "Vos équipes travaillent loin du bureau, parfois sans connexion, avec des listes de bénéficiaires qui ne doivent tomber entre aucune mauvaise main. Vos outils doivent suivre ce rythme, sans réclamer un service informatique que vous n'avez pas.",
    scene:
      'Une enquêtrice remplit ses fiches sur téléphone pendant trois jours sans réseau. Le soir de son retour en ville, tout remonte seul, et le tableau du siège se met à jour.',
    needs: [
      'Collecter sur le terrain, même après plusieurs jours sans réseau',
      "Protéger l'identité des bénéficiaires, y compris si un téléphone est perdu",
      'Sortir les indicateurs du bailleur sans une semaine de copier-coller',
      'Faire travailler Niamey, les antennes et le siège sur les mêmes fichiers',
      "Connaître le coût mensuel à l'avance, pour le mettre au budget du projet",
    ],
    responses: {
      devops:
        'Applications de collecte qui fonctionnent hors ligne et se synchronisent quand le réseau revient.',
      data: "Suivi-évaluation, indicateurs d'impact et rapports aux formats demandés par chaque bailleur.",
      cloud:
        'Un espace de travail commun, accessible depuis les antennes, avec une facture prévisible.',
      cyber:
        "Droits d'accès par rôle, chiffrement des données sensibles et effacement à distance des appareils perdus.",
    },
    cta: 'Échanger sur votre programme',
  },
  {
    slug: 'entreprises',
    tagline:
      "Votre chiffre d'affaires passe par des systèmes que personne ne regarde. Jusqu'à la panne.",
    intro:
      "Facturation, stocks, paiements, application client. Tant que tout marche, l'informatique est invisible. Le jour où ça s'arrête, plus rien ne sort. Nous rendons ces systèmes solides, et nous vous donnons les moyens de les surveiller.",
    scene:
      "Un fichier Excel partagé fait tourner la moitié de l'entreprise depuis six ans. Son auteur vient de démissionner. Personne n'ose plus y toucher.",
    needs: [
      'Mettre en production plus souvent, sans avoir peur de casser ce qui marche',
      'Voir les vrais chiffres chaque matin, au lieu de les attendre en fin de mois',
      'Grandir sans que la facture des serveurs grandisse plus vite que vous',
      'Ne pas découvrir une fuite de données par la presse ou par un client',
      "Remplacer l'application que plus personne ne sait modifier",
    ],
    responses: {
      devops:
        'Déploiement automatisé, tests, reprise des applications existantes et développement de vos outils métier.',
      data: 'Entrepôt de données et tableaux de bord branchés sur vos logiciels, à jour sans saisie manuelle.',
      cloud:
        'Migration, réduction de la facture mensuelle et infrastructure qui suit votre activité.',
      cyber:
        "Tests d'intrusion, durcissement, surveillance et procédure écrite à suivre le jour d'un incident.",
    },
    cta: 'Parler à un ingénieur',
  },
  {
    slug: 'ecoles-sante-associations',
    tagline: 'Pas de service informatique, mais les dossiers de vos patients et de vos élèves.',
    intro:
      "Une université, une clinique, une coopérative ou une association manipule des informations aussi sensibles qu'une banque, avec une fraction de ses moyens. Nous choisissons des outils simples, à la taille de votre budget, que vos équipes peuvent utiliser seules.",
    scene:
      "Les inscriptions se font encore sur un cahier. Il y a eu un dégât des eaux l'an dernier. Depuis, on photographie les pages avec un téléphone, à tout hasard.",
    needs: [
      'Gérer inscriptions, dossiers et adhérents sans piles de papier',
      'Garder confidentielles les données des patients, des élèves et des membres',
      "Avoir des outils qu'on peut utiliser sans informaticien à côté",
      'Sauvegarder pour de bon, et vérifier que ça marche',
    ],
    responses: {
      devops: 'Applications de gestion simples, installées et maintenues par nos soins.',
      data: 'Suivi des activités et statistiques produits directement, sans tableur à refaire chaque mois.',
      cloud: 'Messagerie professionnelle, stockage partagé et sauvegardes gérées.',
      cyber: 'Protection des postes, gestion des mots de passe et formation de vos équipes.',
    },
    cta: 'Nous parler de votre structure',
  },
  {
    slug: 'particuliers',
    tagline: 'Vous avez un projet, un commerce ou un cabinet. Pas besoin de parler informaticien.',
    intro:
      'Un site pour votre activité, un compte WhatsApp piraté à récupérer, un disque dur qui ne démarre plus. Expliquez-nous ce qui se passe avec vos mots. Nous vous dirons ce que ça demande et ce que ça coûte avant de commencer.',
    scene:
      "Toutes les photos de la famille sont sur un seul téléphone, et l'écran vient de se fissurer. Une sauvegarde automatique se met en place en une visite.",
    needs: [
      'Lancer un site ou une application pour votre activité',
      'Sécuriser vos comptes, vos appareils et vos paiements',
      'Ne plus risquer de perdre vos documents et vos photos',
      'Apprendre à vous servir des outils numériques',
    ],
    responses: {
      devops: 'Site vitrine ou application, mis en ligne et maintenu.',
      data: 'Récupération de fichiers sur un support abîmé et rangement de vos documents.',
      cloud: 'Sauvegarde automatique de votre téléphone et de votre ordinateur.',
      cyber: 'Récupération et sécurisation de vos comptes, et conseils pour repérer les arnaques.',
    },
    cta: 'Prendre rendez-vous',
  },
];
