/**
 * REMOTE HUB — Télétravail International & Facturation Devises ➔ Wave
 * ─────────────────────────────────────────────────────────────────────────────
 * Opportunités 100% remote depuis Dakar ou Abidjan payées en Euros/Dollars,
 * générateur de devis/factures export conformes OHADA.
 */

const REMOTE_JOBS_CATALOG = [
  {
    id: "rem-001",
    title: "Développeur React / Next.js (Full Remote)",
    company: "Studio Web Paris (France)",
    currency: "EUR",
    salary_amount: 2800,
    salary_fcfa_equivalent: "1 836 000 FCFA net / mois",
    location: "100% Télétravail depuis l'Afrique de l'Ouest",
    timezone: "UTC à UTC+2 (Parfait pour Sénégal/CI)",
    requirements: ["3 ans d'exp Next.js", "TypeScript", "Autonomie et bonne connexion fibre"],
    perks: "Paiement direct virement SEPA ou SWIFT, forfait internet fibre pris en charge",
    direct_apply_email: "recrutement@studioweb-paris.fr"
  },
  {
    id: "rem-002",
    title: "Customer Support Bilingue (Français / Anglais)",
    company: "SaaS Montréal (Canada)",
    currency: "USD",
    salary_amount: 2200,
    salary_fcfa_equivalent: "1 342 000 FCFA net / mois",
    location: "100% Télétravail (Dakar, Abidjan, Cotonou)",
    timezone: "Horaires flexibles",
    requirements: ["Bilinguisme parfait écrit/oral", "Aisance avec Zendesk / Intercom", "Rigueur"],
    perks: "Matériel informatique fourni (MacBook envoyé par DHL)",
    direct_apply_email: "jobs@saas-montreal.ca"
  },
  {
    id: "rem-003",
    title: "Data Analyst & Power BI Consultant",
    company: "Cabinet Conseil Bruxelles (Belgique)",
    currency: "EUR",
    salary_amount: 3200,
    salary_fcfa_equivalent: "2 099 000 FCFA net / mois",
    location: "Remote Afrique Francophone",
    timezone: "Aligné sur l'Europe",
    requirements: ["SQL avancé", "Power BI / DAX", "Modélisation financière"],
    perks: "Contrat de prestation longue durée renouvelable",
    direct_apply_email: "talent@consulting-bruxelles.be"
  }
];

function getRemoteJobs() {
  return REMOTE_JOBS_CATALOG;
}

function generateInternationalInvoice(data) {
  const {
    invoice_number = `FACT-${Date.now().toString().slice(-6)}`,
    freelancer_name = "Ibrahima Ndiaye",
    freelancer_address = "Dakar, Sénégal (RCCM SN.DKR.2024.A.1234)",
    client_name = "Studio Web Paris SAS",
    client_address = "12 Rue de la Paix, 75002 Paris, France",
    service_description = "Développement Frontend Next.js & Intégration API (Prestation Mensuelle)",
    amount_currency = 2800,
    currency = "EUR",
    payout_method = "Wave / Virement Bancaire"
  } = data;

  const EUR_TO_XOF = 655.957;
  const fcfaEquivalent = Math.round(amount_currency * EUR_TO_XOF);

  return {
    invoice_number,
    date: new Date().toLocaleDateString('fr-FR'),
    issuer: {
      name: freelancer_name,
      address: freelancer_address,
      tax_status: "Exportation de services immatériels (Exonération TVA Art. 343 CGI Sénégal / UEMOA)"
    },
    client: {
      name: client_name,
      address: client_address
    },
    line_items: [
      {
        description: service_description,
        quantity: 1,
        unit_price: amount_currency,
        total: amount_currency
      }
    ],
    currency,
    total_amount: amount_currency,
    total_fcfa_equivalent: `${fcfaEquivalent.toLocaleString('fr-FR')} FCFA`,
    payment_terms: "Paiement à réception sous 15 jours",
    payout_method
  };
}

module.exports = {
  getRemoteJobs,
  generateInternationalInvoice
};
