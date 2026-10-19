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
  generateInsightReport,
  // ── Nouvelles fonctions IA Profil & Dossier ──
  analyzeProfile,
  generateProfessionalSummary,
  detectSkillGaps,
  scoreProfileATS,
  suggestNextActions,
  // ── IA Informelle & Voix-to-CV ──
  parseInformalJobPost,
  parseVoiceProfile
};

// ==================== IA PROFIL & DOSSIER DE CANDIDATURE ==================== //

/**
 * Analyse complète du profil candidat
 * Retourne : score de complétude, forces, faiblesses, axes d'amélioration
 */
function analyzeProfile(profile) {
  if (!profile) return { error: "Profil vide" };

  const checks = {
    name:         !!(profile.name && profile.name.trim().length > 2),
    title:        !!(profile.title && profile.title.trim().length > 3),
    email:        !!(profile.email && profile.email.includes('@')),
    phone:        !!(profile.phone && profile.phone.trim().length > 7),
    city:         !!(profile.city || profile.district),
    education:    !!(profile.education && profile.education.trim().length > 3),
    years_exp:    !!(profile.years_of_experience > 0),
    skills:       !!(profile.skills && profile.skills.length >= 3),
    languages:    !!(profile.languages && profile.languages.length >= 1),
    summary:      !!(profile.summary && profile.summary.trim().length > 40),
    salary:       !!(profile.salary_expectation && profile.salary_expectation.trim().length > 3),
    experiences:  !!(profile.experiences && profile.experiences.length > 0)
  };

  const filled = Object.values(checks).filter(Boolean).length;
  const total  = Object.keys(checks).length;
  const completionScore = Math.round((filled / total) * 100);

  // Niveau du score
  const level = completionScore >= 85 ? "Excellent" :
                completionScore >= 65 ? "Bon" :
                completionScore >= 40 ? "Moyen" : "Incomplet";

  // Forces détectées
  const strengths = [];
  if (checks.skills && profile.skills.length >= 5) strengths.push(`${profile.skills.length} compétences listées — excellent pour l'ATS`);
  if (checks.summary) strengths.push("Pitch d'accroche présent — attire l'attention du recruteur");
  if (checks.languages && profile.languages.length >= 2) strengths.push(`${profile.languages.length} langues maîtrisées — atout en Afrique de l'Ouest`);
  if (checks.years_exp && profile.years_of_experience >= 3) strengths.push(`${profile.years_of_experience} ans d'expérience — profil crédible`);
  if (checks.experiences) strengths.push("Expériences professionnelles renseignées — renforce la candidature");

  // Faiblesses / manques
  const weaknesses = [];
  if (!checks.summary) weaknesses.push("❌ Pitch d'accroche absent — les recruteurs passent en moyenne 6 secondes sur un CV");
  if (!checks.skills || profile.skills.length < 3) weaknesses.push("❌ Moins de 3 compétences — les systèmes ATS pourraient ne pas vous indexer");
  if (!checks.experiences) weaknesses.push("❌ Aucune expérience renseignée — ajoutez au moins 2 postes pour crédibiliser le dossier");
  if (!checks.phone) weaknesses.push("❌ Numéro WhatsApp manquant — 60% des recruteurs en Afrique de l'Ouest contactent par WhatsApp");
  if (!checks.salary) weaknesses.push("⚠️ Prétentions salariales non définies — compliquera la négociation");
  if (!checks.languages) weaknesses.push("⚠️ Langues non renseignées — l'anglais est un avantage différenciateur au Sénégal et en CI");

  // Score ATS
  const atsScore = scoreProfileATS(profile);

  // Secteur déduit
  const titleText = (profile.title || '') + ' ' + (profile.skills || []).join(' ');
  let detectedSector = "Généraliste";
  let maxM = 0;
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    const m = keywords.filter(kw => titleText.toLowerCase().includes(kw)).length;
    if (m > maxM) { maxM = m; detectedSector = sector; }
  }

  return {
    completion_score:  completionScore,
    level,
    checks,
    strengths,
    weaknesses,
    ats_score:         atsScore,
    detected_sector:   detectedSector,
    skills_count:      (profile.skills || []).length,
    missing_fields:    Object.entries(checks).filter(([,v]) => !v).map(([k]) => k),
    analyzed_at:       new Date().toISOString()
  };
}

/**
 * Génération automatique d'un pitch professionnel depuis le profil
 */
