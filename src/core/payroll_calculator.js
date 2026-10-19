/**
 * PAYROLL CALCULATOR — Moteur de Fiche de Paie & Contrats de Travail UEMOA
 * ─────────────────────────────────────────────────────────────────────────────
 * Calcul précis des cotisations sociales, impôts et coût total employeur
 * pour le Sénégal (Code du Travail / DGID) et la Côte d'Ivoire (Code du Travail / DGI).
 */

/**
 * Calcul complet de la fiche de paie au Sénégal (en FCFA / mois)
 */
function calculatePayrollSenegal(grossSalary, options = {}) {
  const gross = Math.max(0, parseFloat(grossSalary) || 0);
  const isCadre = options.isCadre !== undefined ? options.isCadre : true;
  const partsFiscales = parseFloat(options.partsFiscales) || 1.5; // Célibataire = 1, marié = 1.5, +0.5/enfant

  // 1. Cotisations Sociales Salariales
  // IPRES Régime Général (Plafond 480 000 FCFA - Taux salarié : 5.6%)
  const assietteIpresRG = Math.min(gross, 480000);
  const ipresRG_sal = Math.round(assietteIpresRG * 0.056);

  // IPRES Régime Cadre (Tranche B entre 480 000 et 1 440 000 FCFA - Taux salarié : 2.4%)
  let ipresCadre_sal = 0;
  if (isCadre && gross > 480000) {
    const assietteIpresCadre = Math.min(gross - 480000, 960000);
    ipresCadre_sal = Math.round(assietteIpresCadre * 0.024);
  }

  // IPM (Institut de Prévoyance Médicale - ~3% plafonné)
  const ipm_sal = Math.round(Math.min(gross, 300000) * 0.03);

  const totalCotisationsSal = ipresRG_sal + ipresCadre_sal + ipm_sal;

  // 2. Base Imposable à l'IR
  const brutFiscal = gross - totalCotisationsSal;

  // Abattement forfaitaire pour frais professionnels (30% plafonné à 75 000 FCFA/mois selon CGI)
  const fraisPro = Math.min(brutFiscal * 0.30, 75000);
  const baseIR = Math.max(0, brutFiscal - fraisPro);

  // 3. Impôt sur le Revenu (Barème Progressif par tranches annuelles ramené au mois)
  const baseIR_annuel = baseIR * 12;
  let impotAnnuelBrut = 0;

  if (baseIR_annuel > 630000) {
    if (baseIR_annuel <= 1500000) impotAnnuelBrut = (baseIR_annuel - 630000) * 0.20;
    else if (baseIR_annuel <= 4000000) impotAnnuelBrut = 174000 + (baseIR_annuel - 1500000) * 0.30;
    else if (baseIR_annuel <= 8000000) impotAnnuelBrut = 924000 + (baseIR_annuel - 4000000) * 0.35;
    else if (baseIR_annuel <= 13500000) impotAnnuelBrut = 2324000 + (baseIR_annuel - 8000000) * 0.37;
    else impotAnnuelBrut = 4359000 + (baseIR_annuel - 13500000) * 0.40;
  }

  // Réduction pour charges de famille (parts fiscales)
  let tauxReductionFamille = 0;
  if (partsFiscales === 1.5) tauxReductionFamille = 0.10;
  else if (partsFiscales === 2.0) tauxReductionFamille = 0.15;
  else if (partsFiscales === 2.5) tauxReductionFamille = 0.20;
  else if (partsFiscales === 3.0) tauxReductionFamille = 0.25;
  else if (partsFiscales >= 3.5) tauxReductionFamille = 0.30;

  const impotAnnuelNet = Math.max(0, impotAnnuelBrut * (1 - tauxReductionFamille));
  const irMensuel = Math.round(impotAnnuelNet / 12);

  // TRIMF (Taxe Représentative de l'Impôt sur le Minimum Fiscal : ~1 500 à 3 000 FCFA)
  let trimf = 1500;
  if (gross > 500000) trimf = 3000;
  else if (gross < 150000) trimf = 600;

  const totalImpotsSal = irMensuel + trimf;

  // 4. Salaire Net Salarié
  const netSalary = Math.round(gross - totalCotisationsSal - totalImpotsSal);

  // 5. Cotisations Patronales (Coût Entreprise)
  const ipresRG_pat = Math.round(assietteIpresRG * 0.084); // 8.4%
  let ipresCadre_pat = 0;
  if (isCadre && gross > 480000) {
    ipresCadre_pat = Math.round(Math.min(gross - 480000, 960000) * 0.036); // 3.6%
  }
  const cssPrestations = Math.round(Math.min(gross, 60000) * 0.07); // 7%
  const cssAccidents = Math.round(Math.min(gross, 60000) * 0.03); // 3%
  const ipm_pat = ipm_sal; // Paritaire 3%
  const cfce = Math.round(gross * 0.03); // Contribution Forfaitaire à la Charge de l'Employeur 3%

  const totalCotisationsPat = ipresRG_pat + ipresCadre_pat + cssPrestations + cssAccidents + ipm_pat + cfce;
  const totalEmployerCost = Math.round(gross + totalCotisationsPat);

  return {
    country: "Sénégal",
    currency: "FCFA (XOF)",
    gross_salary: gross,
    net_salary: netSalary,
    total_employer_cost: totalEmployerCost,
    deductions: {
      salariat: {
        ipres_regime_general: ipresRG_sal,
        ipres_cadre: ipresCadre_sal,
        ipm_mutuelle: ipm_sal,
        impot_sur_le_revenu: irMensuel,
        trimf: trimf,
        total_retenues: totalCotisationsSal + totalImpotsSal
      },
      patronat: {
        ipres_patronal: ipresRG_pat + ipresCadre_pat,
        caisse_securite_sociale: cssPrestations + cssAccidents,
        ipm_patronal: ipm_pat,
        taxe_cfce: cfce,
        total_charges_patronales: totalCotisationsPat
      }
    },
    ratios: {
      net_to_gross_pct: Math.round((netSalary / (gross || 1)) * 100),
      charges_patronales_pct: Math.round((totalCotisationsPat / (gross || 1)) * 100)
    }
  };
}

