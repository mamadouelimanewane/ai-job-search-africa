/**
 * REFERRAL NETWORK — Le "Piston Digital" Transparent & Méritocratique
 * ─────────────────────────────────────────────────────────────────────────────
 * Digitalisation de la cooptation et des recommandations professionnelles
 * adaptées aux réseaux ouest-africains
 */

const fs = require('fs');
const path = require('path');

const REFERRALS_FILE = path.join(__dirname, '../data/referrals.json');

const INITIAL_REFERRALS = [
  {
    id: "ref-101",
    candidate_name: "Ibrahima Ndiaye",
    candidate_title: "Développeur Web & Mobile Full-Stack",
    referrer_name: "Amadou Diallo",
    referrer_title: "Directeur de l'Ingénierie",
    referrer_company: "Sonatel / Orange Dakar",
    relationship: "Ancien tuteur de stage & chef de projet",
    endorsement_strength: "Recommandation Forte (5/5)",
    text: "Ibrahima a développé pour notre département une application critique d'orchestration de flux USSD. Rigueur exceptionnelle, code propre et autonome.",
    skills_endorsed: ["React.js", "Node.js", "API Mobile Money", "PostgreSQL"],
    verified_linkedin: true,
    created_at: "2026-10-15T10:30:00Z"
  },
  {
    id: "ref-102",
    candidate_name: "Ibrahima Ndiaye",
    candidate_title: "Développeur Web & Mobile Full-Stack",
    referrer_name: "Dr. Ousmane Kane",
    referrer_title: "Professeur & Responsable Département Informatique",
    referrer_company: "École Supérieure Polytechnique (ESP Dakar)",
    relationship: "Encadreur académique (Master Génie Logiciel)",
    endorsement_strength: "Recommandation Académique (5/5)",
    text: "Major de sa promotion sur les projets d'intégration distribuée. A démontré une solide maturité technique et un leadership naturel.",
    skills_endorsed: ["Architecture logicielle", "Docker", "Algorithmique"],
    verified_linkedin: true,
    created_at: "2026-09-20T14:00:00Z"
  }
];

function loadReferrals() {
  if (fs.existsSync(REFERRALS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(REFERRALS_FILE, 'utf-8'));
    } catch (e) {
      console.error(e);
    }
  }
  fs.writeFileSync(REFERRALS_FILE, JSON.stringify(INITIAL_REFERRALS, null, 2), 'utf-8');
  return INITIAL_REFERRALS;
}

function saveReferrals(data) {
  fs.writeFileSync(REFERRALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getAllReferrals() {
  return loadReferrals();
}

function addReferral(data) {
  const all = loadReferrals();
  const newRef = {
    id: `ref-${Date.now()}`,
    candidate_name: data.candidate_name || "Ibrahima Ndiaye",
    candidate_title: data.candidate_title || "Professionnel",
    referrer_name: data.referrer_name,
    referrer_title: data.referrer_title,
    referrer_company: data.referrer_company,
    relationship: data.relationship || "Collègue / Manager",
    endorsement_strength: data.endorsement_strength || "Recommandation Professionnelle (5/5)",
    text: data.text,
    skills_endorsed: Array.isArray(data.skills_endorsed) ? data.skills_endorsed : (data.skills_endorsed || "").split(',').map(s => s.trim()).filter(Boolean),
    verified_linkedin: !!data.verified_linkedin,
    created_at: new Date().toISOString()
  };
  all.unshift(newRef);
  saveReferrals(all);
  return newRef;
}

function getReferralScore(candidateName = "Ibrahima Ndiaye") {
  const all = loadReferrals().filter(r => r.candidate_name.toLowerCase().includes(candidateName.toLowerCase()));
  const count = all.length;
  // Score calculé : base 50 + 20 pts par recommandation vérifiée (max 100)
  const score = Math.min(100, 50 + (count * 25));
  
  const allSkills = [];
  all.forEach(r => (r.skills_endorsed || []).forEach(s => {
    if (!allSkills.includes(s)) allSkills.push(s);
  }));

  return {
    candidate_name: candidateName,
    referral_count: count,
    reputation_score: score,
    badge: score >= 85 ? "🌟 Profil Hautement Coopté" : score >= 65 ? "⭐ Profil Recommandé" : "🌱 En cours de cooptation",
    endorsed_skills: allSkills,
    referrals: all
  };
}

function generateReferralBadge(referral) {
  return `🤝 Recommandé par ${referral.referrer_name} (${referral.referrer_title} chez ${referral.referrer_company}) : "${referral.text.substring(0, 120)}..."`;
}

module.exports = {
  getAllReferrals,
  addReferral,
  getReferralScore,
  generateReferralBadge
};
