/**
 * COMPANY INTELLIGENCE — Fiches d'Entreprises et Avis du Marché Ouest-Africain
 * ─────────────────────────────────────────────────────────────────────────────
 * Culture, salaires pratiqués, processus de recrutement et avis vérifiés
 */

const fs = require('fs');
const path = require('path');

const REVIEWS_FILE = path.join(__dirname, '../data/company_reviews.json');

const COMPANIES_DB = [
  // --- SÉNÉGAL ---
  {
    id: "sonatel-orange",
    name: "Sonatel (Orange Sénégal)",
    sector: "Télécoms & Tech",
    country: "Sénégal",
    city: "Dakar",
    size: "Grande Entreprise (2500+ employés)",
    description: "Opérateur historique des télécoms au Sénégal et filiale du Groupe Orange. Premier employeur privé du pays et leader de l'innovation mobile.",
    culture: "Exigeante, corporate, excellente formation continue, avantages sociaux au sommet du marché.",
    salary_range: "Cadres juniors : 500k-750k FCFA | Managers : 1.2M-2M FCFA | Directeurs : 2.5M+ FCFA",
    interview_process: ["Test technique / logique en ligne", "Entretien RH de présélection (visio)", "Grand oral devant jury de direction", "Enquête de moralité et visite médicale"],
    avg_response_days: 21,
    diaspora_friendly: true,
    rating: 4.6,
    review_count: 142,
    insider_tips: [
      "Préparez la méthode STAR pour vos exemples",
      "Mentionnez votre maîtrise des technologies cloud et des API de paiement",
      "Le réseau d'anciens de l'ESP Dakar / UCAD est très représenté"
    ],
    website: "https://sonatel.sn",
    linkedin: "https://linkedin.com/company/sonatel"
  },
  {
    id: "wave-senegal",
    name: "Wave Mobile Money Sénégal",
    sector: "FinTech & Tech",
    country: "Sénégal",
    city: "Dakar",
    size: "Licorne Tech (500+ employés)",
    description: "La première licorne d'Afrique francophone. A révolutionné les transferts d'argent et les paiements mobiles avec des frais à 1%.",
    culture: "Start-up californienne à Dakar : autonomie totale, vitesse d'exécution, méritocratie pure, pas de hiérarchie lourde.",
    salary_range: "Devs : 800k-1.5M FCFA | Product Managers : 1.3M-2.2M FCFA | Stock-options possibles",
    interview_process: ["Take-home assignment technique très sélectif (48h)", "Live coding et architecture review", "Culture fit interview avec l'équipe US/Dakar"],
    avg_response_days: 7,
    diaspora_friendly: true,
    rating: 4.8,
    review_count: 89,
    insider_tips: [
      "L'anglais opérationnel est non négociable (échanges quotidiens avec équipes internationales)",
      "Montrez que vous pouvez livrer du code propre rapidement sans supervision",
      "Soyez humble et orienté utilisateur final"
    ],
    website: "https://wave.com",
    linkedin: "https://linkedin.com/company/wave-mobile-money"
  },
  {
    id: "cbao-attijariwafa",
    name: "CBAO Groupe Attijariwafa bank",
    sector: "Finance & Banque",
    country: "Sénégal",
    city: "Dakar Plateau",
    size: "Grande Entreprise (1200+ employés)",
    description: "Première banque du Sénégal par les dépôts et le réseau d'agences. Filiale du géant bancaire marocain Attijariwafa bank.",
    culture: "Bancaire traditionnelle, hiérarchisée, valorise la loyauté et la maîtrise des normes BCEAO et SYSCOHADA.",
    salary_range: "Chargés d'affaires : 450k-700k FCFA | Auditeurs : 700k-1.1M FCFA | 13e et 14e mois inclus",
    interview_process: ["Sélection sur dossier académique", "Entretien RH", "Entretien avec le Directeur de Département", "Validation DRH Siège Casablanca"],
    avg_response_days: 30,
    diaspora_friendly: false,
    rating: 3.9,
    review_count: 67,
    insider_tips: [
      "Costume-cravate / tenue d'affaires stricte obligatoire en entretien",
      "Maîtrisez les ratios prudentiels de la BCEAO",
      "Préparez une présentation soignée de vos réalisations chiffrées"
    ],
    website: "https://cbao.sn",
    linkedin: "https://linkedin.com/company/cbao"
  },
  {
    id: "sococim-vicat",
    name: "SOCOCIM Industries (Groupe Vicat)",
    sector: "Industrie & BTP",
    country: "Sénégal",
    city: "Rufisque / Dakar",
    size: "Grande Entreprise (800+ employés)",
    description: "Plus grande cimenterie d'Afrique de l'Ouest. Acteur clé des grands projets d'infrastructures sénégalais et de la sous-région.",
    culture: "Industrielle, focus sécurité (HSE), esprit d'ingénieur de terrain, rigueur budgétaire.",
    salary_range: "Ingénieurs de production : 650k-950k FCFA | Chefs de département : 1.4M-2M FCFA",
    interview_process: ["Entretien RH à Dakar", "Visite d'usine et évaluation technique à Rufisque", "Entretien Direction Générale"],
    avg_response_days: 18,
    diaspora_friendly: true,
    rating: 4.1,
    review_count: 45,
    insider_tips: [
      "Insistez sur votre expérience concrète des environnements industriels lourds",
      "Mettez en avant vos certifications ISO et sécurité au travail",
      "Mobilité géographique requise sur les carrières et chantiers"
    ],
    website: "https://sococim.com",
    linkedin: "https://linkedin.com/company/sococim-industries"
  },

  // --- CÔTE D'IVOIRE ---
  {
    id: "orange-ci",
    name: "Orange Côte d'Ivoire",
    sector: "Télécoms & Tech",
    country: "Côte d'Ivoire",
    city: "Abidjan Marcory",
    size: "Grande Entreprise (2000+ employés)",
    description: "Leader des télécoms et des services numériques en Côte d'Ivoire. Siège de l'Orange Digital Center régional et hub d'innovation pour l'Afrique de l'Ouest.",
    culture: "Corporate dynamique, investissement massif dans la data et l'IA, ambiance internationale et collaborative.",
    salary_range: "Ingénieurs : 550k-850k FCFA | Chefs de produit : 900k-1.4M FCFA | Directeurs : 2.5M-4M FCFA",
    interview_process: ["Assessement center digital", "Panel interview RH + Métier", "Présentation de business case / étude de cas technique"],
    avg_response_days: 14,
    diaspora_friendly: true,
    rating: 4.5,
    review_count: 112,
    insider_tips: [
      "Préparez une vision claire de la monétisation des services digitaux en Afrique",
      "Mettez en avant votre capacité d'adaptation et vos projets cross-fonctionnels",
      "L'Orange Digital Center recrute activement sur la data et le cloud"
    ],
    website: "https://orange.ci",
    linkedin: "https://linkedin.com/company/orange-ci"
  },
  {
    id: "sifca-abidjan",
    name: "Groupe SIFCA",
    sector: "Agro-industrie",
    country: "Côte d'Ivoire",
    city: "Abidjan Plateau / Intérieur",
    size: "Groupe Panafricain (30 000+ employés)",
    description: "Premier groupe agro-industriel privé d'Afrique de l'Ouest. Leader du caoutchouc naturel (SAPH), du palmier à huile (PALMCI) et du sucre (SUCRIVOIRE).",
    culture: "Culture de pionniers, passion du monde agricole, opportunités uniques de management de sites industriels à l'intérieur du pays.",
    salary_range: "Chefs d'exploitation : 500k-800k FCFA | Directeurs d'usines : 1.3M-2.2M FCFA + Logement",
    interview_process: ["Test psychotechnique", "Entretien RH Siège Abidjan", "Déplacement sur unité agro-industrielle pour immersion 24h"],
    avg_response_days: 25,
    diaspora_friendly: false,
    rating: 4.0,
    review_count: 53,
    insider_tips: [
      "La disponibilité pour résider à l'intérieur de la Côte d'Ivoire (San Pedro, Aboisso) est un atout majeur",
      "Valorisez votre résistance au stress et votre sens du contact avec les planteurs locaux",
      "Package très complet (maison de fonction, voiture, assurance)"
    ],
    website: "https://groupesifca.com",
    linkedin: "https://linkedin.com/company/sifca"
  },
  {
    id: "nsia-banque",
    name: "NSIA Banque Côte d'Ivoire",
    sector: "Finance & Assurance",
    country: "Côte d'Ivoire",
    city: "Abidjan Plateau",
    size: "Grande Entreprise (1000+ employés)",
    description: "Groupe bancaire et d'assurance ivoirien d'envergure régionale fondé par Jean Kacou Diagou. Présent dans 12 pays d'Afrique centrale et de l'ouest.",
    culture: "Fierté panafricaine, rigueur bancaire, promotion interne active, fortes exigences de rentabilité commerciale.",
    salary_range: "Chargés d'affaires PME : 450k-700k FCFA | Directeurs d'agence : 900k-1.4M FCFA",
    interview_process: ["Étude du dossier", "Entretien avec panel RH et Direction Commerciale", "Test de mise en situation commerciale bancaire"],
    avg_response_days: 20,
    diaspora_friendly: true,
    rating: 4.2,
    review_count: 78,
    insider_tips: [
      "Connaissez parfaitement le tissu des PME ivoiriennes et leurs besoins en financement",
      "Démontrez votre aisance relationnelle et votre carnet d'adresses professionnel",
      "Posez des questions sur la stratégie bancassurance intégrée du groupe"
    ],
    website: "https://nsiabanque.ci",
    linkedin: "https://linkedin.com/company/nsia-banque-ci"
  }
];

