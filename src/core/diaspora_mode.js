/**
 * DIASPORA MODE — Accompagnement Retour & Mobilité Internationale vers l'AOF
 * ─────────────────────────────────────────────────────────────────────────────
 * Traduction de compétences, conversion de salaires avec pouvoir d'achat,
 * équivalences de diplômes (LMD/CAMES) et conseils d'installation
 */

const salaryBenchmark = require('./salary_benchmark');

const LIVING_COST_RATIOS = {
  // Base 100 = Paris
  "Paris": 100,
  "Lyon": 82,
  "Montréal": 85,
  "Bruxelles": 88,
  "New York": 140,
  "Londres": 125,
  "Dakar": 44,
  "Abidjan": 47,
  "Cotonou": 33,
  "Lomé": 34,
  "Bamako": 36,
  "Ouagadougou": 35
};

const EQUIVALENT_TITLES = {
  "software engineer": "Ingénieur d'Études & Développement",
  "frontend developer": "Développeur Web Frontend",
  "backend developer": "Développeur Backend & API",
  "fullstack developer": "Développeur Full-Stack Web & Mobile",
  "data scientist": "Data Scientist / Ingénieur Data",
  "data analyst": "Analyste Décisionnel & BI",
  "devops engineer": "Ingénieur Cloud & DevOps",
  "product manager": "Chef de Produit Digital",
  "project manager": "Chef de Projet Informatique / Organisation",
  "scrum master": "Scrum Master / Coach Agile",
  "financial controller": "Contrôleur de Gestion (SYSCOHADA)",
  "accountant": "Comptable Général / Chef Comptable",
  "auditor": "Auditeur Interne / Commissaire aux Comptes",
  "hr business partner": "Responsable Ressources Humaines (GPEC)",
  "talent acquisition": "Chargé de Recrutement & Marque Employeur",
  "sales manager": "Responsable Commercial Régional",
  "supply chain manager": "Responsable Supply Chain & Logistique"
};

function convertSalaryToAOF(amount, sourceCurrency = "EUR", sourceCity = "Paris", targetCity = "Dakar") {
  const EUR_TO_XOF = 655.957;
  const USD_TO_XOF = 610.0;
  const CAD_TO_XOF = 450.0;
  const GBP_TO_XOF = 780.0;

  let amountInEUR = amount;
  if (sourceCurrency === "USD") amountInEUR = (amount * USD_TO_XOF) / EUR_TO_XOF;
  if (sourceCurrency === "CAD") amountInEUR = (amount * CAD_TO_XOF) / EUR_TO_XOF;
  if (sourceCurrency === "GBP") amountInEUR = (amount * GBP_TO_XOF) / EUR_TO_XOF;

  const nominalFCFA = Math.round(amountInEUR * EUR_TO_XOF);

  const sourceIndex = LIVING_COST_RATIOS[sourceCity] || 100;
  const targetIndex = LIVING_COST_RATIOS[targetCity] || 45;
  const costRatio = targetIndex / sourceIndex;

  // Salaire équivalent en pouvoir d'achat net local
  const equivalentFCFA = Math.round(nominalFCFA * costRatio);

  // Fourchette recommandée pour négocier sur le marché local (targetCity)
  const negociationMin = Math.round(equivalentFCFA * 0.85);
  const negociationMax = Math.round(equivalentFCFA * 1.25);

  return {
    source_amount: amount,
    source_currency: sourceCurrency,
    source_city: sourceCity,
    target_city: targetCity,
    nominal_fcfa: nominalFCFA,
    equivalent_purchasing_power_fcfa: equivalentFCFA,
    recommended_negotiation_range: {
      min: negociationMin,
      max: negociationMax,
      formatted: `${(negociationMin).toLocaleString('fr-FR')} - ${(negociationMax).toLocaleString('fr-FR')} FCFA net/mois`
    },
    rent_differential: `Les loyers à ${targetCity} sont en moyenne ${Math.round((1 - (targetIndex/sourceIndex)) * 100)}% moins élevés qu'à ${sourceCity}.`,
    cost_index_comparison: {
      source: { city: sourceCity, index: sourceIndex },
      target: { city: targetCity, index: targetIndex }
    }
  };
}

