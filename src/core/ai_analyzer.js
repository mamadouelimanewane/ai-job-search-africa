/**
 * AI ANALYZER — Moteur d'Intelligence Artificielle de l'Agrégateur SunuJob AI
 * ─────────────────────────────────────────────────────────────────────────────
 * Fournit :
 *   1. analyzeJobOffer(job)           → Score, compétences, secteur, résumé IA
 *   2. batchAnalyzeJobs(jobs)         → Analyse en lot
 *   3. generateSmartQuery(profile)    → Requête de recherche optimisée depuis le profil
 *   4. detectMarketTrends(jobs)       → Tendances du marché ouest-africain
 *   5. rankJobsForProfile(jobs, profile) → Classement personnalisé IA
 *   6. generateInsightReport(jobs)    → Rapport narratif du marché
 */

// ─── Taxonomie des secteurs ───────────────────────────────────────────────────
const SECTOR_KEYWORDS = {
  "Tech & Digital":      ["développeur","developer","software","data","cloud","devops","it","informatique","digital","mobile","flutter","react","angular","vue","python","java","ia","ai","machine learning","cybersécurité","réseau","système"],
  "Finance & Banque":    ["finance","banque","bank","comptable","comptabilité","audit","contrôle de gestion","trésorier","risk","crédit","microfinance","fiscalité","bilan","uemoa","syscohada","bceao"],
  "Énergie & Mines":     ["énergie","pétrole","gaz","minier","mines","extraction","électricité","solaire","hydraulique","geophysicien","offshore","rig"],
  "Commerce & Ventes":   ["commercial","vente","business","marketing","key account","canal","distribution","retail","merchandising","b2b","b2c"],
  "Logistique & Transit":["logistique","transit","supply chain","transport","douane","fret","maritime","port","import","export","entrepôt","warehouse"],
  "RH & Management":     ["ressources humaines","rh","hr","recrutement","formation","talent","payroll","paie","manager","directeur","chef de projet"],
  "Santé & Social":      ["santé","médecin","infirmier","pharmacie","hôpital","clinique","ong","humanitaire","développement social"],
  "Agri & Agro-industrie":["agriculture","agro","agroalimentaire","élevage","pêche","cacao","café","anacarde"],
  "BTP & Génie Civil":   ["bâtiment","génie civil","construction","architecture","topographie","btp","infrastructure"],
  "Juridique & Conformité":["juriste","avocat","compliance","conformité","réglementation","contrat","droit"]
};

// ─── Compétences transversales Afrique de l'Ouest ────────────────────────────
const SKILL_PATTERNS = [
  // Tech
  "Python","JavaScript","TypeScript","React","Vue","Angular","Flutter","Dart","Node.js",
  "Docker","Kubernetes","AWS","Azure","GCP","Terraform","Linux","SQL","MongoDB","PostgreSQL",
  "Machine Learning","Deep Learning","NLP","TensorFlow","PyTorch","Power BI","Tableau",
  // Finance
  "SAP","Sage","Odoo","SYSCOHADA","IFRS","OHADA","BCEAO","UEMOA","Excel avancé","VBA",
  // Business
  "CRM","ERP","Salesforce","HubSpot","Google Analytics","SEO","Pack Office",
  // Soft skills
  "Gestion de projet","Leadership","Communication","Négociation","Anglais","Français",
  // Paiements Afrique
  "Wave","Orange Money","MTN MoMo","Mobile Money","FinTech"
];

const CONTRACT_WEIGHT  = { "CDI": 1.0, "CDD": 0.8, "Stage": 0.5, "Freelance": 0.7, "Consultant": 0.75 };
const COUNTRY_WEIGHT   = { "Sénégal": 1.0, "Côte d'Ivoire": 0.98, "Bénin": 0.85, "Togo": 0.82, "Mali": 0.78, "Burkina Faso": 0.80 };