function generateProfessionalSummary(profile) {
  if (!profile) return { error: "Profil vide" };

  const name      = profile.name || "Le/La candidat(e)";
  const title     = profile.title || "professionnel(le)";
  const years     = profile.years_of_experience || 0;
  const city      = profile.city || "Afrique de l'Ouest";
  const education = profile.education || "formation supérieure";
  const skills    = (profile.skills || []).slice(0, 5);
  const languages = (profile.languages || ["Français"]).join(", ");

  // Détecter le secteur depuis les compétences
  const skillText = skills.join(' ').toLowerCase();
  let sector = "domaine professionnel";
  for (const [s, kws] of Object.entries(SECTOR_KEYWORDS)) {
    if (kws.some(kw => skillText.includes(kw))) { sector = s; break; }
  }

  // Templates selon niveau d'expérience
  let summary;
  if (years <= 1) {
    summary = `Jeune diplômé(e) en ${education}, ${name} est un(e) ${title} en début de carrière basé(e) à ${city}. ` +
              `Motivé(e) et rigoureux(se), il/elle maîtrise notamment ${skills.slice(0,3).join(', ')} et s'exprime couramment en ${languages}. ` +
              `À la recherche d'une première opportunité significative dans le secteur ${sector} pour développer son expertise et contribuer à des projets ambitieux.`;
  } else if (years <= 4) {
    summary = `${title} avec ${years} années d'expérience confirmée, ${name} intervient dans le secteur ${sector} depuis ${city}. ` +
              `Diplômé(e) de ${education}, il/elle apporte une maîtrise technique de ${skills.join(', ')} et une capacité éprouvée à livrer des résultats concrets. ` +
              `Bilingue (${languages}), il/elle est reconnu(e) pour son autonomie et son sens du travail en équipe dans des environnements exigeants d'Afrique de l'Ouest.`;
  } else {
    summary = `${title} senior fort(e) de ${years} ans d'expérience, ${name} est une référence dans le secteur ${sector} à ${city}. ` +
              `Son expertise approfondie en ${skills.slice(0,4).join(', ')} combinée à sa formation en ${education} lui permet d'apporter une valeur ajoutée immédiate. ` +
              `Leader reconnu(e) et communicant(e) en ${languages}, il/elle pilote des projets à fort impact dans des contextes multi-culturels et multi-pays.`;
  }

  // Variantes courtes pour WhatsApp / LinkedIn
  const shortPitch = `${title} | ${years > 0 ? years + ' ans d\'exp.' : 'Jeune diplômé'} | ${city} | ${skills.slice(0,3).join(' · ')}`;
  const linkedinHeadline = `${title} @ ${city} | ${sector} | ${skills.slice(0,2).join(' & ')}`;

  return {
    full_summary:      summary,
    short_pitch:       shortPitch,
    linkedin_headline: linkedinHeadline,
    word_count:        summary.split(' ').length,
    generated_at:      new Date().toISOString()
  };
}

/**
 * Détection des lacunes de compétences par rapport au marché
 */
function detectSkillGaps(profile, targetSector) {
  const profileSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
  const sector = targetSector || "Tech & Digital";

  // Compétences de référence par secteur (marché ouest-africain 2025)
  const sectorSkillsMap = {
    "Tech & Digital":        ["JavaScript","Python","React","Node.js","SQL","Docker","Git","APIs","Agile","Linux"],
    "Finance & Banque":      ["SYSCOHADA","Excel avancé","SAP","Sage","IFRS","BCEAO","Audit","Gestion de risques","ERP","VBA"],
    "Commerce & Ventes":     ["CRM","Négociation","Salesforce","Excel","Analyse des ventes","B2B","Gestion de portefeuille"],
    "Logistique & Transit":  ["SAP","Douane","Transport","Incoterms","Excel","ERP","Supply Chain","ASYCUDA"],
    "Énergie & Mines":       ["AutoCAD","QGIS","HSE","SIG","Project","Excel","Reporting","Géologie","Hydrologie"],
    "RH & Management":       ["GPEC","Paie","Excel","Recrutement","Formation","Leadership","Communication","ATS","HRIS"]
  };

  const targetSkills = sectorSkillsMap[sector] || sectorSkillsMap["Tech & Digital"];

  const present = targetSkills.filter(sk => profileSkills.some(ps => ps.includes(sk.toLowerCase())));
  const missing  = targetSkills.filter(sk => !profileSkills.some(ps => ps.includes(sk.toLowerCase())));

  const coverageRate = Math.round((present.length / targetSkills.length) * 100);

  // Recommandations de formation (plateformes disponibles en Afrique)
  const trainingRecommendations = missing.slice(0, 4).map(skill => ({
    skill,
    platforms: ["Coursera","OpenClassrooms","LinkedIn Learning","YouTube","CTIC Dakar"].slice(0, 3),
    duration:  "2–8 semaines",
    priority:  targetSkills.indexOf(skill) < 3 ? "🔴 Prioritaire" : "🟡 Recommandé"
  }));

  return {
    target_sector:     sector,
    coverage_rate:     coverageRate,
    skills_present:    present,
    skills_missing:    missing,
    training_recommendations: trainingRecommendations,
    market_alignment:  coverageRate >= 70 ? "Excellent" : coverageRate >= 50 ? "Bon" : "À renforcer",
    analyzed_at:       new Date().toISOString()
  };
}

