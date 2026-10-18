/**
 * Coach d'entretien intelligent adapté aux spécificités de recrutement en Afrique de l'Ouest
 */

function generateInterviewPrep(profile, job) {
  const questions = [
    {
      category: "Présentation & Pitch Initial",
      question: `Présentez-vous en 2 minutes et expliquez pourquoi vous postulez chez ${job.company} à ${job.city}.`,
      strategic_tip: "Ne récitez pas votre CV. Utilisez la méthode Présent-Passé-Futur : qui vous êtes, 1 accomplissement majeur chiffré, et pourquoi cette opportunité précise.",
      sample_answer: `Je m'appelle ${profile.name}, titulaire d'un ${profile.education}. Depuis ${profile.years_of_experience} ans, j'évolue en tant que ${profile.title}. Ce qui m'amène aujourd'hui chez ${job.company}, c'est votre ambition sur le marché de ${job.city} et l'opportunité de mettre à profit mon expérience pour accélérer vos objectifs opérationnels.`
    },
    {
      category: "Compétences Techniques & Contexte Local",
      question: `Comment abordez-vous les contraintes spécifiques à ${job.city} (disponibilité des infrastructures, gestion de la connectivité ou partenaires locaux) dans vos missions ?`,
      strategic_tip: "Montrez votre résilience opérationnelle et votre sens de l'anticipation. Les recruteurs recherchent des profils 'débrouillards et rigoureux' capables de trouver des solutions pragmatiques.",
      sample_answer: `Dans mes expériences précédentes, j'ai appris à toujours prévoir des plans de redondance et à maintenir une communication directe (appels, WhatsApp) pour débloquer rapidement les goulots d'étranglement sans subir les aléas.`
    },
    {
      category: "Alignement Salarial & Négociation FCFA",
      question: `Quelles sont vos prétentions salariales nettes mensuelles pour ce poste de ${job.title} ?`,
      strategic_tip: `L'offre affiche une fourchette de ${job.salary_range || 'marché'}. Votre profil indique ${profile.salary_expectation || 'une prétention'}. Justifiez toujours par la valeur apportée plutôt que par vos dépenses personnelles.`,
      sample_answer: `Compte tenu de mon niveau de responsabilité et de mes résultats passés, mes prétentions se situent autour de ${profile.salary_expectation || 'la fourchette annoncée'}, avec une ouverture selon les avantages connexes (assurance santé, primes sur objectifs).`
    },
    {
      category: "Situation & Résolution de Crise",
      question: "Décrivez une situation où vous avez fait face à un désaccord avec un supérieur ou un client important, et comment vous l'avez géré.",
      strategic_tip: "Privilégiez l'écoute, le respect de la hiérarchie et la recherche du compromis constructif sans compromettre la qualité du travail.",
      sample_answer: "J'ai pris l'initiative d'un échange en face-à-face pour comprendre les motivations de mon interlocuteur, j'ai présenté les données objectives du projet et nous avons défini un protocole commun validé par les deux parties."
    },
    {
      category: "Questions du Candidat au Recruteur",
      question: "Avez-vous des questions pour nous ?",
      strategic_tip: "Ne répondez jamais 'Non'. C'est le moment de prouver votre curiosité stratégique.",
      sample_answer: `Quels sont les objectifs prioritaires que vous attendez du nouveau ${job.title} au cours des 90 premiers jours ? Et quelle est la culture managériale interne au sein de ${job.company} ?`
    }
  ];

  return {
    job_title: job.title,
    company: job.company,
    location: `${job.city}, ${job.country}`,
    questions_count: questions.length,
    questions: questions
  };
}

module.exports = {
  generateInterviewPrep
};
