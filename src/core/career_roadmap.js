/**
 * CAREER ROADMAP — Mentor de Carrière & Trajectoire Salariale IA (3 Ans)
 * ─────────────────────────────────────────────────────────────────────────────
 * Calcule la feuille de route pas-à-pas pour accélérer sa rémunération
 * (ex: passer de 300 000 FCFA à 1 500 000 FCFA) en Afrique de l'Ouest.
 */

function generateCareerRoadmap(currentRole, currentSalary, targetRole, targetSalary, sector = "Tech & Digital", city = "Dakar") {
  const curSal = parseInt(currentSalary) || 450000;
  const tarSal = parseInt(targetSalary) || 1400000;

  // Calcul du gain salarial
  const salaryMultiplier = (tarSal / curSal).toFixed(1);
  const totalGain = tarSal - curSal;

  const y1_salary = Math.round(curSal + (totalGain * 0.35));
  const y2_salary = Math.round(curSal + (totalGain * 0.70));
  const y3_salary = tarSal;

  return {
    trajectory_overview: {
      current_role: currentRole || "Développeur Junior",
      current_salary: `${curSal.toLocaleString('fr-FR')} FCFA net`,
      target_role: targetRole || "Lead Architecte / CTO",
      target_salary: `${tarSal.toLocaleString('fr-FR')} FCFA net`,
      multiplier: `${salaryMultiplier}x`,
      timeline: "36 mois (3 ans)",
      city,
      sector
    },
    yearly_plan: [
      {
        year: "Année 1 : Maîtrise Technique & Première Revalorisation",
        target_salary: `${y1_salary.toLocaleString('fr-FR')} FCFA net / mois`,
        focus: "Consolidation des compétences socles & autonomie totale de livraison",
        certifications_to_get: [
          sector === "Tech & Digital" ? "Certification Cloud (AWS Associate ou GCP)" : "Certification SYSCOHADA Révisé / Sage 100",
          "Anglais professionnel opérationnel (TOEIC ou Duolingo Score 115+)"
        ],
        concrete_actions: [
          "Prendre le lead sur au moins un projet critique de l'entreprise actuelle",
          "Documenter toutes ses réalisations sous forme d'indicateurs chiffrés",
          "Négocier une revalorisation annuelle ou postuler sur des postes confirmés à Dakar/Abidjan"
        ],
        target_companies_y1: ["PME locales structurées", "Startups FinTech en phase d'accélération"]
      },
      {
        year: "Année 2 : Positionnement Senior & Management d'Équipe",
        target_salary: `${y2_salary.toLocaleString('fr-FR')} FCFA net / mois`,
        focus: "Supervision de juniors, architecture/stratégie et relation avec les directions",
        certifications_to_get: [
          sector === "Tech & Digital" ? "Kubernetes CKA ou Professional Cloud Architect" : "Diplôme DESCOGEF / Certificat IFRS",
          "Méthodologies Agiles / Scrum Master"
        ],
        concrete_actions: [
          "Participer activement aux jurys ou meetups professionnels de la place",
          "Construire son cercle de cooptation (Piston Digital) auprès de 5 managers influents",
          "Décrocher un poste de Chef d'équipe ou Senior dans un grand groupe"
        ],
        target_companies_y2: ["Sonatel / Orange", "Wave", "Coris Bank", "Bolloré / AGL"]
      },
      {
        year: "Année 3 : Accès au Top Management & Rémunération Cadre Supérieur",
        target_salary: `${y3_salary.toLocaleString('fr-FR')} FCFA net / mois`,
        focus: "Pilotage stratégique, négociation de package global et impact sous-régional",
        certifications_to_get: [
          "Mini-MBA / Executive Certificate Management Stratégique",
          "Gouvernance d'entreprise et Risk Management UEMOA"
        ],
        concrete_actions: [
          "Négocier un package complet : 13e mois, IPM 100%, véhicule de fonction et prime de performance",
          "Intervenir comme mentor ou expert auprès de startups locales",
          "Accéder aux comités de direction ou postes de direction régionale"
        ],
        target_companies_y3: ["BCEAO / BAD", "Multinationales (Unilever, Nestlé)", "Groupes bancaires panafricains"]
      }
    ],
    mentor_verdict: `Votre objectif de passer de ${curSal.toLocaleString('fr-FR')} à ${tarSal.toLocaleString('fr-FR')} FCFA est parfaitement réaliste sur le marché de ${city}. La clé réside dans l'obtention de 2 certifications internationales dès l'Année 1.`
  };
}

module.exports = {
  generateCareerRoadmap
};