/**
 * Score ATS — Compatibilité avec les systèmes de tracking recruteurs
 */
function scoreProfileATS(profile) {
  let score = 0;
  const details = [];

  // Présence des champs clés
  if (profile.name)          { score += 8;  details.push({ label: "Nom complet", pts: 8, ok: true }); }
  else                       {              details.push({ label: "Nom complet", pts: 8, ok: false }); }

  if (profile.title)         { score += 12; details.push({ label: "Titre professionnel", pts: 12, ok: true }); }
  else                       {              details.push({ label: "Titre professionnel", pts: 12, ok: false }); }

  if (profile.email)         { score += 8;  details.push({ label: "Email", pts: 8, ok: true }); }
  else                       {              details.push({ label: "Email", pts: 8, ok: false }); }

  if (profile.phone)         { score += 8;  details.push({ label: "Téléphone", pts: 8, ok: true }); }
  else                       {              details.push({ label: "Téléphone", pts: 8, ok: false }); }

  const skillsCount = (profile.skills || []).length;
  if (skillsCount >= 8)      { score += 20; details.push({ label: `${skillsCount} compétences (≥8 idéal)`, pts: 20, ok: true }); }
  else if (skillsCount >= 4) { score += 12; details.push({ label: `${skillsCount} compétences (8 recommandées)`, pts: 12, ok: true }); }
  else                       {              details.push({ label: "Compétences insuffisantes", pts: 20, ok: false }); }

  if (profile.education)     { score += 10; details.push({ label: "Formation", pts: 10, ok: true }); }
  else                       {              details.push({ label: "Formation", pts: 10, ok: false }); }

  if (profile.summary && profile.summary.length > 60) { score += 15; details.push({ label: "Pitch/Résumé", pts: 15, ok: true }); }
  else if (profile.summary)  { score += 8;  details.push({ label: "Pitch court (enrichir)", pts: 15, ok: true }); }
  else                       {              details.push({ label: "Pitch/Résumé", pts: 15, ok: false }); }

  if (profile.years_of_experience > 0) { score += 10; details.push({ label: "Expérience (années)", pts: 10, ok: true }); }
  else                       {              details.push({ label: "Expérience (années)", pts: 10, ok: false }); }

  if (profile.languages && profile.languages.length > 0) { score += 9; details.push({ label: "Langues", pts: 9, ok: true }); }
  else                       {              details.push({ label: "Langues", pts: 9, ok: false }); }

  const atsLevel = score >= 80 ? "🟢 Optimisé ATS" : score >= 60 ? "🟡 Passable" : "🔴 Non-optimisé";

  return { score: Math.min(100, score), level: atsLevel, details };
}

/**
 * Suggestions d'actions prioritaires pour améliorer le dossier
 */
function suggestNextActions(profile) {
  const analysis = analyzeProfile(profile);
  const actions = [];

  if (!analysis.checks.summary) {
    actions.push({ priority: 1, icon: "🖊️", action: "Générer un pitch automatique avec l'IA", impact: "Très élevé", effort: "1 minute" });
  }
  if (!analysis.checks.experiences) {
    actions.push({ priority: 2, icon: "💼", action: "Ajouter vos expériences professionnelles", impact: "Élevé", effort: "10 minutes" });
  }
  if (analysis.checks.skills && profile.skills.length < 6) {
    actions.push({ priority: 3, icon: "⚡", action: "Ajouter des compétences techniques (viser 8+)", impact: "Élevé", effort: "5 minutes" });
  }
  if (!analysis.checks.phone) {
    actions.push({ priority: 4, icon: "📱", action: "Ajouter votre numéro WhatsApp (indispensable en Afrique)", impact: "Moyen", effort: "1 minute" });
  }
  if (!analysis.checks.languages) {
    actions.push({ priority: 5, icon: "🌍", action: "Renseigner les langues maîtrisées (Français, Anglais, Wolof...)", impact: "Moyen", effort: "2 minutes" });
  }

  // Actions avancées
  actions.push({ priority: 6, icon: "📊", action: "Lancer l'analyse de lacunes compétences vs marché", impact: "Élevé", effort: "30 secondes" });
  actions.push({ priority: 7, icon: "🛰️", action: "Scanner le web pour trouver des offres correspondant à votre profil", impact: "Très élevé", effort: "1 clic" });

  return {
    priority_actions: actions.slice(0, 5),
    completion_score: analysis.completion_score,
    ats_score:        analysis.ats_score.score,
    total_actions:    actions.length
  };
}

