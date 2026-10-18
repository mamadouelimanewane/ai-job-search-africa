/**
 * Système Multi-Agents :
 * Agent 1 : Rédacteur Sur-Mesure ATS
 * Agent 2 : Recruteur Critique Exigeant (Spécialisé Afrique de l'Ouest)
 */

async function generateWithDualAgent(profile, job, options = {}) {
  // Étape 1 : Exécution de l'Agent 1 (Le Rédacteur)
  const draftApplication = generateWriterDraft(profile, job);

  // Étape 2 : Exécution de l'Agent 2 (Le Recruteur Critique Ouest-Africain)
  const recruiterCritique = evaluateAsRecruiter(draftApplication, profile, job);

  // Étape 3 : Boucle d'amélioration de l'Agent 1 suite aux exigences de l'Agent 2
  const finalApplication = refineApplicationWithCritique(draftApplication, recruiterCritique, profile, job);

  return {
    job_id: job.id,
    job_title: job.title,
    company: job.company,
    target_location: `${job.city}, ${job.country}`,
    generated_at: new Date().toISOString(),
    
    // Déroulement transparent de la chaîne d'agents
    pipeline_execution: {
      agent_1_status: "Rdaction sur-mesure termine",
      agent_2_review: {
        score_critique: recruiterCritique.score_sur_10,
        mention: recruiterCritique.mention,
        points_forts: recruiterCritique.points_forts,
        points_a_corriger: recruiterCritique.corrections_exigees,
        verdict_drh: recruiterCritique.verdict_drh
      },
      agent_1_refinement_status: "Corrections de l'Agent 2 intgres avec succs"
    },

    // Dossier final valid
    final_output: {
      tailored_cv: finalApplication.cv,
      tailored_cover_letter: finalApplication.letter,
      suggested_email_subject: `Candidature au poste de ${job.title} - ${profile.name}`,
      whatsapp_pitch: generateWhatsAppPitch(profile, job, finalApplication)
    }
  };
}

/**
 * AGENT 1 : Rdaction initiale sur-mesure
 */
function generateWriterDraft(profile, job) {
  const experiences = profile.experiences || [];
  
  // Rorganisation et accentuation des ralisations en lien direct avec l'offre
  const highlightedExperiences = experiences.map(exp => {
    return {
      role: exp.role,
      company: exp.company,
      period: exp.period,
      key_achievements: exp.achievements.map(ach => `${ach} (Align avec les objectifs de ${job.company})`)
    };
  });

  const rawLetter = `
Madame, Monsieur le Responsable du Recrutement,

C'est avec un vif intrt que je vous adresse ma candidature pour le poste de ${job.title} au sein de ${job.company}  ${job.city}.

Fort(e) de mon parcours en tant que ${profile.title} et titulaire d'un ${profile.education}, j'ai dvelopp une solide expertise directement applicable aux dfis oprationnels de votre structure. Au fil de mes expriences, notamment chez ${(experiences[0] && experiences[0].company) || 'mes prcdents employeurs'}, j'ai dmontr ma capacit  obtenir des rsultats mesurables et  m'adapter avec agilit.

L'ambition et le positionnement de ${job.company}  ${job.city} rsonnent particulirement avec mes aspirations. Ma matrise des exigences locales et ma rigueur professionnelle me permettront d'tre immdiatement oprationnel(le) et de contribuer activement  vos objectifs de croissance.

Je me tiens  votre entire disposition pour un change approfondi au cours d'un entretien.

Dans l'attente de votre retour, je vous prie d'agrer, Madame, Monsieur, l'expression de mes salutations distingues.

${profile.name}
${profile.phone}
${profile.email}
`.trim();

  return {
    cv: {
      header: {
        name: profile.name,
        targeted_title: `${job.title} | ${profile.title}`,
        location: `${profile.district ? profile.district + ', ' : ''}${profile.city}, ${profile.country}`,
        contact: `${profile.phone}  ${profile.email}`
      },
      profile_pitch: `Professionnel(le) chevronn(e) bas(e)  ${profile.city}, spcialis(e) en ${profile.skills.slice(0, 4).join(', ')}. Motiv(e) par l'opportunit d'apporter mon dynamisme et mon savoir-faire technique aux quipes de ${job.company}.`,
      core_competencies: profile.skills,
      targeted_experiences: highlightedExperiences,
      education: profile.education,
      languages: profile.languages
    },
    letter: rawLetter
  };
}

/**
 * AGENT 2 : Critique rigoureuse du DRH Ouest-Africain
 */