// ─── 1. Analyse d'une offre individuelle ─────────────────────────────────────
function analyzeJobOffer(job) {
  const text = `${job.title || ''} ${job.description || ''} ${(job.requirements || []).join(' ')}`.toLowerCase();

  // Détection du secteur
  let detectedSector = "Autre";
  let maxMatches = 0;
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw)).length;
    if (matches > maxMatches) { maxMatches = matches; detectedSector = sector; }
  }

  // Extraction des compétences mentionnées
  const extractedSkills = SKILL_PATTERNS.filter(sk => text.includes(sk.toLowerCase()));

  // Score de qualité de l'offre (0–100)
  let qualityScore = 40; // base
  if (job.salary_range && job.salary_range !== "Non précisé") qualityScore += 15;
  if (job.description && job.description.length > 100)          qualityScore += 10;
  if (job.requirements && job.requirements.length >= 2)         qualityScore += 10;
  if (job.contact_email || job.contact_whatsapp)                qualityScore += 10;
  if (job.deadline)                                             qualityScore += 5;
  if (extractedSkills.length >= 2)                              qualityScore += 10;
  qualityScore = Math.min(100, qualityScore);

  // Score de marché (demande estimée)
  const marketDemand = estimateMarketDemand(detectedSector);

  // Résumé IA de l'offre
  const aiSummary = generateJobSummary(job, detectedSector, extractedSkills);

  // Niveau d'expérience estimé
  const experienceLevel = estimateExperienceLevel(text);

  // Salaire estimé en FCFA (si absent)
  const salaryEstimate = job.salary_range || estimateSalaryRange(detectedSector, experienceLevel);

  return {
    sector:          detectedSector,
    quality_score:   qualityScore,
    market_demand:   marketDemand,
    skills_detected: extractedSkills,
    experience_level:experienceLevel,
    salary_estimate: salaryEstimate,
    ai_summary:      aiSummary,
    ai_tags:         buildTags(detectedSector, experienceLevel, job.contract),
    analyzed_at:     new Date().toISOString()
  };
}

// ─── 2. Analyse en lot ────────────────────────────────────────────────────────
function batchAnalyzeJobs(jobs) {
  return jobs.map(job => ({
    ...job,
    ai_analysis: analyzeJobOffer(job)
  }));
}

// ─── 3. Requête intelligente depuis le profil ─────────────────────────────────
function generateSmartQuery(profile) {
  if (!profile) return { queries: ["emploi Afrique Ouest"], explanation: "Profil non fourni — requête générique." };

  const parts = [];
  const explanations = [];

  // Titre visé
  if (profile.target_title) {
    parts.push(profile.target_title);
    explanations.push(`Titre cible : "${profile.target_title}"`);
  }

  // Compétences clés (top 3)
  if (profile.skills && profile.skills.length > 0) {
    const topSkills = profile.skills.slice(0, 3);
    parts.push(...topSkills);
    explanations.push(`Compétences principales : ${topSkills.join(', ')}`);
  }

  // Secteur préféré
  if (profile.preferred_sector) {
    parts.push(profile.preferred_sector);
    explanations.push(`Secteur visé : ${profile.preferred_sector}`);
  }

  // Ville cible
  const city = profile.target_city || profile.city;
  if (city) {
    parts.push(city);
    explanations.push(`Zone géographique : ${city}`);
  }

  // Alternatives basées sur les synonymes
  const synonyms = generateSynonyms(profile.target_title);

  return {
    primary_query:   parts.join(' '),
    alternative_queries: synonyms,
    explanation:     explanations,
    generated_at:    new Date().toISOString()
  };
}

// ─── 4. Tendances du marché ───────────────────────────────────────────────────
function detectMarketTrends(jobs) {
  const sectorCount = {};
  const contractCount = {};
  const cityCount = {};
  const skillCount = {};

  jobs.forEach(job => {
    const analysis = job.ai_analysis || analyzeJobOffer(job);
    
    // Secteurs
    sectorCount[analysis.sector] = (sectorCount[analysis.sector] || 0) + 1;
    
    // Contrats
    const ct = job.contract || "Non précisé";
    contractCount[ct] = (contractCount[ct] || 0) + 1;

    // Villes
    const city = job.city || "Inconnue";
    cityCount[city] = (cityCount[city] || 0) + 1;

    // Compétences
    analysis.skills_detected.forEach(sk => {
      skillCount[sk] = (skillCount[sk] || 0) + 1;
    });
  });

  const sortedSectors  = sortByValue(sectorCount).slice(0, 5);
  const sortedCities   = sortByValue(cityCount).slice(0, 5);
  const sortedSkills   = sortByValue(skillCount).slice(0, 10);
  const sortedContracts= sortByValue(contractCount);

  // Score de chaleur du marché global
  const heatScore = Math.min(100, Math.round(
    (jobs.length * 4) +
    (sortedSkills.length * 3) +
    (sortedSectors.length * 5)
  ));

  return {
    total_jobs_analyzed:  jobs.length,
    market_heat_score:    heatScore,
    top_sectors:          sortedSectors,
    top_cities:           sortedCities,
    top_skills_in_demand: sortedSkills,
    contract_distribution:sortedContracts,
    trend_narrative:      buildTrendNarrative(sortedSectors, sortedSkills, jobs.length),
    generated_at:         new Date().toISOString()
  };
}

