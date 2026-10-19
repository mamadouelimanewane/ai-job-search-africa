/**
 * B2B RECRUITER — Portail Entreprise & Shortlist IA en 10 Secondes
 * ─────────────────────────────────────────────────────────────────────────────
 * Permet aux DRH de coller une fiche de poste et d'obtenir instantanément
 * le Top 5 des meilleurs candidats classés avec score d'adéquation et rapport IA.
 */

const talentPool = require('./talent_pool');

function generateAIShortlist(jobRequirement) {
  const reqTitle = (jobRequirement.title || '').toLowerCase();
  const reqSkills = (jobRequirement.skills || []).map(s => s.toLowerCase());
  const reqCountry = jobRequirement.country || 'Tous';

  const allCandidates = talentPool.getTalentPoolProfiles();

  const scoredCandidates = allCandidates.map(c => {
    let score = 50;

    // Adéquation Titre
    if (c.title.toLowerCase().includes(reqTitle) || reqTitle.includes(c.title.toLowerCase())) {
      score += 25;
    }

    // Adéquation Compétences
    const matchedSkills = c.verified_skills.filter(sk => 
      reqSkills.some(rs => sk.toLowerCase().includes(rs) || rs.includes(sk.toLowerCase()))
    );
    score += matchedSkills.length * 5;

    // Pays
    if (reqCountry === 'Tous' || c.country.toLowerCase().includes(reqCountry.toLowerCase())) {
      score += 10;
    }

    // Expérience
    if (c.years_exp >= (jobRequirement.min_exp || 2)) {
      score += 10;
    }

    const finalScore = Math.min(99, score);

    return {
      candidate_id: c.id,
      name: c.real_name || c.alias,
      title: c.title,
      city: c.city,
      country: c.country,
      years_exp: c.years_exp,
      verified_skills: c.verified_skills,
      match_score: finalScore,
      target_salary: c.target_salary_fcfa,
      availability: c.availability,
      matching_reasons: [
        `${matchedSkills.length} compétences clés validées (${matchedSkills.slice(0, 3).join(', ')})`,
        `${c.years_exp} ans d'expérience dans le secteur`,
        `Localisé à ${c.city} (${c.country})`
      ],
      whatsapp_invite_link: `https://wa.me/${(c.whatsapp_phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, nous avons retenu votre profil sur SunuJob AI pour le poste de ${jobRequirement.title || 'Cadre'}. Êtes-vous disponible pour un premier échange ?`)}`
    };
  });

  scoredCandidates.sort((a, b) => b.match_score - a.match_score);
  const top5 = scoredCandidates.slice(0, 5);

  return {
    job_analyzed: jobRequirement.title || "Poste Spécifié",
    candidates_screened_count: allCandidates.length,
    shortlist_count: top5.length,
    top_candidates: top5,
    drh_audit_summary: `Audit réalisé sur ${allCandidates.length} profils vérifiés. Les 5 candidats retenus affichent un taux moyen de compatibilité de ${Math.round(top5.reduce((acc, c) => acc + c.match_score, 0) / (top5.length || 1))}%.`
  };
}

module.exports = {
  generateAIShortlist
};