function adaptCVForAOF(profile) {
  if (!profile) return { error: "Profil manquant" };

  const recommendations = [];
  const changes = [];

  // 1. Titre de poste
  const normalizedTitle = (profile.title || "").toLowerCase();
  let suggestedTitle = profile.title;
  for (const [en, fr] of Object.entries(EQUIVALENT_TITLES)) {
    if (normalizedTitle.includes(en)) {
      suggestedTitle = fr;
      changes.push(`Titre adapté pour les DRH locaux : "${profile.title}" ➔ "${fr}"`);
      break;
    }
  }

  // 2. Mention WhatsApp obligatoire
  if (!profile.phone || !profile.phone.startsWith('+')) {
    recommendations.push("⚠️ Indiquez impérativement un numéro au format international (+33, +1, +221...) et précisez qu'il dispose de WhatsApp.");
  }

  // 3. Équivalences académiques CAMES
  const education = (profile.education || "").toLowerCase();
  let educationCAMES = profile.education;
  if (education.includes("master") || education.includes("ingénieur") || education.includes("msc") || education.includes("mba")) {
    educationCAMES = `${profile.education} (Équivalent Master 2 / BAC+5 CAMES)`;
    changes.push("Mention de l'équivalence BAC+5 / Master 2 ajoutée pour la grille indiciaire locale.");
  } else if (education.includes("bachelor") || education.includes("licence") || education.includes("bsc")) {
    educationCAMES = `${profile.education} (Équivalent Licence / BAC+3 CAMES)`;
  }

  // 4. Mobilité et disponibilité
  const mobilityStatement = `Ressortissant / Professionnel de la diaspora en transition vers ${profile.country || "l'Afrique de l'Ouest"}. Disponible pour entretiens en visio et installation sur site sous 30 à 60 jours.`;

  // 5. Mise en avant des compétences sous-régionales
  recommendations.push("💡 Mentionnez vos expériences multiculturelles et votre capacité à manager des équipes locales.");
  recommendations.push("💡 Dans votre lettre de motivation, explicitez la clarté et la pérennité de votre projet de retour.");

  return {
    original_title: profile.title,
    suggested_title: suggestedTitle,
    adapted_education: educationCAMES,
    mobility_statement: mobilityStatement,
    applied_changes: changes,
    expert_recommendations: recommendations
  };
}

function getDiasporaGuide(country = "Sénégal") {
  const guides = {
    "Sénégal": {
      country: "Sénégal",
      currency: "Franc CFA (XOF) - Parité fixe avec l'Euro (1 EUR = 655,957 XOF)",
      main_cities: ["Dakar (Plateau, Almadies, Mermoz, Point E)", "Diamniadio (Pôle ministériel & technologique)", "Saly / Thiès"],
      banking_diaspora: ["BNP Paribas / BICIS", "Société Générale Sénégal", "CBAO Attijariwafa", "Coris Bank", "Wave (pour dépenses courantes à 0%)"],
      tax_tips: "Pas de double imposition entre la France et le Sénégal (convention bilatérale). Statut de résident fiscal acquis après 183 jours/an de présence.",
      housing_avg_dakar: "Appartement standing 3 pièces (Plateau / Almadies) : 450 000 - 850 000 FCFA/mois. Mermoz / Sacré-Cœur : 300 000 - 550 000 FCFA/mois.",
      schools: "Lycée Français Jean-Mermoz, École Internationale Bilingue, Cours Sainte-Marie de Hann.",
      top_employers_diaspora: ["Sonatel / Orange", "Wave", "BCEAO", "DP World Dakar", "Eiffage Sénégal", "Startups tech (CTIC, Seedstars)"]
    },
    "Côte d'Ivoire": {
      country: "Côte d'Ivoire",
      currency: "Franc CFA (XOF)",
      main_cities: ["Abidjan (Cocody, Plateau, Marcory Zone 4, Deux Plateaux)", "San Pedro", "Yamoussoukro"],
      banking_diaspora: ["Société Générale Côte d'Ivoire", "NSIA Banque", "Ecobank", "Standard Chartered Abidjan", "Orange Bank"],
      tax_tips: "Convention fiscale avec l'Union Européenne. Régime d'incitation aux investissements des Ivoiriens de l'Extérieur (Fonds FNDI).",
      housing_avg_abidjan: "Appartement 3 pièces Cocody Riviera / Marcory Zone 4 : 500 000 - 950 000 FCFA/mois. Deux Plateaux : 350 000 - 650 000 FCFA/mois.",
      schools: "Lycée Français Blaise-Pascal, École Internationale d'Abidjan, Cours Sévigné.",
      top_employers_diaspora: ["Banque Africaine de Développement (BAD)", "Orange CI", "MTN", "SIFCA", "Bolloré / AGL", "FinTechs Abidjan"]
    }
  };

  return guides[country] || guides["Sénégal"];
}

module.exports = {
  convertSalaryToAOF,
  adaptCVForAOF,
  getDiasporaGuide,
  LIVING_COST_RATIOS,
  EQUIVALENT_TITLES
};