function getCompanies(filters = {}) {
  const { country, sector, diasporaOnly } = filters;
  return COMPANIES_DB.filter(c => {
    if (country && country !== "Tous" && c.country !== country) return false;
    if (sector && sector !== "Tous" && c.sector !== sector) return false;
    if (diasporaOnly && !c.diaspora_friendly) return false;
    return true;
  });
}

function getCompanyById(id) {
  return COMPANIES_DB.find(c => c.id === id);
}

function searchCompanies(query) {
  if (!query) return COMPANIES_DB;
  const q = query.toLowerCase();
  return COMPANIES_DB.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.sector.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q)
  );
}

function getDiasporaFriendly() {
  return COMPANIES_DB.filter(c => c.diaspora_friendly);
}

function getTopRated(n = 5) {
  return [...COMPANIES_DB].sort((a, b) => b.rating - a.rating).slice(0, n);
}

function addReview(companyId, review) {
  const reviews = loadReviews();
  const newReview = {
    id: `rev-${Date.now()}`,
    company_id: companyId,
    author_title: review.author_title || "Employé / Candidat",
    rating: Math.min(5, Math.max(1, review.rating || 4)),
    pros: review.pros || "",
    cons: review.cons || "",
    salary_comment: review.salary_comment || "",
    created_at: new Date().toISOString()
  };
  reviews.unshift(newReview);
  saveReviews(reviews);
  return newReview;
}

function getReviews(companyId) {
  const all = loadReviews();
  return all.filter(r => r.company_id === companyId);
}

function loadReviews() {
  if (fs.existsSync(REVIEWS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf-8'));
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

function saveReviews(reviews) {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
}

module.exports = {
  COMPANIES_DB,
  getCompanies,
  getCompanyById,
  searchCompanies,
  getDiasporaFriendly,
  getTopRated,
  addReview,
  getReviews
};