// ─── 5. Classement personnalisé ────────────────────────────────────────────────
function rankJobsForProfile(jobs, profile) {
  if (!profile) return jobs;

  const profileText = [
    profile.target_title || '',
    (profile.skills || []).join(' '),
    profile.preferred_sector || '',
    profile.target_city || profile.city || ''
  ].join(' ').toLowerCase();

  return jobs.map(job => {
    const analysis = job.ai_analysis || analyzeJobOffer(job);
    
    // Score de correspondance profil ↔ offre
    let matchScore = 0;

    // Titre
    const titleWords = (job.title || '').toLowerCase().split(/\s+/);
    titleWords.forEach(w => { if (w.length > 3 && profileText.includes(w)) matchScore += 12; });

    // Compétences communes
    analysis.skills_detected.forEach(sk => {
      if (profileText.includes(sk.toLowerCase())) matchScore += 8;
    });

    // Secteur
    if (profile.preferred_sector && analysis.sector.toLowerCase().includes(profile.preferred_sector.toLowerCase())) matchScore += 15;

    // Ville
    const jobCity = (job.city || '').toLowerCase();
    const targetCity = (profile.target_city || profile.city || '').toLowerCase();
    if (jobCity && targetCity && jobCity.includes(targetCity)) matchScore += 10;

    // Expérience
    const yearsExp = profile.years_experience || 0;
    const levelMatch = { "Junior": yearsExp <= 3, "Intermédiaire": yearsExp >= 2 && yearsExp <= 7, "Senior": yearsExp >= 5 };
    if (levelMatch[analysis.experience_level]) matchScore += 10;

    // Bonus qualité + marché
    matchScore += Math.round(analysis.quality_score * 0.2);
    matchScore += Math.round(analysis.market_demand * 0.1);

    return {
      ...job,
      ai_analysis: analysis,
      profile_match_score: Math.min(100, matchScore)
    };
  }).sort((a, b) => b.profile_match_score - a.profile_match_score);
}

