/**
 * CONCOURS TRACKER — Radar & Suivi des Concours de la Fonction Publique
 * ─────────────────────────────────────────────────────────────────────────────
 * Base des concours officiels au Sénégal, Côte d'Ivoire, Bénin, Togo, Mali, Burkina
 */

const CONCOURS_CATALOG = [
  // --- SÉNÉGAL ---
  {
    id: "sn-ena-2026",
    title: "Concours Direct d'Entrée à l'ENA (Cycles Supérieur et Moyen)",
    institution: "École Nationale d'Administration (ENA)",
    country: "Sénégal",
    city: "Dakar",
    type: "Concours Direct",
    sector: "Administration Publique",
    deadline: "2026-11-30",
    days_left: 42,
    requirements: ["BAC+4/Master pour Cycle Supérieur", "Licence pour Cycle Moyen", "Nationalité sénégalaise", "Âge max : 33 ans"],
    description: "Recrutement des futurs administrateurs civils, inspecteurs du travail, diplomates et commissaires aux enquêtes économiques de la République du Sénégal.",
    positions_count: 85,
    source_url: "https://fonctionpublique.gouv.sn",
    registration_url: "https://ena.sn/concours",
    status: "Ouvert"
  },
  {
    id: "sn-douanes-2026",
    title: "Concours des Sous-Officiers et Préposés des Douanes",
    institution: "Direction Générale des Douanes Sénégalaises",
    country: "Sénégal",
    city: "Dakar / Thiès",
    type: "Concours Militaire / Paramilitaire",
    sector: "Douanes & Finances",
    deadline: "2026-12-15",
    days_left: 57,
    requirements: ["BAC ou BFEM selon grade", "Aptitude physique certifiée", "Taille minimale 1m70 (H) / 1m65 (F)", "18-28 ans"],
    description: "Formation militaire et professionnelle à l'École des Douanes. Affectation dans les brigades frontalières, aéroportuaires et portuaires.",
    positions_count: 250,
    source_url: "https://douanes.sn",
    registration_url: "https://concours.douanes.sn",
    status: "Ouvert"
  },
  {
    id: "sn-fastef-2026",
    title: "Recrutement des Professeurs de l'Enseignement Secondaire (FASTEF)",
    institution: "Ministère de l'Éducation Nationale / UCAD",
    country: "Sénégal",
    city: "Dakar",
    type: "Concours Pédagogique",
    sector: "Éducation & Recherche",
    deadline: "2026-11-20",
    days_left: 32,
    requirements: ["Master 2 dans la discipline (Maths, PC, SVT, Lettres)", "Certificat médical d'aptitude"],
    description: "Recrutement et formation pédagogique des professeurs de collège et lycée pour combler le déficit dans les régions intérieures.",
    positions_count: 500,
    source_url: "https://education.gouv.sn",
    registration_url: "https://fastef.ucad.sn",
    status: "Ouvert"
  },
  {
    id: "sn-magistrature-2026",
    title: "Concours d'Accès au Centre de Formation Judiciaire (CFJ) — Magistrats",
    institution: "Centre de Formation Judiciaire (CFJ)",
    country: "Sénégal",
    city: "Dakar",
    type: "Concours Juridique",
    sector: "Justice",
    deadline: "2026-12-20",
    days_left: 62,
    requirements: ["Master 2 en Droit privé ou public", "Casier judiciaire vierge", "Nationalité sénégalaise"],
    description: "Formation probatoire de 2 ans pour devenir juge du siège ou magistrat du parquet dans les cours et tribunaux du Sénégal.",
    positions_count: 35,
    source_url: "https://justice.gouv.sn",
    registration_url: "https://cfj.sn",
    status: "Ouvert"
  },

  // --- CÔTE D'IVOIRE ---
  {
    id: "ci-ena-2026",
    title: "Concours Directs d'Entrée à l'ENA Côte d'Ivoire (Cycles Moyen et Supérieur)",
    institution: "École Nationale d'Administration Côte d'Ivoire",
    country: "Côte d'Ivoire",
    city: "Abidjan Cocody",
    type: "Concours Direct",
    sector: "Administration Publique",
    deadline: "2026-11-25",
    days_left: 37,
    requirements: ["BAC+3 à BAC+5 selon cycle", "Certificat de nationalité ivoirienne", "Âge max : 35 ans"],
    description: "Formation des cadres supérieurs de l'État : administrateurs des services financiers, diplomates, officiers de douane.",
    positions_count: 320,
    source_url: "https://fonctionpublique.gouv.ci",
    registration_url: "https://ena.ci",
    status: "Ouvert"
  },
  {
    id: "ci-infas-2026",
    title: "Concours d'Entrée à l'INFAS (Infirmiers, Sages-Femmes, Techniciens)",
    institution: "Institut National de Formation des Agents de Santé",
    country: "Côte d'Ivoire",
    city: "Abidjan, Bouaké, Korhogo, Daloa",
    type: "Concours Paramédical",
    sector: "Santé Publique",
    deadline: "2026-11-15",
    days_left: 27,
    requirements: ["BAC toutes séries pour IDE/Sage-Femme", "BEPC pour aides-soignants", "Visite médicale préalable"],
    description: "Premier concours de santé de Côte d'Ivoire, intégrant des milliers d'étudiants dans les centres régionaux hospitaliers.",
    positions_count: 4500,
    source_url: "https://sante.gouv.ci",
    registration_url: "https://infas.ci",
    status: "Urgent (Ferme bientôt)"
  },
  {
    id: "ci-police-2026",
    title: "Concours Direct de Recrutement d'Élèves Sous-Officiers de Police",
    institution: "Direction Générale de la Police Nationale (DGPN)",
    country: "Côte d'Ivoire",
    city: "Abidjan Plateau",
    type: "Concours Paramilitaire",
    sector: "Sécurité & Défense",
    deadline: "2026-12-05",
    days_left: 47,
    requirements: ["BAC exigé pour Sous-Officiers", "Taille 1m68 min (H) / 1m63 min (F)", "Aptitude physique"],
    description: "Recrutement massif pour renforcer la couverture sécuritaire des districts d'Abidjan et des corridors frontaliers.",
    positions_count: 2000,
    source_url: "https://police.interieur.gouv.ci",
    registration_url: "https://concourspolice-ci.net",
    status: "Ouvert"
  },
  {
    id: "ci-tresor-2026",
    title: "Recrutement Exceptionnel de Contrôleurs du Trésor Public",
    institution: "Direction Générale du Trésor et de la Comptabilité Publique",
    country: "Côte d'Ivoire",
    city: "Abidjan Plateau",
    type: "Recrutement Direct",
    sector: "Douanes & Finances",
    deadline: "2026-12-30",
    days_left: 72,
    requirements: ["BAC+2 en Gestion, Finance ou Comptabilité (BTS, DUT)", "SYSCOHADA révisé"],
    description: "Gestion des recettes publiques et centralisation des flux financiers de l'État ivoirien.",
    positions_count: 140,
    source_url: "https://tresor.gouv.ci",
    registration_url: "https://tresor.gouv.ci/recrutement",
    status: "Ouvert"
  },

  // --- INSTITUTIONS SOUS-RÉGIONALES (UEMOA / CEDEAO / BCEAO / BAD) ---
  {
    id: "reg-bceao-2026",
    title: "Programme Jeunes Professionnels (PJP) BCEAO — Promotion 2026-2028",
    institution: "Banque Centrale des États de l'Afrique de l'Ouest (BCEAO)",
    country: "Sous-Région UEMOA",
    city: "Dakar (Siège)",
    type: "Concours Régional Élite",
    sector: "Banque Centrale & Économie",
    deadline: "2026-11-28",
    days_left: 40,
    requirements: ["Ressortissant d'un pays membre UEMOA", "BAC+5 (Master 2, Ingénieur)", "Âge max : 30 ans", "Excellence académique"],
    description: "Le programme de recrutement le plus prestigieux d'Afrique de l'Ouest. Statut international diplomatique, salaire et avantages exceptionnels.",
    positions_count: 24,
    source_url: "https://bceao.int",
    registration_url: "https://bceao.int/recrutement",
    status: "Ouvert"
  },
  {
    id: "reg-bad-2026",
    title: "Programme des Jeunes Professionnels (YPP) BAD Abidjan",
    institution: "Banque Africaine de Développement (BAD)",
    country: "Côte d'Ivoire / Panafricain",
    city: "Abidjan (Siège)",
    type: "Concours International",
    sector: "Développement & Finance",
    deadline: "2026-12-10",
    days_left: 52,
    requirements: ["Nationalité d'un pays membre", "Master 2 ou PhD", "Moins de 32 ans", "Bilingue Français/Anglais obligatoire"],
    description: "Intégration accélérée dans la première institution de financement du développement en Afrique. Missions à travers tout le continent.",
    positions_count: 30,
    source_url: "https://afdb.org",
    registration_url: "https://afdb.org/careers",
    status: "Ouvert"
  },

  // --- BÉNIN ---
  {
    id: "bj-tresor-2026",
    title: "Concours de Recrutement au Profit du Ministère de l'Économie et des Finances",
    institution: "Ministère de l'Économie et des Finances Bénin",
    country: "Bénin",
    city: "Cotonou",
    type: "Concours Direct",
    sector: "Douanes & Finances",
    deadline: "2026-12-01",
    days_left: 43,
    requirements: ["Diplôme BAC+3 à BAC+5 en Économie ou Finance", "Nationalité béninoise"],
    description: "Renforcement des services déconcentrés du Trésor et de la Direction Générale des Impôts.",
    positions_count: 120,
    source_url: "https://travail.gouv.bj",
    registration_url: "https://concours.gouv.bj",
    status: "Ouvert"
  },

  // --- TOGO ---
  {
    id: "tg-otr-2026",
    title: "Recrutement d'Agents et Cadres à l'Office Togolais des Recettes (OTR)",
    institution: "Office Togolais des Recettes (OTR)",
    country: "Togo",
    city: "Lomé",
    type: "Recrutement Direct Public",
    sector: "Douanes & Finances",
    deadline: "2026-11-22",
    days_left: 34,
    requirements: ["BAC+2 minimum", "Compétences fiscalité/douanes ou informatique"],
    description: "L'OTR fusionne impôts et douanes du Togo. Rémunérations parmi les plus attractives du secteur public togolais.",
    positions_count: 90,
    source_url: "https://otr.tg",
    registration_url: "https://recrutement.otr.tg",
    status: "Ouvert"
  }
];