/**
 * Calcul de la fiche de paie en Côte d'Ivoire (en FCFA / mois)
 */
function calculatePayrollCoteIvoire(grossSalary, options = {}) {
  const gross = Math.max(0, parseFloat(grossSalary) || 0);
  const partsFiscales = parseFloat(options.partsFiscales) || 1.5;

  // 1. Cotisations Salariales
  // CNPS Retraite (Plafond 1 647 315 FCFA - Taux salarié : 6.3%)
  const assietteCnps = Math.min(gross, 1647315);
  const cnps_sal = Math.round(assietteCnps * 0.063);

  // CMU (Couverture Maladie Universelle - 1 000 FCFA fixe par personne)
  const cmu_sal = 1000;

  // 2. Impôts sur Salaire
  // Impôt sur Salaire (IS) : 1.2% du brut imposable (abattement 20%)
  const brutImposable = gross * 0.80;
  const is_sal = Math.round(brutImposable * 0.012);

  // Contribution Nationale (CN) : barème progressif
  let cn_sal = 0;
  if (brutImposable > 50000) {
    if (brutImposable <= 130000) cn_sal = (brutImposable - 50000) * 0.015;
    else if (brutImposable <= 200000) cn_sal = 1200 + (brutImposable - 130000) * 0.05;
    else cn_sal = 4700 + (brutImposable - 200000) * 0.10;
  }
  cn_sal = Math.round(cn_sal);

  // Impôt Général sur le Revenu (IGR) estimé selon parts
  const baseIGR = Math.max(0, (brutImposable - cn_sal - is_sal) / (partsFiscales || 1.5));
  let igr_sal = Math.round(Math.max(0, baseIGR * 0.08));

  const totalDeductionsSal = cnps_sal + cmu_sal + is_sal + cn_sal + igr_sal;
  const netSalary = Math.round(gross - totalDeductionsSal);

  // 3. Cotisations Patronales
  const cnps_pat = Math.round(assietteCnps * 0.077); // 7.7%
  const cnpsAccidents = Math.round(Math.min(gross, 70000) * 0.05); // 5%
  const cnpsAllocations = Math.round(Math.min(gross, 70000) * 0.0575); // 5.75%
  const taxesEmployeur = Math.round(gross * 0.028); // FDFP + Taxe apprentissage ~2.8%

  const totalPatronal = cnps_pat + cnpsAccidents + cnpsAllocations + taxesEmployeur;
  const totalEmployerCost = Math.round(gross + totalPatronal);

  return {
    country: "Côte d'Ivoire",
    currency: "FCFA (XOF)",
    gross_salary: gross,
    net_salary: netSalary,
    total_employer_cost: totalEmployerCost,
    deductions: {
      salariat: {
        cnps_retraite: cnps_sal,
        cmu_maladie: cmu_sal,
        impot_sur_salaire_is: is_sal,
        contribution_nationale_cn: cn_sal,
        igr: igr_sal,
        total_retenues: totalDeductionsSal
      },
      patronat: {
        cnps_retraite_patronal: cnps_pat,
        cnps_accidents_allocations: cnpsAccidents + cnpsAllocations,
        taxes_apprentissage_fdfp: taxesEmployeur,
        total_charges_patronales: totalPatronal
      }
    },
    ratios: {
      net_to_gross_pct: Math.round((netSalary / (gross || 1)) * 100),
      charges_patronales_pct: Math.round((totalPatronal / (gross || 1)) * 100)
    }
  };
}

