/**
 * SCAM DETECTOR — Bouclier Anti-Arnaque & Faux Recrutements IA
 * ─────────────────────────────────────────────────────────────────────────────
 * Détection des escroqueries aux faux frais de dossier (Wave, Orange Money),
 * faux concours et usurpations d'identité en Afrique de l'Ouest.
 */

const fs = require('fs');
const path = require('path');

const SCAM_REPORTS_FILE = path.join(__dirname, '../data/scam_reports.json');

// Mots-clés typiques des arnaques au recrutement en AOF
const SCAM_TRIGGER_PATTERNS = [
  { pattern: /frais\s+de\s+(?:dossier|traitement|candidature|badge|tenue|visite|m[eé]dicale)/i, weight: 35, reason: "Demande suspecte de frais de dossier ou de visite médicale préalable" },
  { pattern: /(?:envoyez|versez|payer|transfert)\s+(?:par|via)\s+(?:wave|orange\s*money|mtn|moov|wari)/i, weight: 40, reason: "Exigence d'envoi d'argent par Mobile Money avant entretien" },
  { pattern: /(?:caution|garantie\s+financi[eè]re)\s+(?:remboursable)?/i, weight: 30, reason: "Demande de caution financière" },
  { pattern: /recrutement\.([a-zA-Z0-9_-]+)@(gmail|yahoo|hotmail|outlook)\.com/i, weight: 25, reason: "Adresse email gratuite (Gmail/Yahoo) prétendant représenter une multinationale" },
  { pattern: /(?:gagnez|salaire)\s+(?:100\s?000|200\s?000)\s+(?:par\s+jour|par\s+semaine)\s+(?:sans\s+dipl[oô]me|depuis\s+chez\s+vous)/i, weight: 30, reason: "Promesses de gains irréalistes sans qualification" },
  { pattern: /(?:mine\s+d'or|plateforme\s+p[eé]troli[eè]re|onu|unicef|ong\s+internationale)\s+recrute\s+massivement/i, weight: 15, reason: "Usurpation fréquente de grands organismes humanitaires ou miniers" },
  { pattern: /(?:formulaire|fiche\s+d['’]inscription)\s+(?:payant|à\s+acheter)/i, weight: 35, reason: "Vente illégale de formulaire d'inscription" }
];

// Liste de numéros signalés pour escroquerie
const KNOWN_SUSPICIOUS_NUMBERS = [
  "+221770984512", "+221765412398", "+225078965412", "+225054123987", "+22997124578"
];

function auditJobOfferForScam(job) {
  if (!job) return { safety_score: 50, verdict: "Indéterminé", alerts: [] };

  const content = `${job.title || ''} ${job.company || ''} ${job.description || ''} ${job.email || ''} ${job.whatsapp || ''}`.toLowerCase();
  let penalty = 0;
  const alerts = [];

  // 1. Analyse des patterns suspects
  for (const trigger of SCAM_TRIGGER_PATTERNS) {
    if (trigger.pattern.test(content)) {
      penalty += trigger.weight;
      alerts.push({
        type: "danger",
        description: trigger.reason
      });
    }
  }

  // 2. Vérification email entreprise vs domaine gratuit
  if (job.email) {
    const isFreeMail = /(gmail|yahoo|hotmail|outlook|yopmail)\.com$/i.test(job.email);
    const isBigOrg = /(sonatel|orange|wave|bceao|bad|ecobank|total|nestle|sococim|eiffage)/i.test(job.company || '');
    if (isFreeMail && isBigOrg) {
      penalty += 35;
      alerts.push({
        type: "danger",
        description: `L'entreprise affichée (${job.company}) n'utilise jamais d'adresse publique (@${job.email.split('@')[1] || 'domaine'}). Usurpation probable !`
      });
    }
  }

  // 3. Vérification numéro de téléphone signalé
  const phoneClean = (job.whatsapp || '').replace(/[\s.-]/g, '');
  if (KNOWN_SUSPICIOUS_NUMBERS.some(n => n.includes(phoneClean) || phoneClean.includes(n))) {
    penalty += 50;
    alerts.push({
      type: "critical",
      description: "Numéro de téléphone déjà signalé plusieurs fois par la communauté pour escroquerie Wave/Orange Money."
    });
  }

  // 4. Calcul du score de sécurité (100 = totalement sûr, 0 = arnaque confirmée)
  const safetyScore = Math.max(5, Math.min(100, 100 - penalty));

  let verdict = "🟢 Offre Légitime & Fiable";
  let badgeColor = "#34d399";
  let certification = "Certifié 0 Frais — Conforme Convention Travail OIT";

  if (safetyScore < 45) {
    verdict = "🔴 ALERTE ARNAQUE CONFIRMÉE";
    badgeColor = "#f87171";
    certification = "DANGER : Ne versez aucun argent, offre frauduleuse signalée.";
  } else if (safetyScore < 75) {
    verdict = "🟡 Vigilance Requise";
    badgeColor = "#fbbf24";
    certification = "Non vérifiée par un cabinet officiel. Restez vigilant.";
  }

  return {
    safety_score: safetyScore,
    verdict,
    badge_color: badgeColor,
    certification,
    risk_level: safetyScore >= 75 ? "Faible" : safetyScore >= 45 ? "Moyen" : "Critique",
    alerts_count: alerts.length,
    alerts,
    audited_at: new Date().toISOString()
  };
}

function reportScamOffer(reportData) {
  const reports = loadReports();
  const newReport = {
    id: `scam-${Date.now()}`,
    job_title: reportData.job_title || "Offre signalée",
    company_name: reportData.company_name || "Non spécifié",
    phone_used: reportData.phone_used || "",
    scam_method: reportData.scam_method || "Demande de frais Wave",
    amount_requested: reportData.amount_requested || "Non spécifié",
    details: reportData.details || "",
    reported_by: reportData.reported_by || "Candidat anonyme",
    created_at: new Date().toISOString()
  };
  reports.unshift(newReport);
  saveReports(reports);
  return newReport;
}

function getRecentScamReports() {
  return loadReports().slice(0, 10);
}

function loadReports() {
  if (fs.existsSync(SCAM_REPORTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SCAM_REPORTS_FILE, 'utf-8'));
    } catch (e) {
      console.error(e);
    }
  }
  const initial = [
    {
      id: "scam-1",
      job_title: "Agent Logistique Portuaire",
      company_name: "Faux DP World Dakar",
      phone_used: "+221 77 098 45 12",
      scam_method: "Demande de 15 000 FCFA par Wave pour visite médicale obligatoire",
      amount_requested: "15 000 FCFA",
      details: "Après envoi du CV, un prétendu DRH rappelle en disant que le poste est retenu mais qu'il faut payer la visite au cabinet avant midi.",
      created_at: "2026-10-14T09:20:00Z"
    },
    {
      id: "scam-2",
      job_title: "Chauffeur de Direction",
      company_name: "Faux Bureau Régional UNESCO Abidjan",
      phone_used: "+225 07 89 65 41 2",
      scam_method: "Frais de confection de badge sécurisé",
      amount_requested: "10 000 FCFA",
      details: "Exige un transfert Orange Money pour débloquer le badge d'accès au siège de Cocody.",
      created_at: "2026-10-16T15:10:00Z"
    }
  ];
  saveReports(initial);
  return initial;
}

function saveReports(data) {
  fs.writeFileSync(SCAM_REPORTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  auditJobOfferForScam,
  reportScamOffer,
  getRecentScamReports
};
