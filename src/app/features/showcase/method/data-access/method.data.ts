export interface MethodStep {
  readonly title: string;
  readonly text: string;
  readonly detail: string;
}

export const METHOD_STEPS: readonly MethodStep[] = [
  {
    title: 'On vous écoute',
    text: 'Un premier échange, au téléphone ou sur place à Niamey. Vous racontez ce qui bloque.',
    detail:
      "Pas besoin de cahier des charges ni de vocabulaire technique. Vous repartez en sachant si nous pouvons vous aider, et si ce n'est pas le cas, nous vous le disons.",
  },
  {
    title: 'On regarde ce qui existe',
    text: 'Serveurs, applications, sauvegardes, accès. On lit avant de proposer.',
    detail:
      "Vous recevez un état des lieux écrit, avec les risques classés par ordre de gravité. Il vous appartient, même si la mission s'arrête là.",
  },
  {
    title: 'On chiffre un plan',
    text: 'Un périmètre, un calendrier, un prix. Si une solution plus simple suffit, on vous le dit.',
    detail:
      "Le devis indique ce qui est compris et ce qui ne l'est pas. Vous savez ce que coûtera le système une fois livré, pas seulement ce que coûte sa construction.",
  },
  {
    title: 'On livre par étapes',
    text: 'Chaque étape se voit, se teste chez vous et se valide avant la suivante.',
    detail:
      "Vous n'attendez pas la fin du projet pour découvrir le résultat. Si la priorité change en route, on ajuste la suite.",
  },
  {
    title: 'On vous rend les clés',
    text: 'Code, accès, documentation, formation. Tout est à votre nom.',
    detail:
      'Vos équipes doivent pouvoir faire tourner le système sans nous. Si vous préférez que nous continuions à veiller dessus, nous en discutons, sans obligation.',
  },
];