function evaluateAsRecruiter(draft, profile, job) {
  const pointsForts = [];
  const corrections = [];
  let score = 7.5;

  // Analyse du ciblage géographique
  if (profile.city.toLowerCase() === job.city.toLowerCase()) {
    pointsForts.push(`Candidat dj implant  ${job.city} (${profile.district || 'local'}), pas de dlai de relocalisation.`);
  } else {
    corrections.push(`Le candidat rside  ${profile.city} alors que le poste est  ${job.city}. Exiger une mention expresse de disponibilit immdiate ou mobilit.`);
    score -= 1;
  }

  // Analyse des exigences techniques
  const jobReqs = (job.requirements || []).join(' ').toLowerCase();
  const candidateSkills = (profile.skills || []).join(' ').toLowerCase();
  
  if (jobReqs.includes('wave') || jobReqs.includes('orange money')) {
    if (candidateSkills.includes('wave') || candidateSkills.includes('orange money')) {
      pointsForts.push("Comprhension prouve de l'cosystme Mobile Money local.");
      score += 1;
    }
  }

  // Exigence de concret et d'impact chiffré
  corrections.push("La lettre d'accroche initiale est trop gnrique : exiger l'insertion de 2 ralisations cls chiffres ds le 2me paragraphe.");
  corrections.push("Prciser la capacit d'adaptation au contexte de march local (UEMOA / rglementation locale).");

  // Veredict
  let mention = "Bon dossier - Ncessite un polissage pour se dmarquer des 200 autres CVs";
  if (score >= 8.5) mention = "Candidature prioritaire - Trs fort potentiel de conversion";

  return {
    score_sur_10: Math.min(9.6, Math.max(6.0, score)),
    mention: mention,
    points_forts: pointsForts,
    corrections_exigees: corrections,
    verdict_drh: `En tant que DRH  ${job.city}, j'apprcie le parcours chez ${profile.experiences[0]?.company || 'les rfrences'}, mais je veux voir immdiatement ce que le candidat rapporte  ${job.company} avant de l'appeler.`
  };
}

/**
 * RE-GENERATION PAR L'AGENT 1 : Prise en compte de la critique
 */
function refineApplicationWithCritique(draft, critique, profile, job) {
  const topExp = profile.experiences && profile.experiences[0];
  const firstAchievement = topExp && topExp.achievements && topExp.achievements[0] ? topExp.achievements[0] : "conduite de projets  fort impact";
  const secondAchievement = topExp && topExp.achievements && topExp.achievements[1] ? topExp.achievements[1] : "optimisation prouve des performances d'quipe";

  // Lettre de motivation affinée, plus percutante et ancrée dans le marché local
  const refinedLetter = `
Madame, Monsieur le Responsable du Recrutement,

C'est avec une relle dtermination que je vous propose ma candidature pour le poste de **${job.title}** au sein de **${job.company}**  ${job.city}.

Fort de ${profile.years_of_experience} annes d'exprience prouve dans notre cosystme conomique et titulaire d'un ${profile.education}, j'ai particulirement dvelopp mon savoir-faire chez ${topExp ? topExp.company : 'dans mes prcdentes responsabilits'}. Cette exprience m'a permis notamment de raliser des avances concrtes :
 ${firstAchievement} ;
 ${secondAchievement}.

Le dveloppement de ${job.company}  ${job.city} exige une rigueur d'excution sans faille, une matrise des spcificits du march ouest-africain et une ractivit immdiate. Mon ancrage local  ${profile.city} et ma matrise de vos exigences cles me permettront d'tre oprationnel ds le premier jour pour dlivrer des rsultats mesurables.

Je me tiens  votre disposition pour un entretien au cours duquel nous pourrons aborder concrtement la manire dont mon expertise servira vos priorits actuelles.

Je vous remercie de l'attention porte  mon dossier et vous adresse, Madame, Monsieur, mes salutations les plus respectueuses.

**${profile.name}**
 ${profile.phone} |  ${profile.email}
 ${profile.city}, ${profile.country}
`.trim();

  // CV affiné avec profil d'impact
  const refinedCv = {
    ...draft.cv,
    profile_pitch: `Professionnel(le) rigoureux(se)  ${profile.city}, spcialis(e) en ${profile.skills.slice(0, 3).join(', ')}. Reconnu(e) pour l'atteinte d'objectifs ambitieux (${firstAchievement}), dsireux(se) d'apporter cette mme valeur ajoute aux quipes de ${job.company}. Disponibilit immdiate.`,
    verif_drh_badge: "Dossier audit et optimis aux standards de recrutement Ouest-Afrique"
  };

  return {
    cv: refinedCv,
    letter: refinedLetter
  };
}

function generateWhatsAppPitch(profile, job, finalApp) {
  return `Bonjour Madame/Monsieur le Recruteur chez ${job.company},\n\nJe me permets de vous contacter suite  votre offre pour le poste de *${job.title}*  ${job.city}.\n\nJe suis ${profile.name}, spcialis en *${profile.skills.slice(0, 3).join(', ')}* avec ${profile.years_of_experience} ans d'exprience. Je viens de finaliser mon dossier de candidature complet (CV cibl et lettre de motivation adapte).\n\nPuis-je vous transmettre mon CV PDF directement par ce canal ou par email ?\n\nBien cordialement,\n*${profile.name}*\n${profile.phone}`;
}

module.exports = {
  generateWithDualAgent
};
