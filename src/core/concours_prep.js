/**
 * CONCOURS PREP — Entraînement Quotidien & QCM Concours Publics AOF
 * ─────────────────────────────────────────────────────────────────────────────
 * Banque de QCM interactifs pour l'ENA, les Douanes, la Police, le Trésor
 * et les concours BCEAO/BAD en Afrique de l'Ouest.
 */

const QUIZ_BANK = [
  {
    id: "q_ena_01",
    concours_target: "ENA Sénégal / ENA Côte d'Ivoire",
    category: "Finances Publiques & Économie UEMOA",
    question: "Quel est le principal traité régissant l'union monétaire au sein des 8 pays de l'UEMOA ?",
    options: [
      "Le Traité de Rome révisé",
      "Le Traité constitutif de l'UEMOA signé à Dakar en janvier 1994",
      "L'Accord de Cotonou de 2000",
      "Le Pacte de convergence de Casablanca"
    ],
    correct_index: 1,
    explanation: "Le Traité constitutif de l'UEMOA a été signé à Dakar le 10 janvier 1994 par les chefs d'État de l'union monétaire après la dévaluation du franc CFA."
  },
  {
    id: "q_douane_01",
    concours_target: "Concours des Douanes",
    category: "Droit Douanier & Commerce Extérieur",
    question: "Dans le Tarif Extérieur Commun (TEC) de la CEDEAO, quelle est la catégorie de taxe pour les biens de première nécessité ?",
    options: [
      "Catégorie 0 (0% de droit de douane)",
      "Catégorie 1 (5% de droit de douane)",
      "Catégorie 2 (10% de droit de douane)",
      "Catégorie 4 (35% de droit de douane)"
    ],
    correct_index: 0,
    explanation: "La Catégorie 0 du TEC CEDEAO s'applique aux biens sociaux et de première nécessité avec un taux de Droit de Douane de 0%."
  },
  {
    id: "q_bceao_01",
    concours_target: "Programme Jeunes Professionnels BCEAO",
    category: "Banque Centrale & Politique Monétaire",
    question: "Quelle est la mission fondamentale conférée à la BCEAO par ses statuts ?",
    options: [
      "Financer directement les déficits budgétaires des États",
      "Définir et mettre en œuvre la politique monétaire pour assurer la stabilité des prix",
      "Fixer unilatéralement les prix des denrées alimentaires sur les marchés",
      "Gérer le cadastre foncier des capitales de l'Union"
    ],
    correct_index: 1,
    explanation: "L'objectif principal de la BCEAO est de définir et conduire la politique monétaire au sein de l'UMOA afin de garantir la stabilité des prix."
  },
  {
    id: "q_cult_01",
    concours_target: "Concours Administratifs Généraux",
    category: "Culture Générale & Histoire Ouest-Africaine",
    question: "Quel est le siège officiel de la Banque Ouest-Africaine de Développement (BOAD) ?",
    options: [
      "Dakar (Sénégal)",
      "Abidjan (Côte d'Ivoire)",
      "Lomé (Togo)",
      "Cotonou (Bénin)"
    ],
    correct_index: 2,
    explanation: "Le siège de la Banque Ouest-Africaine de Développement (BOAD) est établi à Lomé, au Togo, depuis sa création en 1973."
  }
];

function getDailyQuiz() {
  return QUIZ_BANK;
}

function evaluateQuizSubmission(answers) {
  let score = 0;
  const results = [];

  QUIZ_BANK.forEach(q => {
    const candidateAnswer = answers[q.id];
    const isCorrect = candidateAnswer !== undefined && parseInt(candidateAnswer) === q.correct_index;

    if (isCorrect) score += 25;

    results.push({
      question_id: q.id,
      question: q.question,
      user_answer_index: candidateAnswer,
      correct_answer_index: q.correct_index,
      is_correct: isCorrect,
      explanation: q.explanation
    });
  });

  return {
    score_out_of_100: score,
    verdict: score >= 75 ? "Admissible (Excellente maîtrise)" : score >= 50 ? "En progrès (Révisions recommandées)" : "Non Admissible (Nécessite plus de travail)",
    details: results
  };
}

module.exports = {
  getDailyQuiz,
  evaluateQuizSubmission
};