function getActiveCompetitions(filters = {}) {
  const { country, sector, status } = filters;
  return CONCOURS_CATALOG.filter(c => {
    if (country && country !== "Tous" && c.country !== country) return false;
    if (sector && sector !== "Tous" && c.sector !== sector) return false;
    if (status && c.status !== status) return false;
    return true;
  });
}

function getUpcomingDeadlines(days = 40) {
  return CONCOURS_CATALOG
    .filter(c => c.days_left <= days)
    .sort((a, b) => a.days_left - b.days_left);
}

function searchConcours(query) {
  if (!query) return CONCOURS_CATALOG;
  const q = query.toLowerCase();
  return CONCOURS_CATALOG.filter(c => 
    c.title.toLowerCase().includes(q) ||
    c.institution.toLowerCase().includes(q) ||
    c.sector.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q)
  );
}

function getStats() {
  const total = CONCOURS_CATALOG.length;
  const totalPositions = CONCOURS_CATALOG.reduce((acc, c) => acc + (c.positions_count || 0), 0);
  const byCountry = {};
  const bySector = {};

  CONCOURS_CATALOG.forEach(c => {
    byCountry[c.country] = (byCountry[c.country] || 0) + 1;
    bySector[c.sector] = (bySector[c.sector] || 0) + 1;
  });

  return {
    total_competitions: total,
    total_positions_available: totalPositions,
    by_country: byCountry,
    by_sector: bySector
  };
}

module.exports = {
  CONCOURS_CATALOG,
  getActiveCompetitions,
  getUpcomingDeadlines,
  searchConcours,
  getStats
};
