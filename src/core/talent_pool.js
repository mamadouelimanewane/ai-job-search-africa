/**
 * TALENT POOL — Matching Inversé & Chasse de Têtes IA
 * ─────────────────────────────────────────────────────────────────────────────
 * Vitrine de profils d'élite anonymisés ("Cartes d'Or"). Les employeurs paient
 * pour solliciter un contact direct avec les meilleurs talents certifiés.
 */

const fs = require('fs');
const path = require('path');

const TALENT_POOL_FILE = path.join(__dirname, '../data/talent_pool.json');

const INITIAL_TALENT_PROFILES = [
  {
    id: "tp-001",
    alias: "Ingénieur Cloud & DevOps #SN-402",
    real_name: "Cheikh Tidiane Sall",
    title: "Lead DevOps & Architecte Cloud AWS",
    sector: "Tech & Digital",
    country: "Sénégal",
    city: "Dakar",
    years_exp: 5,
    education: "Master 2 Génie Logiciel (ESP Dakar)",
    verified_skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Python", "CI/CD", "Wave API"],
    ats_score: 96,
    badge: "🌟 Carte d'Or — Vérifié SunuJob",
    target_salary_fcfa: "1 200 000 - 1 600 000 FCFA net",
    availability: "Immédiate (Préavis 1 mois)",
    bio: "Pilote d'infrastructures financières à haute disponibilité. A maintenu 99.99% d'uptime sur un volume de 500k transactions quotidiennes.",
    whatsapp_phone: "+221774567890",
    email: "cheikh.sall.devops@gmail.com",
    is_unlocked: false,
    unlock_fee_fcfa: 75000
  },
  {
    id: "tp-002",
    alias: "Responsable Commerciale B2B #CI-819",
    real_name: "Awa Koné",
    title: "Head of Sales & Distribution B2B",
    sector: "Commerce & Ventes",
    country: "Côte d'Ivoire",
    city: "Abidjan Cocody",
    years_exp: 6,
    education: "Master Commerce & Marketing (ESCA / INP-HB Yamoussoukro)",
    verified_skills: ["Salesforce", "Négociation Grands Comptes", "B2B", "Distribution UEMOA", "Management d'équipe"],
    ats_score: 92,
    badge: "🌟 Carte d'Or — Recommandée Piston",
    target_salary_fcfa: "1 100 000 - 1 500 000 FCFA net",
    availability: "Sous 30 jours",
    bio: "Spécialiste de l'ouverture de marchés en Côte d'Ivoire et au Burkina. A généré +45% de chiffre d'affaires sur le portefeuille B2B en 24 mois.",
    whatsapp_phone: "+2250789012345",
    email: "awa.kone.sales@gmail.com",
    is_unlocked: false,
    unlock_fee_fcfa: 75000
  },
  {
    id: "tp-003",
    alias: "Auditeur & Contrôleur Financier #BJ-311",
    real_name: "Bio Gado",
    title: "Auditeur Financier Senior & Spécialiste SYSCOHADA",
    sector: "Finance & Banque",
    country: "Bénin / Togo",
    city: "Cotonou / Lomé",
    years_exp: 7,
    education: "DESCOGEF / Master Audit (UAC Bénin)",
    verified_skills: ["SYSCOHADA révisé", "IFRS", "Sage 100", "Audit fiscal", "Modélisation financière", "BCEAO"],
    ats_score: 94,
    badge: "🌟 Carte d'Or — Audit Bancaire",
    target_salary_fcfa: "950 000 - 1 350 000 FCFA net",
    availability: "Disponible",
    bio: "Ex-cabinet Big Four à Cotonou. A conduit des missions de certification des comptes de 12 institutions financières et banques régionales.",
    whatsapp_phone: "+22997123456",
    email: "bio.gado.audit@gmail.com",
    is_unlocked: false,
    unlock_fee_fcfa: 60000
  },
  {
    id: "tp-004",
    alias: "Full-Stack Dev & Mobile #SN-108",
    real_name: "Ibrahima Ndiaye",
    title: "Développeur Full-Stack Web & Mobile",
    sector: "Tech & Digital",
    country: "Sénégal",
    city: "Dakar",
    years_exp: 4,
    education: "Master en Génie Logiciel (ESP Dakar)",
    verified_skills: ["React", "Node.js", "PostgreSQL", "Docker", "API Mobile Money", "TypeScript"],
    ats_score: 98,
    badge: "🏆 Top 1% Profil National",
    target_salary_fcfa: "850 000 - 1 200 000 FCFA net",
    availability: "Immédiate",
    bio: "Développeur autonome axé sur les architectures Fintech et la performance applicative. Fort sens de la livraison rapide.",
    whatsapp_phone: "+221776543210",
    email: "ibrahima.ndiaye.dev@gmail.com",
    is_unlocked: true, // Le profil actif de l'utilisateur est débloqué par défaut en démo
    unlock_fee_fcfa: 50000
  }
];

function loadTalentPool() {
  if (fs.existsSync(TALENT_POOL_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(TALENT_POOL_FILE, 'utf-8'));
    } catch (e) {
      console.error(e);
    }
  }
  saveTalentPool(INITIAL_TALENT_PROFILES);
  return INITIAL_TALENT_PROFILES;
}

function saveTalentPool(data) {
  fs.writeFileSync(TALENT_POOL_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getTalentPoolProfiles(filters = {}) {
  const all = loadTalentPool();
  const { sector, country, min_exp } = filters;

  return all.filter(p => {
    if (sector && sector !== "Tous" && p.sector !== sector) return false;
    if (country && country !== "Tous" && p.country !== country) return false;
    if (min_exp && p.years_exp < parseInt(min_exp)) return false;
    return true;
  }).map(p => {
    // Si le profil n'est pas débloqué, on masque les informations de contact direct
    if (!p.is_unlocked) {
      return {
        ...p,
        real_name: p.alias,
        whatsapp_phone: "+221 •• ••• •• •• (Protégé)",
        email: "••••••••@••••.com (Débloquer pour voir)"
      };
    }
    return p;
  });
}

function requestUnlockProfile(profileId, recruiterInfo = {}) {
  const all = loadTalentPool();
  const index = all.findIndex(p => p.id === profileId);

  if (index === -1) return { error: "Profil introuvable" };

  all[index].is_unlocked = true;
  saveTalentPool(all);

  return {
    success: true,
    unlocked_profile: all[index],
    notification_to_candidate: `Notification WhatsApp envoyée à ${all[index].real_name} : L'entreprise ${recruiterInfo.company || 'Partenaire'} a débloqué votre contact pour un entretien.`
  };
}

module.exports = {
  getTalentPoolProfiles,
  requestUnlockProfile
};
