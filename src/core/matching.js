/**
 * Moteur de matching et de scoring d'adéquation candidat - offre
 */

function calculateMatch(profile, job) {
  if (!profile || !job) {
    return {
      score: 0,
      matching_skills: [],
      missing_skills: [],
      analysis: "Profil ou offre manquants."
    };
  }

  const profileSkills = (profile.skills || []).map(s => s.toLowerCase());
  const jobReqs = (job.requirements || []).join(' ').toLowerCase();
  const jobDesc = (job.description || '').toLowerCase();
  const fullJobText = `${job.title.toLowerCase()} ${jobDesc} ${jobReqs}`;

  const matchingSkills = [];
  const missingSkills = [];

  // Vérification des compétences du profil
  profile.skills.forEach(skill => {
    if (fullJobText.includes(skill.toLowerCase())) {
      matchingSkills.push(skill);
    }
  });

  // Détection des compétences requises dans l'offre non mentionnées par le candidat
  const criticalKeywords = [
    'react', 'node.js', 'postgresql', 'docker', 'agile', 'scrum', 'wave', 'orange money',
    'syscohada', 'sage', 'odoo', 'sap', 'logistique', 'transit', 'douane', 'export',
    'marketing', 'meta ads', 'tiktok', 'e-commerce', 'agronome', 'irrigation'
  ];

  criticalKeywords.forEach(kw => {
    if (fullJobText.includes(kw)) {
      const candidateHasIt = profileSkills.some(s => s.includes(kw));
      if (!candidateHasIt) {
        missingSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
  });

  // Calcul du score de base
  let baseScore = 50;

  // Bonus compétences correspondantes
  baseScore += matchingSkills.length * 10;

  // Malus compétences clés absentes
  baseScore -= missingSkills.length * 6;

  // Bonus adéquation géographique (pays et ville)
  if (profile.country && job.country && profile.country.toLowerCase() === job.country.toLowerCase()) {
    baseScore += 10;
  }
  if (profile.city && job.city && profile.city.toLowerCase() === job.city.toLowerCase()) {
    baseScore += 5;
  }

  // Bonus expérience
  if (profile.years_of_experience >= 3) {
    baseScore += 5;
  }

  // Borner entre 15 et 98%
  const finalScore = Math.min(98, Math.max(15, Math.round(baseScore)));

  // Synthèse d'analyse contextuelle Afrique de l'Ouest
  let verdict = "Compatibilité moyenne : dossier défendable avec un ciblage précis.";
  if (finalScore >= 80) {
    verdict = "Excellente adéquation : profil hautement compétitif pour ce poste.";
  } else if (finalScore < 60) {
    verdict = "Adéquation modérée : nécessité de bien mettre en valeur les compétences transférables.";
  }

  return {
    score: finalScore,
    matching_skills: matchingSkills,
    missing_skills: missingSkills.slice(0, 5),
    verdict: verdict,
    location_match: profile.country === job.country && profile.city === job.city,
    salary_indication: {
      candidate_expectation: profile.salary_expectation || "Non précisé",
      job_budget: job.salary_range || "Non précisé"
    }
  };
}

module.exports = {
  calculateMatch
};