// ─── 6. Rapport narratif ──────────────────────────────────────────────────────
function generateInsightReport(jobs) {
  const trends = detectMarketTrends(jobs);

  const topSector  = trends.top_sectors[0]?.key || "Tech & Digital";
  const topCity    = trends.top_cities[0]?.key || "Dakar";
  const topSkill   = trends.top_skills_in_demand[0]?.key || "Excel";

  const report = {
    title:    "📊 Rapport IA du Marché de l'Emploi — Afrique de l'Ouest",
    date:     new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
    headline: `Le secteur "${topSector}" domine les recrutements cette semaine avec une forte concentration d'offres à ${topCity}.`,
    key_insights: [
      `🔥 Compétence la plus recherchée : **${topSkill}**`,
      `🏙️ Marché le plus actif : **${topCity}** (${trends.top_cities[0]?.count || 0} offres)`,
      `📋 Type de contrat majoritaire : **${trends.contract_distribution[0]?.key || 'CDI'}**`,
      `📈 Indice de chaleur du marché : **${trends.market_heat_score}/100**`,
      `🌍 ${trends.total_jobs_analyzed} offres analysées sur ${trends.top_sectors.length} secteurs`
    ],
    sector_breakdown: trends.top_sectors,
    skills_spotlight: trends.top_skills_in_demand.slice(0, 6),
    recommendation:   `Priorisez vos candidatures sur les offres "${topSector}" à ${topCity} qui correspondent au pic de recrutement actuel.`,
    trends
  };

  return report;
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

function estimateMarketDemand(sector) {
  const demandMap = {
    "Tech & Digital":       92, "Finance & Banque":       85,
    "Commerce & Ventes":    80, "Logistique & Transit":   78,
    "Énergie & Mines":      75, "RH & Management":        70,
    "BTP & Génie Civil":    65, "Agri & Agro-industrie":  60,
    "Santé & Social":       68, "Juridique & Conformité": 62,
    "Autre":                50
  };
  return demandMap[sector] || 55;
}

function estimateExperienceLevel(text) {
  if (text.includes("5 ans") || text.includes("7 ans") || text.includes("10 ans") || text.includes("senior") || text.includes("confirmé")) return "Senior";
  if (text.includes("2 ans") || text.includes("3 ans") || text.includes("expérience requise")) return "Intermédiaire";
  if (text.includes("stage") || text.includes("débutant") || text.includes("junior") || text.includes("sortant")) return "Junior";
  return "Intermédiaire";
}

function estimateSalaryRange(sector, level) {
  const baseRanges = {
    "Tech & Digital":        { Junior: "350 000 - 600 000", Intermédiaire: "650 000 - 1 100 000", Senior: "1 100 000 - 2 000 000" },
    "Finance & Banque":      { Junior: "300 000 - 500 000", Intermédiaire: "600 000 - 1 000 000", Senior: "1 000 000 - 1 800 000" },
    "Commerce & Ventes":     { Junior: "250 000 - 450 000", Intermédiaire: "500 000 - 900 000",   Senior: "900 000 - 1 500 000" },
    "Énergie & Mines":       { Junior: "400 000 - 700 000", Intermédiaire: "800 000 - 1 300 000", Senior: "1 300 000 - 2 500 000" },
    "Logistique & Transit":  { Junior: "280 000 - 480 000", Intermédiaire: "550 000 - 950 000",   Senior: "950 000 - 1 600 000" }
  };
  const range = (baseRanges[sector] || baseRanges["Commerce & Ventes"])[level] || "400 000 - 800 000";
  return `${range} FCFA net (estimé IA)`;
}

function generateJobSummary(job, sector, skills) {
  const contractLabel = job.contract || "Contrat";
  const skillList = skills.length > 0 ? skills.slice(0, 3).join(', ') : "compétences générales";
  return `Poste ${contractLabel} dans le secteur ${sector} basé à ${job.city || 'Afrique de l\'Ouest'}. ` +
         `Compétences clés détectées : ${skillList}. ` +
         `Source : ${job.source_site || 'SunuJob AI'}. ` +
         (job.salary_range ? `Rémunération affichée : ${job.salary_range}.` : "Salaire à négocier.");
}

function buildTags(sector, level, contract) {
  const tags = [sector, level];
  if (contract) tags.push(contract);
  return tags;
}

function generateSynonyms(title) {
  if (!title) return [];
  const synonymMap = {
    "développeur":  ["software engineer","programmeur","full-stack","backend","frontend"],
    "comptable":    ["auditeur","contrôleur de gestion","finance","trésorier"],
    "commercial":   ["business developer","chargé de vente","account manager","key account"],
    "logistique":   ["supply chain","transit","transport","fret"],
    "data":         ["data analyst","data scientist","business intelligence","bi","power bi"],
    "manager":      ["directeur","chef de projet","responsable","head of"]
  };
  const t = (title || '').toLowerCase();
  for (const [key, syns] of Object.entries(synonymMap)) {
    if (t.includes(key)) return syns.slice(0, 3);
  }
  return [];
}

function buildTrendNarrative(sectors, skills, total) {
  if (total === 0) return "Aucune donnée analysée.";
  const s = sectors[0]?.key || "Tech";
  const sk = skills[0]?.key || "Excel";
  return `Sur les ${total} offres analysées, le secteur "${s}" est le plus actif. ` +
         `La compétence "${sk}" apparaît dans le plus grand nombre de postes. ` +
         `Le marché ouest-africain présente un indice de dynamisme élevé, ` +
         `notamment sur Dakar et Abidjan qui concentrent la majorité des recrutements.`;
}

function sortByValue(obj) {
  return Object.entries(obj)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

module.exports = {
  analyzeJobOffer,
  batchAnalyzeJobs,
  generateSmartQuery,
  detectMarketTrends,
  rankJobsForProfile,
  generateInsightReport
};