// ==================== PARSER D'OFFRES INFORMELLES (FACEBOOK / WHATSAPP) ==================== //

// ==================== PARSER D'OFFRES INFORMELLES (FACEBOOK / WHATSAPP) ==================== //

/**
 * Analyse et structure un texte brut d'offre d'emploi non formalisé
 * (groupes WhatsApp, posts Facebook, messages de réseau)
 */
function parseInformalJobPost(rawText) {
  if (!rawText || !rawText.trim()) {
    return { error: "Texte vide" };
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Détection Téléphone / WhatsApp
  let detectedPhone = "";
  const phoneRegex = /(?:\+?22[158936]\s?)?[079][0-9](?:[\s.-]?[0-9]{2,3}){3,4}/gi;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) {
    detectedPhone = phoneMatch[0].trim();
  }

  // 2. Détection Email
  let detectedEmail = "";
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    detectedEmail = emailMatch[0].trim();
  }

  // 3. Détection de Ville et Pays
  let detectedCity = "Dakar";
  let detectedCountry = "Sénégal";

  if (lower.includes("abidjan") || lower.includes("cocody") || lower.includes("plateau abidjan") || lower.includes("marcory") || lower.includes("yopougon") || lower.includes("san pedro") || lower.includes("bouaké") || lower.includes("+225")) {
    detectedCity = "Abidjan";
    detectedCountry = "Côte d'Ivoire";
  } else if (lower.includes("cotonou") || lower.includes("porto-novo") || lower.includes("parakou") || lower.includes("+229")) {
    detectedCity = "Cotonou";
    detectedCountry = "Bénin";
  } else if (lower.includes("lomé") || lower.includes("lome") || lower.includes("+228")) {
    detectedCity = "Lomé";
    detectedCountry = "Togo";
  } else if (lower.includes("bamako") || lower.includes("+223")) {
    detectedCity = "Bamako";
    detectedCountry = "Mali";
  } else if (lower.includes("ouagadougou") || lower.includes("ouaga") || lower.includes("bobo") || lower.includes("+226")) {
    detectedCity = "Ouagadougou";
    detectedCountry = "Burkina Faso";
  } else if (lower.includes("thiès") || lower.includes("thies") || lower.includes("saint-louis") || lower.includes("mbour")) {
    detectedCity = "Thiès";
    detectedCountry = "Sénégal";
  }

  // 4. Détection du type de Contrat
  let detectedContract = "CDI";
  if (lower.includes("stage") || lower.includes("stagiaire")) detectedContract = "Stage";
  else if (lower.includes("cdd") || lower.includes("temporaire") || lower.includes("intérim")) detectedContract = "CDD";
  else if (lower.includes("freelance") || lower.includes("consultant") || lower.includes("prestation")) detectedContract = "Freelance / Prestation";

  // 5. Détection du Salaire
  let detectedSalary = "À négocier";
  const salaryRegex = /([0-9]{1,3}(?:\s?[0-9]{3})+|\b[0-9]{2,3}k\b|\b[0-9]{1,2}(?:[.,][0-9])?\s?m(?:illion)?\b)\s?(?:fcfa|cfa|f|net)?/gi;
  const salaryMatch = text.match(salaryRegex);
  if (salaryMatch && salaryMatch.length > 0) {
    detectedSalary = salaryMatch[0].trim() + (salaryMatch[0].toLowerCase().includes("cfa") ? "" : " FCFA net");
  } else if (lower.includes("rémunération motivante") || lower.includes("selon profil")) {
    detectedSalary = "Selon profil & grille locale";
  }

  // 6. Extraction du Titre
  let detectedTitle = "Poste Spécialisé";
  const commonJobPatterns = [
    /comptable(?:\s+confirmé|\s+junior|\s+senior|\s+unique)?/i,
    /développeur(?:\s+full-stack|\s+mobile|\s+frontend|\s+backend|\s+flutter|\s+web)?/i,
    /lead\s+développeur(?:\s+flutter|\s+mobile|\s+full-stack)?/i,
    /auditeur(?:\s+interne|\s+financier|\s+senior|\s+junior)?/i,
    /responsable(?:\s+commercial|\s+des\s+ventes|\s+rh|\s+logistique|\s+marketing)?/i,
    /commercial(?:\s+terrain|\s+b2b|\s+sédentaire)?/i,
    /ingénieur(?:\s+cloud|\s+devops|\s+logiciel|\s+système|\s+data|\s+réseau)?/i,
    /chef\s+de\s+projet(?:\s+digital|\s+it|\s+organisation)?/i,
    /community\s+manager/i,
    /assistant(?:e)?(?:\s+de\s+direction|\s+rh|\s+commerciale)?/i
  ];

  for (const cjp of commonJobPatterns) {
    const match = text.match(cjp);
    if (match) {
      detectedTitle = match[0].charAt(0).toUpperCase() + match[0].slice(1);
      break;
    }
  }

  if (detectedTitle === "Poste Spécialisé") {
    const titlePatterns = [
      /(?:cherche|recrute|recrutement)\s*(?:d['’]un|d['’]une)?\s*:?\s*([a-zA-Zà-ÿ\s&/-]{3,35})/i,
      /(?:avis de recrutement|offre d['’]emploi|poste)\s*:?\s*([a-zA-Zà-ÿ\s&/-]{3,35})/i
    ];

    for (const pat of titlePatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        const cleanTitle = m[1].replace(/\b(urgent|recrutement|recrute|cherche|poste|pour|dans|un|une|le|la|à|sur)\b/gi, '').trim();
        if (cleanTitle.length > 3 && cleanTitle.length < 40) {
          detectedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
          break;
        }
      }
    }
  }

  // 7. Détection de l'Entreprise
  let detectedCompany = "Recrutement Direct (Groupe Privé)";
  const compMatch = text.match(/(?:cabinet|entreprise|société|structure|groupe)\s+([A-Z][a-zA-Z0-9\s&'-]{2,25})/);
  if (compMatch && compMatch[1]) {
    detectedCompany = compMatch[1].trim();
  }

  // 8. Extraction des compétences
  const detectedSkills = SKILL_PATTERNS.filter(sk => lower.includes(sk.toLowerCase()));

  // 9. Score de confiance du parsing (0 à 100)
  let confidence = 40;
  if (detectedPhone || detectedEmail) confidence += 20;
  if (detectedTitle !== "Poste Spécialisé") confidence += 20;
  if (detectedSalary !== "À négocier") confidence += 10;
  if (detectedSkills.length > 0) confidence += 10;

  return {
    raw_text: text,
    extracted_job: {
      title: detectedTitle,
      company: detectedCompany,
      country: detectedCountry,
      city: detectedCity,
      contract: detectedContract,
      salary_range: detectedSalary,
      email: detectedEmail,
      whatsapp: detectedPhone,
      skills: detectedSkills,
      description: text
    },
    confidence_score: Math.min(100, confidence),
    parsed_at: new Date().toISOString()
  };
}

// ==================== VOICE-TO-CV (DICTÉE VOCALE DU PROFIL) ==================== //

/**
 * Analyse la transcription vocale d'un candidat pour construire ou mettre à jour
 * automatiquement son profil professionnel
 */
function parseVoiceProfile(voiceTranscript) {
  if (!voiceTranscript || !voiceTranscript.trim()) {
    return { error: "Transcription vide" };
  }

  const text = voiceTranscript.trim();
  const lower = text.toLowerCase();

  // Extraction du Nom
  let detectedName = "";
  const namePatterns = [
    /je m['’]appelle\s+([a-zA-Zà-ÿ\s]{3,30})/i,
    /mon nom est\s+([a-zA-Zà-ÿ\s]{3,30})/i,
    /moi c['’]est\s+([a-zA-Zà-ÿ\s]{3,30})/i
  ];
  for (const pat of namePatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      detectedName = m[1].replace(/et|je|suis|depuis|actuellement/gi, '').split(',')[0].trim();
      break;
    }
  }

  // Extraction Années d'expérience
  let detectedExp = 3;
  const expMatch = text.match(/([0-9]{1,2})\s*(?:ans|années?)\s*(?:d['’]expérience|d['’]exp)?/i);
  if (expMatch && expMatch[1]) {
    detectedExp = parseInt(expMatch[1]);
  } else if (lower.includes("débutant") || lower.includes("jeune diplômé") || lower.includes("sortant")) {
    detectedExp = 0;
  }

  // Extraction Métier / Titre
  let detectedTitle = "Professionnel(le) Qualifié(e)";
  const directTitleMatch = text.match(/(?:ing[eéè]nieur|d[eéè]veloppeur|responsable|comptable|auditeur|chef\s+de\s+projet|directeur|consultant|technicien|assistant)(?:\s+[a-zA-Z\u00C0-\u017F&/-]+){0,4}/i);
  if (directTitleMatch) {
    detectedTitle = directTitleMatch[0].split(/(?:avec|depuis|à|dans|,)/i)[0].trim();
    detectedTitle = detectedTitle.charAt(0).toUpperCase() + detectedTitle.slice(1);
  } else {
    const jobPatterns = [
      /je suis\s+([a-zA-Zà-ÿ\s&/-]{3,35})/i,
      /en tant que\s+([a-zA-Zà-ÿ\s&/-]{3,35})/i,
      /cherche un poste de\s+([a-zA-Zà-ÿ\s&/-]{3,35})/i
    ];
    for (const pat of jobPatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        const t = m[1].replace(/depuis|avec|qui|dans|à|sur|et/gi, '').trim();
        if (t.length > 3 && t.length < 40) {
          detectedTitle = t.charAt(0).toUpperCase() + t.slice(1);
          break;
        }
      }
    }
  }

  // Extraction Ville / Pays
  let detectedCity = "Dakar";
  let detectedCountry = "Sénégal";
  if (lower.includes("abidjan") || lower.includes("côte d'ivoire") || lower.includes("cocody")) {
    detectedCity = "Abidjan";
    detectedCountry = "Côte d'Ivoire";
  } else if (lower.includes("cotonou") || lower.includes("bénin")) {
    detectedCity = "Cotonou";
    detectedCountry = "Bénin";
  } else if (lower.includes("lomé") || lower.includes("togo")) {
    detectedCity = "Lomé";
    detectedCountry = "Togo";
  } else if (lower.includes("bamako") || lower.includes("mali")) {
    detectedCity = "Bamako";
    detectedCountry = "Mali";
  }

  // Extraction Prétentions Salariales
  let detectedSalary = "750 000 FCFA net / mois";
  const salMatch = text.match(/([0-9]{1,3}(?:\s?[0-9]{3})+|\b[0-9]{2,3}k\b|\b[0-9]{1,2}(?:[.,][0-9])?\s?m(?:illion)?\b)\s?(?:fcfa|cfa|f)?/i);
  if (salMatch && salMatch[1]) {
    detectedSalary = salMatch[1].trim() + " FCFA net / mois";
  }

  // Extraction Compétences
  const detectedSkills = SKILL_PATTERNS.filter(sk => lower.includes(sk.toLowerCase()));

  // Formation
  let detectedEducation = "Formation Supérieure / Diplôme d'État";
  if (lower.includes("master") || lower.includes("bac+5") || lower.includes("ingénieur")) detectedEducation = "Master 2 / Diplôme d'Ingénieur";
  else if (lower.includes("licence") || lower.includes("bac+3") || lower.includes("bachelor")) detectedEducation = "Licence / BAC+3";
  else if (lower.includes("bts") || lower.includes("dut") || lower.includes("bac+2")) detectedEducation = "BTS / DUT (BAC+2)";
  else if (lower.includes("bac") || lower.includes("baccalauréat")) detectedEducation = "Baccalauréat";

  return {
    voice_transcript: text,
    extracted_profile: {
      name: detectedName,
      title: detectedTitle,
      city: detectedCity,
      country: detectedCountry,
      years_of_experience: detectedExp,
      education: detectedEducation,
      salary_expectation: detectedSalary,
      skills: detectedSkills,
      summary: `Professionnel(le) dynamique basé(e) à ${detectedCity}, fort(e) de ${detectedExp} ans d'expérience. Spécialisé(e) en ${detectedTitle}, avec des compétences éprouvées en ${detectedSkills.length > 0 ? detectedSkills.slice(0, 4).join(', ') : 'gestion de projets et relation client'}.`
    },
    analyzed_at: new Date().toISOString()
  };
}