/**
 * Calcul inverse : Partir du salaire Net souhaité pour déduire le Brut à demander
 */
function calculateGrossFromNet(netDesired, country = "Sénégal", isCadre = true) {
  let low = netDesired;
  let high = netDesired * 1.8;
  let estimatedGross = netDesired * 1.35;

  // Recherche par dichotomie rapide
  for (let i = 0; i < 20; i++) {
    estimatedGross = (low + high) / 2;
    const res = country === "Sénégal" 
      ? calculatePayrollSenegal(estimatedGross, { isCadre })
      : calculatePayrollCoteIvoire(estimatedGross);

    if (Math.abs(res.net_salary - netDesired) < 1000) break;
    if (res.net_salary < netDesired) low = estimatedGross;
    else high = estimatedGross;
  }

  const roundedGross = Math.round(estimatedGross / 1000) * 1000;
  return country === "Sénégal"
    ? calculatePayrollSenegal(roundedGross, { isCadre })
    : calculatePayrollCoteIvoire(roundedGross);
}

/**
 * Générateur de contrat de travail type (CDI, CDD, Stage) conforme UEMOA
 */
function generateLegalWorkContract(data) {
  const {
    contract_type = "CDI",
    candidate_name = "Ibrahima Ndiaye",
    candidate_address = "Dakar, Sénégal",
    company_name = "Baobab FinTech Solutions SARL",
    company_address = "Plateau, Dakar",
    job_title = "Ingénieur d'Études & Développement",
    gross_salary = 1100000,
    start_date = "01 Novembre 2026",
    country = "Sénégal"
  } = data;

  const trialPeriod = contract_type === "CDI" ? "3 mois (renouvelable une fois conformément à la Convention Collective)" : "1 mois";

  return {
    title: `CONTRAT DE TRAVAIL À DURÉE ${contract_type === 'CDI' ? 'INDÉTERMINÉE (CDI)' : 'DÉTERMINÉE (CDD)'}`,
    governing_law: country === "Sénégal" 
      ? "Loi n° 97-17 du 1er décembre 1997 portant Code du Travail de la République du Sénégal et Convention Collective Nationale Interprofessionnelle (CCNI)"
      : "Loi n° 2015-532 du 20 juillet 2015 portant Code du Travail de la République de Côte d'Ivoire",
    parties: {
      employer: `${company_name}, sise à ${company_address}`,
      employee: `M./Mme ${candidate_name}, demeurant à ${candidate_address}`
    },
    clauses: [
      {
        article: "Article 1 : Engagement et Fonctions",
        text: `L'Employeur engage l'Employé(e) en qualité de ${job_title}, qui accepte les responsabilités et missions attachées à ce poste sous l'autorité de la Direction.`
      },
      {
        article: "Article 2 : Période d'Essai",
        text: `Le présent contrat est conclu sous réserve d'une période d'essai de ${trialPeriod}. Durant cette période, chacune des parties pourra résilier le contrat sans indemnité de préavis.`
      },
      {
        article: "Article 3 : Rémunération",
        text: `En contrepartie de l'exercice de ses fonctions, l'Employé(e) percevra un salaire mensuel brut de ${gross_salary.toLocaleString('fr-FR')} FCFA, soumis aux retenues légales d'impôts et de cotisations sociales en vigueur.`
      },
      {
        article: "Article 4 : Protection Sociale & Santé",
        text: `L'Employé(e) bénéficiera de l'affiliation immédiate aux régimes légaux de retraite et de prévoyance (${country === 'Sénégal' ? 'IPRES, CSS et IPM d\'entreprise' : 'CNPS et CMU'}).`
      },
      {
        article: "Article 5 : Confidentialité & Loyauté",
        text: `L'Employé(e) s'engage à observer la plus stricte discrétion sur toutes les affaires et technologies dont il aura eu connaissance au sein de l'Entreprise.`
      }
    ],
    generated_at: new Date().toISOString()
  };
}

module.exports = {
  calculatePayrollSenegal,
  calculatePayrollCoteIvoire,
  calculateGrossFromNet,
  generateLegalWorkContract
};
