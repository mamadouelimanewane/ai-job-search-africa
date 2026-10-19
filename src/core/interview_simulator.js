/**
 * SunuJob AI - Simulateur d'Entretien d'Embauche Contextualisé Afrique de l'Ouest (AOF / UEMOA)
 * Module: interview_simulator.js
 *
 * Ce module simule des entretiens d'embauche réalistes face à des profils de recruteurs
 * typiques de la sous-région ouest-africaine (Sénégal, Côte d'Ivoire, Bénin, Togo, Mali),
 * avec évaluation de réponses, progression adaptative, simulation de négociation salariale FCFA
 * et génération de bilans d'entretien complets.
 */

// ============================================================================
// 1. PERSONAS DE RECRUTEURS OUEST-AFRICAINS (8 PROFILS DISTINCTS)
// ============================================================================

const PERSONAS = [
  {
    id: 'drh_banque_abidjan',
    name: 'Koffi Kouamé',
    title: 'Directeur des Ressources Humaines',
    company: 'Banque Atlantique Côte d\'Ivoire (Groupe BCP)',
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    style: 'strict',
    avatar_desc: 'Cadre bancaire expérimenté, costume sobre, regard perçant et exigeant',
    bio: 'Plus de 20 ans d\'expérience dans le secteur bancaire ivoirien et UEMOA. Réputé pour sa rigueur inflexible sur l\'éthique, la déontologie et le respect scrupuleux des procédures prudentielles.',
    focus_areas: [
      'Conformité réglementaire BCEAO',
      'Gestion des risques financiers et rigueur comptable',
      'Éthique bancaire et secret professionnel',
      'Résistance au stress et négociation salariale mesurée'
    ],
    greeting: 'Bonjour. Prenez place. Dans notre institution, chaque détail compte et la confiance ne s\'accorde pas à la légère. Expliquez-moi précisément ce qui justifie votre présence devant moi aujourd\'hui.'
  },
  {
    id: 'manager_tech_dakar',
    name: 'Aminata Diallo',
    title: 'Engineering Lead & VP Tech',
    company: 'Fintech Solutions Dakar (Scale-up Paiements)',
    country: 'Sénégal',
    city: 'Dakar',
    style: 'factuel',
    avatar_desc: 'Tech lead dynamique, t-shirt tech & veste décontractée, axée sur les faits et le code',
    bio: 'Ancienne consultante passée par des scale-ups en Europe et à Dakar. Anime une équipe produit de 35 développeurs centrée sur l\'inclusion financière (Wave, Orange Money, interopérabilité GIM-UEMOA).',
    focus_areas: [
      'Architecture logicielle, API REST & microservices',
      'Culture produit, vélocité Agile et tests automatisés',
      'Intégration Mobile Money et haute disponibilité réseau',
      'Autonomie, curiosité technique et résolution de bugs'
    ],
    greeting: 'Salamalekoum ! Bienvenue. Chez nous, on va droit au but : montrez-moi comment vous résolvez des problèmes concrets et comment vous codez pour un utilisateur à Dakar ou Thiès avec une connexion 3G instable.'
  },
  {
    id: 'dg_pme_cotonou',
    name: 'Bio Sika',
    title: 'Directeur Général & Fondateur',
    company: 'Bénin Distribution & Logistique SARL',
    country: 'Bénin',
    city: 'Cotonou',
    style: 'strict',
    avatar_desc: 'Entrepreneur autodidacte rigoureux, pragmatique, soucieux de chaque centime engagé',
    bio: 'A bâti son entreprise de distribution en 15 ans à partir du port de Cotonou. Pour lui, un employé doit être rentable, polyvalent, dévoué et savoir trouver des solutions sans prétextes.',
    focus_areas: [
      'Polyvalence opérationnelle et sens du terrain',
      'Rentabilité immédiate et maîtrise de la trésorerie',
      'Débrouillardise face aux aléas logistiques portuaires',
      'Fidélité, franchise et disponibilité horaire'
    ],
    greeting: 'Bonjour mon cher. Dans le commerce à Cotonou, le marché ne fait pas de cadeaux. Je ne cherche pas des théoriciens avec de longs diplômes, mais un travailleur pragmatique qui protège mes marges et résout les problèmes sans me créer des maux de tête.'
  },
  {
    id: 'drh_multinationale_abidjan',
    name: 'Marie-Chantal Bamba',
    title: 'Directrice Régionale des Talents Afrique de l\'Ouest',
    company: 'Unilever / Nestlé Afrique de l\'Ouest',
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    style: 'factuel',
    avatar_desc: 'Dirigeante RH élégante, méthodique, rompue aux standards internationaux corporate',
    bio: 'Formée à Abidjan et à Paris, elle pilote les recrutements pour 7 filiales ouest-africaines. Évalue systématiquement les candidats selon la méthode STAR (Situation, Tâche, Action, Résultat).',
    focus_areas: [
      'Méthodologie comportementale STAR et KPI chiffrés',
      'Leadership matriciel et travail en équipe multiculturelle',
      'Gestion du changement et adaptabilité aux processus groupe',
      'Communication corporate claire et maîtrise de l\'anglais pro'
    ],
    greeting: 'Bienvenue. Notre groupe applique des standards d\'excellence mondiaux ancrés dans nos réalités locales. Je vais vous poser des questions précises sur vos réalisations passées. Je vous demanderai d\'être concis et factuel.'
  },
  {
    id: 'recruteur_cabinet_dakar',
    name: 'Babacar Ndiaye',
    title: 'Consultant Senior Recrutement & Chasseur de Têtes',
    company: 'AfricSearch & Talents Conseil Dakar',
    country: 'Sénégal',
    city: 'Dakar',
    style: 'bienveillant',
    avatar_desc: 'Chasseur de têtes souriant, empathique mais très observateur des incohérences de parcours',
    bio: 'Accompagne les dirigeants et cadres supérieurs dans leur mobilité professionnelle à travers l\'UEMOA. Cherche à comprendre la personnalité profonde et la trajectoire des candidats.',
    focus_areas: [
      'Qualité du pitch de présentation et storytelling de carrière',
      'Cohérence du projet professionnel et maturité relationnelle',
      'Aisance à l\'oral et intelligence émotionnelle',
      'Justesse des prétentions salariales et posture d\'écoute'
    ],
    greeting: 'Bonjour et bienvenue dans notre cabinet ! Mettez-vous à l\'aise. Notre échange est une conversation constructive pour comprendre qui vous êtes vraiment et si cette opportunité est le bon tremplin pour votre carrière.'
  },
  {
    id: 'responsable_rh_ong',
    name: 'Fatoumata Traoré',
    title: 'Responsable Régionale RH & Opérations Humanitaires',
    company: 'ONG Action Santé & Solidarité Sahel',
    country: 'Mali / Sénégal',
    city: 'Dakar & Bamako',
    style: 'bienveillant',
    avatar_desc: 'Professionnelle engagée, avenante, attentive aux valeurs et à la résistance psychologique',
    bio: '12 ans sur les terrains humanitaires du Sahel (Mali, Niger, Burkina, Sénégal). Recrute des profils capables de concilier engagement moral, rigueur des bailleurs internationaux et résilience sur le terrain.',
    focus_areas: [
      'Adhésion sincère aux valeurs humanitaires et neutralité',
      'Résilience psychologique et gestion des conditions difficiles',
      'Conformité aux exigences des bailleurs (USAID, ECHO, AFD)',
      'Respect strict des protocoles de sécurité et des communautés'
    ],
    greeting: 'Bonjour. Merci pour votre temps. Travailler dans notre organisation exige à la fois une grande compétence technique et un cœur tourné vers le service des communautés. Voyons ensemble si notre mission résonne avec vos valeurs.'
  },
  {
    id: 'manager_agro_sanpedro',
    name: 'Karamoko Sanogo',
    title: 'Directeur des Opérations Industrielles',
    company: 'Ivoire Cacao & Agro-Industries San-Pedro',
    country: 'Côte d\'Ivoire',
    city: 'San-Pedro',
    style: 'factuel',
    avatar_desc: 'Ingénieur agronome de terrain, bottes de sécurité au vestiaire, direct et sans détour',
    bio: 'Pilote 3 unités de broyage de fèves de cacao et 250 opérateurs à San-Pedro. Attache une importance capitale à la sécurité, aux cadences de production et à la tenue des objectifs d\'exportation.',
    focus_areas: [
      'Rendement industriel, cadences et réduction des pertes',
      'Management direct d\'équipes d\'ouvriers et de techniciens',
      'Normes de sécurité HSE, hygiène et traçabilité export',
      'Gestion de crise industrielle et continuité des machines'
    ],
    greeting: 'Bonjour ! Chez nous à San-Pedro, les machines tournent 24h/24 et les bateaux n\'attendent pas au port. Dites-moi sans détours ce que vous savez faire sur le plan opérationnel pour tenir nos engagements.'
  },
  {
    id: 'daf_banque_panafricaine',
    name: 'Cheikh Oumar Ba',
    title: 'Directeur Financier & des Investissements UEMOA',
    company: 'Banque Ouest-Africaine de Développement (BOAD / Lomé)',
    country: 'Togo / Sénégal',
    city: 'Lomé & Dakar',
    style: 'strict',
    avatar_desc: 'Financier d\'élite, costume trois pièces, précis au centime près, obsédé par les ratios',
    bio: 'Diplômé de haut niveau en finance, expert du marché financier régional de la BRVM. Exige des candidats une maîtrise totale des états financiers, des flux de trésorerie et de la rentabilité du capital.',
    focus_areas: [
      'Analyse financière approfondie et ratios de solvabilité',
      'Maîtrise du SYSCOHADA révisé et des normes IFRS',
      'Gestion de trésorerie multi-devises (XOF, EUR, USD)',
      'Évaluation d\'impact et retour sur investissement (ROI)'
    ],
    greeting: 'Bonjour. En finance panafricaine, les chiffres ne mentent jamais. Chaque mot que vous prononcerez doit être étayé par une logique comptable ou financière solide. Présentez-moi votre raisonnement.'
  }
];

// ============================================================================
// 2. BANQUE DE QUESTIONS (64 QUESTIONS GROUPÉES PAR 8 CATÉGORIES)
// ============================================================================

const QUESTION_BANK = [
  // --------------------------------------------------------------------------
  // CATÉGORIE 1 : PRESENTATION (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_pres_01',
    text: 'Présentez-vous en deux minutes et résumez les étapes clés de votre parcours professionnel.',
    category: 'presentation',
    difficulty: 'debutant',
    tips_reponse: 'Utilisez la méthode Passé-Présent-Futur : résumez votre formation, votre poste le plus formateur avec un résultat chiffré, et terminez sur la raison de votre candidature actuelle.',
    what_recruiter_looks_for: 'Clarté d\'élocution, esprit de synthèse, chronologie logique sans hésitations superflues.'
  },
  {
    id: 'q_pres_02',
    text: 'Parlez-moi de vous au-delà de ce qui figure déjà sur votre CV papier.',
    category: 'presentation',
    difficulty: 'intermediaire',
    tips_reponse: 'Évoquez votre moteur professionnel, votre passion pour votre métier, vos valeurs humaines et une anecdote révélatrice de votre engagement.',
    what_recruiter_looks_for: 'Authenticité, personnalité, adéquation culturelle et recul personnel.'
  },
  {
    id: 'q_pres_03',
    text: 'Quelle est la réalisation professionnelle dont vous êtes le plus fier sur le marché ouest-africain ?',
    category: 'presentation',
    difficulty: 'intermediaire',
    tips_reponse: 'Citez un projet précis : le problème initial, votre action déterminante, et l\'impact mesuré (chiffre d\'affaires en FCFA, temps gagné, utilisateurs servis).',
    what_recruiter_looks_for: 'Sens du résultat concret, fierté professionnelle saine, valorisation du travail d\'équipe.'
  },
  {
    id: 'q_pres_04',
    text: 'Comment votre formation et vos débuts de carrière vous ont-ils préparé aux responsabilités de ce poste ?',
    category: 'presentation',
    difficulty: 'debutant',
    tips_reponse: 'Créez un pont direct entre vos acquis académiques, vos premières missions et les compétences requises par la fiche de poste.',
    what_recruiter_looks_for: 'Cohérence intellectuelle, valorisation du cursus et capacité d\'apprentissage continu.'
  },
  {
    id: 'q_pres_05',
    text: 'Si vous deviez définir votre style professionnel en trois mots clés, quels seraient-ils et pourquoi ?',
    category: 'presentation',
    difficulty: 'intermediaire',
    tips_reponse: 'Choisissez trois mots forts (ex: Rigueur, Proactivité, Esprit d\'équipe) et illustrez chacun par un exemple concret vécu.',
    what_recruiter_looks_for: 'Capacité de synthèse, conscience de ses forces et honnêteté intellectuelle.'
  },
  {
    id: 'q_pres_06',
    text: 'Pouvez-vous nous expliquer la transition entre votre dernier poste et votre démarche actuelle vers notre structure ?',
    category: 'presentation',
    difficulty: 'intermediaire',
    tips_reponse: 'Restez toujours positif envers vos anciens employeurs. Présentez la démarche comme une recherche active d\'impact et de nouveaux défis.',
    what_recruiter_looks_for: 'Absence de ressentiment, loyauté professionnelle et ambition mesurée.'
  },
  {
    id: 'q_pres_07',
    text: 'Quel est le fil conducteur de votre carrière professionnelle à travers vos différents choix de postes ?',
    category: 'presentation',
    difficulty: 'avance',
    tips_reponse: 'Démontrez que vos choix passés répondaient à une logique de montée en compétences et de contribution au développement de projets structurants.',
    what_recruiter_looks_for: 'Vision stratégique de carrière, stabilité émotionnelle et projection à long terme.'
  },
  {
    id: 'q_pres_08',
    text: 'Comment décririez-vous votre valeur ajoutée immédiate dès vos 30 premiers jours chez nous ?',
    category: 'presentation',
    difficulty: 'avance',
    tips_reponse: 'Détaillez un plan d\'immersion : 10 jours d\'écoute et d\'audit, 10 jours d\'identification des gains rapides (quick wins), et 10 jours d\'exécution ciblée.',
    what_recruiter_looks_for: 'Opérationalité, pragmatisme, humilité dans l\'apprentissage et rapidité d\'action.'
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 2 : MOTIVATION (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_mot_01',
    text: 'Pourquoi souhaitez-vous rejoindre notre entreprise plutôt qu\'un concurrent direct à Dakar ou Abidjan ?',
    category: 'motivation',
    difficulty: 'intermediaire',
    tips_reponse: 'Montrez que vous avez étudié l\'actualité de l\'entreprise, ses projets récents et sa réputation sur le marché ouest-africain.',
    what_recruiter_looks_for: 'Degré de préparation, motivation intrinsèque et compréhension du positionnement concurrentiel.'
  },
  {
    id: 'q_mot_02',
    text: 'Quels aspects spécifiques de la fiche de poste correspondent le plus à vos aspirations actuelles ?',
    category: 'motivation',
    difficulty: 'debutant',
    tips_reponse: 'Citez 2 à 3 missions précises de l\'offre et expliquez en quoi elles constituent un défi stimulant où vous excellerez.',
    what_recruiter_looks_for: 'Lecture attentive de l\'offre, lucidité sur le travail quotidien et enthousiasme.'
  },
  {
    id: 'q_mot_03',
    text: 'Où vous projetez-vous professionnellement d\'ici 3 à 5 ans au sein de la région UEMOA ?',
    category: 'motivation',
    difficulty: 'intermediaire',
    tips_reponse: 'Évoquez une progression en compétences, un élargissement de périmètre ou l\'encadrement d\'équipes, tout en restant ancré dans l\'entreprise.',
    what_recruiter_looks_for: 'Stabilité, volonté d\'évoluer sans impatience prématurée, fidélité prévisionnelle.'
  },
  {
    id: 'q_mot_04',
    text: 'Qu\'est-ce qui vous motive fondamentalement à vous lever le matin et à donner le meilleur de vous-même au bureau ?',
    category: 'motivation',
    difficulty: 'debutant',
    tips_reponse: 'Liez votre motivation à la résolution de défis collectifs, à la satisfaction des usagers/clients et à la fierté du travail bien fait.',
    what_recruiter_looks_for: 'Résilience au quotidien, énergie positive et sens du service.'
  },
  {
    id: 'q_mot_05',
    text: 'Pourquoi souhaitez-vous quitter votre entreprise actuelle ou envisager ce changement dès maintenant ?',
    category: 'motivation',
    difficulty: 'intermediaire',
    tips_reponse: 'Mettez l\'accent sur la quête d\'un nouveau cap, la volonté d\'élargir vos horizons ou d\'intégrer une structure aux ambitions régionales fortes.',
    what_recruiter_looks_for: 'Maturité relationnelle, respect de la confidentialité et motivation proactive.'
  },
  {
    id: 'q_mot_06',
    text: 'Quelle est votre perception de nos produits ou services sur le marché local et quel regard critique constructif portez-vous ?',
    category: 'motivation',
    difficulty: 'avance',
    tips_reponse: 'Valorisez un point fort indiscutable, puis proposez avec tact une piste d\'amélioration réaliste pour le consommateur sénégalais ou ivoirien.',
    what_recruiter_looks_for: 'Sens critique constructif, connaissance fine du marché local et audace mesurée.'
  },
  {
    id: 'q_mot_07',
    text: 'Si vous aviez sur la table deux offres équivalentes à Dakar et Abidjan, quel critère déterminant ferait pencher votre choix ?',
    category: 'motivation',
    difficulty: 'intermediaire',
    tips_reponse: 'Privilégiez la qualité de la vision d\'entreprise, la culture managériale et l\'impact réel sur l\'écosystème local.',
    what_recruiter_looks_for: 'Hiérarchie des priorités, lucidité professionnelle et attachement aux valeurs.'
  },
  {
    id: 'q_mot_08',
    text: 'Comment ce poste s\'inscrit-il dans votre contribution au développement économique de notre pays ou sous-région ?',
    category: 'motivation',
    difficulty: 'avance',
    tips_reponse: 'Reliez votre mission à un enjeu économique tangible : bancarisation, création d\'emplois locaux, digitalisation ou sécurité alimentaire.',
    what_recruiter_looks_for: 'Sens civique, fierté africaine, vision sociétale et engagement personnel.'
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 3 : COMPETENCES_TECHNIQUES (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_tech_01',
    text: 'Quels outils métiers, méthodologies ou logiciels maîtrisez-vous parfaitement pour garantir une productivité immédiate ?',
    category: 'competences_techniques',
    difficulty: 'debutant',
    tips_reponse: 'Détaillez votre pile d\'outils (ex: ERP Sage/Odoo, Git/Node.js, Excel avancé, Power BI) et mentionnez votre niveau d\'autonomie sur chacun.',
    what_recruiter_looks_for: 'Exactitude des termes techniques, niveau réel de maîtrise et polyvalence.'
  },
  {
    id: 'q_tech_02',
    text: 'Comment garantissez-vous la conformité de vos travaux avec les normes régionales en vigueur (SYSCOHADA, BCEAO, CDP/ARTCI) ?',
    category: 'competences_techniques',
    difficulty: 'avance',
    tips_reponse: 'Expliquez votre méthode de veille juridique/fiscale et donnez un exemple concret d\'application rigoureuse des normes locales.',
    what_recruiter_looks_for: 'Connaissance des référentiels régionaux, rigueur documentaire et prévention des risques légaux.'
  },
  {
    id: 'q_tech_03',
    text: 'Décrivez un défi technique complexe que vous avez résolu de bout en bout malgré des contraintes lourdes.',
    category: 'competences_techniques',
    difficulty: 'intermediaire',
    tips_reponse: 'Structurez selon la méthode STAR : diagnostic du problème, arbitrage des solutions, déploiement et métrique finale de réussite.',
    what_recruiter_looks_for: 'Raisonnement analytique, ingéniosité sous contrainte et persévérance.'
  },
  {
    id: 'q_tech_04',
    text: 'Comment mesurez-vous concrètement la performance, la fiabilité ou le retour sur investissement (ROI) de vos livrables ?',
    category: 'competences_techniques',
    difficulty: 'intermediaire',
    tips_reponse: 'Citez des KPI quantifiables : taux de conversion, temps de traitement réduit de X%, budget respecté à l\'euro ou FCFA près.',
    what_recruiter_looks_for: 'Culture du chiffre, orientation résultats et accountability.'
  },
  {
    id: 'q_tech_05',
    text: 'Face à un incident majeur de production ou une panne critique, quel est votre protocole standard d\'intervention d\'urgence ?',
    category: 'competences_techniques',
    difficulty: 'avance',
    tips_reponse: 'Détaillez : 1) Isolement et sécurisation, 2) Communication transparente aux parties prenantes, 3) Résolution technique, 4) Post-mortem pour éviter la récidive.',
    what_recruiter_looks_for: 'Sang-froid en situation critique, méthode rigoureuse et communication de crise.'
  },
  {
    id: 'q_tech_06',
    text: 'Comment documentez-vous vos réalisations pour permettre une passation de relais fluide et éviter la dépendance envers vous ?',
    category: 'competences_techniques',
    difficulty: 'intermediaire',
    tips_reponse: 'Mentionnez la rédaction de manuels de procédures, wikis internes, schémas d\'architecture et sessions de partage de connaissances.',
    what_recruiter_looks_for: 'Générosité professionnelle, esprit d\'équipe et pérennisation des acquis de l\'entreprise.'
  },
  {
    id: 'q_tech_07',
    text: 'Comment maintenez-vous vos compétences à jour dans un secteur en évolution ultra-rapide sur le continent africain ?',
    category: 'competences_techniques',
    difficulty: 'debutant',
    tips_reponse: 'Citez vos sources de veille : cours en ligne (Coursera, Udemy), webinaires spécialisés, communautés locales (Dakar Ruby/JS, Abidjan Java, etc.).',
    what_recruiter_looks_for: 'Curiosité intellectuelle, auto-discipline et volonté d\'excellence.'
  },
  {
    id: 'q_tech_08',
    text: 'Pouvez-vous m\'expliquer un concept technique très pointu de votre métier comme si j\'étais un client profane ?',
    category: 'competences_techniques',
    difficulty: 'avance',
    tips_reponse: 'Utilisez une métaphore de la vie courante africaine (ex: circulation à Dakar, marché Sandaga, système d\'eau ou tontine) pour vulgariser le concept.',
    what_recruiter_looks_for: 'Pédagogie, maîtrise profonde du sujet (sans jargon inutile) et empathie relationnelle.'
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 4 : COMPETENCES_COMPORTEMENTALES (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_comp_01',
    text: 'Comment gérez-vous le stress et la pression lors des périodes d\'échéances serrées ou de clôture mensuelle ?',
    category: 'competences_comportementales',
    difficulty: 'debutant',
    tips_reponse: 'Expliquez comment vous priorisez vos tâches (matrice Eisenhower), gardez une communication claire et maintenez un équilibre mental stable.',
    what_recruiter_looks_for: 'Maîtrise de soi, résistance à la fatigue et maintien de la courtoisie.'
  },
  {
    id: 'q_comp_02',
    text: 'Racontez une situation où vous avez dû convaincre un collègue ou un supérieur réfractaire à votre recommandation.',
    category: 'competences_comportementales',
    difficulty: 'intermediaire',
    tips_reponse: 'Montrez comment vous vous êtes appuyé sur des données objectives chiffrées, l\'écoute active de ses objections et la recherche d\'un compromis gagnant.',
    what_recruiter_looks_for: 'Diplomatie, sens de l\'influence sans agressivité et respect des personnes.'
  },
  {
    id: 'q_comp_03',
    text: 'Comment favorisez-vous la cohésion et l\'entraide au sein d\'une équipe aux profils culturels et générationnels divers ?',
    category: 'competences_comportementales',
    difficulty: 'intermediaire',
    tips_reponse: 'Évoquez la Teranga sénégalaise ou la convivialité ivoirienne, le respect scrupuleux des anciens combiné à l\'écoute bienveillante des plus jeunes.',
    what_recruiter_looks_for: 'Intelligence relationnelle, inclusion, respect des sensibilités locales.'
  },
  {
    id: 'q_comp_04',
    text: 'Donnez-moi un exemple concret d\'échec ou d\'erreur commise dans votre parcours, et la leçon que vous en avez tirée.',
    category: 'competences_comportementales',
    difficulty: 'avance',
    tips_reponse: 'Assumez pleinement l\'erreur sans blâmer les autres. Montrez la mesure corrective immédiate et comment cet événement a renforcé votre rigueur.',
    what_recruiter_looks_for: 'Maturité, courage d\'assumer la responsabilité et capacité de progression.'
  },
  {
    id: 'q_comp_05',
    text: 'Comment réagissez-vous face à une remarque critique formulée de façon directe et ferme par votre hiérarchie ?',
    category: 'competences_comportementales',
    difficulty: 'debutant',
    tips_reponse: 'Dites que vous écoutez sans vous braquer, que vous reformulez pour bien comprendre le point d\'amélioration et proposez un plan d\'ajustement rapide.',
    what_recruiter_looks_for: 'Modestie, capacité d\'encaissement constructive et orientation solution.'
  },
  {
    id: 'q_comp_06',
    text: 'Quel rôle prenez-vous spontanément au sein d\'une équipe : pilote, organisateur rigoureux, médiateur ou expert technique ?',
    category: 'competences_comportementales',
    difficulty: 'intermediaire',
    tips_reponse: 'Définissez votre posture principale tout en montrant votre adaptabilité selon les besoins urgents du groupe.',
    what_recruiter_looks_for: 'Conscience de soi, flexibilité de rôle et esprit d\'équipe.'
  },
  {
    id: 'q_comp_07',
    text: 'Comment conciliez-vous le respect scrupuleux de la hiérarchie et la prise d\'initiative autonome dans vos actions ?',
    category: 'competences_comportementales',
    difficulty: 'avance',
    tips_reponse: 'Expliquez que vous prenez l\'initiative dans le cadre délégué, en informant toujours la hiérarchie en amont ou en aval selon le niveau de criticité.',
    what_recruiter_looks_for: 'Équilibre entre autonomie responsable et respect des codes managériaux africains.'
  },
  {
    id: 'q_comp_08',
    text: 'Lorsque deux directions vous soumettent des demandes urgentes contradictoires, comment tranchez-vous ?',
    category: 'competences_comportementales',
    difficulty: 'avance',
    tips_reponse: 'Présentez la méthode : analyser l\'impact métier sur les clients et le chiffre d\'affaires, puis réunir les demandeurs pour arbitrer en toute transparence.',
    what_recruiter_looks_for: 'Sens politique sain, capacité de négociation et courage managérial.'
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 5 : MISE_EN_SITUATION (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_sit_01',
    text: 'Vous découvrez un écart de trésorerie ou de stock de 5 000 000 FCFA à la veille d\'un audit externe. Que faites-vous dans l\'heure ?',
    category: 'mise_en_situation',
    difficulty: 'avance',
    tips_reponse: '1) Recompter et vérifier les pièces justificatives, 2) Informer immédiatement et confidentiellement votre supérieur direct, 3) Ne rien masquer, documenter les faits.',
    what_recruiter_looks_for: 'Intégrité absolue, absence de panique et réflexe d\'alerte hiérarchique.'
  },
  {
    id: 'q_sit_02',
    text: 'Un client grand compte à Abidjan menace de résilier son contrat suite à un retard de livraison critique. Comment désamorcez-vous l\'orage ?',
    category: 'mise_en_situation',
    difficulty: 'intermediaire',
    tips_reponse: 'Se déplacer physiquement si possible, écouter sa colère sans interrompre, présenter des excuses au nom de l\'entreprise et proposer un plan d\'action d\'urgence sous 24h avec gestes commerciaux.',
    what_recruiter_looks_for: 'Sens relationnel client aigu, courage face aux conflits et préservation du portefeuille.'
  },
  {
    id: 'q_sit_03',
    text: 'Votre fournisseur principal à Dakar subit une coupure d\'électricité prolongée ou une grève. Quel plan B activez-vous ?',
    category: 'mise_en_situation',
    difficulty: 'intermediaire',
    tips_reponse: 'Activer le fournisseur alternatif préalablement qualifié, réajuster les plannings avec les équipes et communiquer proactivement vers les clients.',
    what_recruiter_looks_for: 'Anticipation des risques opérationnels typiques d\'Afrique de l\'Ouest et réactivité.'
  },
  {
    id: 'q_sit_04',
    text: 'Deux de vos collaborateurs directs sont en conflit ouvert, paralysant l\'avancée d\'un projet urgent. Comment intervenez-vous ?',
    category: 'mise_en_situation',
    difficulty: 'avance',
    tips_reponse: 'Recevoir chacun individuellement dans la journée, comprendre la racine du désaccord, puis les réunir autour d\'une règle commune axée exclusivement sur le livrable collectif.',
    what_recruiter_looks_for: 'Autorité bienveillante, impartialité et capacité de médiation.'
  },
  {
    id: 'q_sit_05',
    text: 'La direction vous demande de réduire les coûts opérationnels de 15% sans dégrader la qualité du service client. Quelle méthode suivez-vous ?',
    category: 'mise_en_situation',
    difficulty: 'avance',
    tips_reponse: 'Cartographier les dépenses, renégocier les contrats fournisseurs récurrents, éliminer les gaspillages de process (digitalisation de la paperasse) avant de toucher aux équipes.',
    what_recruiter_looks_for: 'Rigueur gestionnaire, créativité dans l\'optimisation et protection du capital humain.'
  },
  {
    id: 'q_sit_06',
    text: 'Un intermédiaire ou un partenaire public vous suggère un arrangement financier officieux pour débloquer un dossier urgent. Quelle est votre réaction ?',
    category: 'mise_en_situation',
    difficulty: 'avance',
    tips_reponse: 'Refuser poliment mais fermement en rappelant la politique de tolérance zéro de l\'entreprise contre la corruption, et référer le dossier au service juridique/conformité.',
    what_recruiter_looks_for: 'Éthique incorruptible, fermeté morale et protection juridique de l\'entreprise.'
  },
  {
    id: 'q_sit_07',
    text: 'Vous devez déployer un service dans 3 pays de l\'UEMOA simultanément avec des contraintes de calendrier strictes et une équipe restreinte. Quelle stratégie adoptez-vous ?',
    category: 'mise_en_situation',
    difficulty: 'avance',
    tips_reponse: 'Standardiser le socle commun à 80%, adapter les 20% aux spécificités réglementaires locales (Sénégal, CI, Bénin), et désigner des relais locaux autonomes.',
    what_recruiter_looks_for: 'Vision régionale ouest-africaine, délégation efficace et sens de l\'exécution.'
  },
  {
    id: 'q_sit_08',
    text: 'Un vendredi soir à 18h, un bug bloque les réconciliations de paiements Wave et Orange Money de vos utilisateurs. Que faites-vous ?',
    category: 'mise_en_situation',
    difficulty: 'intermediaire',
    tips_reponse: 'Prendre l\'incident en charge sans hésitation, alerter l\'équipe d\'astreinte et le management, publier un message d\'information rassurant pour les clients et ne quitter qu\'une fois le contournement sécurisé.',
    what_recruiter_looks_for: 'Sens du devoir, engagement sans faille et culture du service continu.'
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 6 : CULTURE_ENTREPRISE (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_cul_01',
    text: 'Dans quel type d\'environnement managérial vous épanouissez-vous le plus pour donner le meilleur de votre potentiel ?',
    category: 'culture_entreprise',
    difficulty: 'debutant',
    tips_reponse: 'Exprimez votre goût pour un management transparent, responsabilisant, exigeant sur les résultats mais humain dans les relations.',
    what_recruiter_looks_for: 'Connaissance de soi, maturité professionnelle et adéquation avec l\'ADN de la société.'
  },
  {
    id: 'q_cul_02',
    text: 'Quelle importance accordez-vous à la ponctualité et à l\'assiduité dans une entreprise moderne en Afrique de l\'Ouest ?',
    category: 'culture_entreprise',
    difficulty: 'debutant',
    tips_reponse: 'Affirmez sans détour que la ponctualité est la première marque de respect professionnel envers ses collègues et partenaires, et que les embouteillages s\'anticipent.',
    what_recruiter_looks_for: 'Discipline personnelle, respect des engagements et fiabilité horaire.'
  },
  {
    id: 'q_cul_03',
    text: 'Comment adaptez-vous votre communication entre un membre du comité de direction et un agent opérationnel de terrain ?',
    category: 'culture_entreprise',
    difficulty: 'intermediaire',
    tips_reponse: 'Synthétique et orienté vision/décision pour la direction ; concret, direct et respectueux des réalités concrètes du quotidien pour le terrain.',
    what_recruiter_looks_for: 'Caméléon relationnel, respect égal de tous les échelons et intelligence sociale.'
  },
  {
    id: 'q_cul_04',
    text: 'Que représente pour vous la loyauté et la discrétion professionnelle dans un secteur concurrentiel ?',
    category: 'culture_entreprise',
    difficulty: 'intermediaire',
    tips_reponse: 'La confidentialité des données clients et des stratégies internes est sacrée, même après avoir quitté une entreprise.',
    what_recruiter_looks_for: 'Sens de l\'honneur, fiabilité et sécurité de l\'information.'
  },
  {
    id: 'q_cul_05',
    text: 'Comment conciliez-vous les impératifs familiaux et sociaux locaux (événements, cérémonies) avec vos obligations professionnelles critiques ?',
    category: 'culture_entreprise',
    difficulty: 'intermediaire',
    tips_reponse: 'Expliquer que vous organisez votre emploi du temps avec rigueur, anticipez les congés selon les règles de l\'entreprise et veillez toujours à ce qu\'un relais assure la continuité de service.',
    what_recruiter_looks_for: 'Maturité socioculturelle, professionnalisme sans compromis sur les urgences.'
  },
  {
    id: 'q_cul_06',
    text: 'Quelle est votre vision du management bienveillant mais ferme dans le contexte professionnel ouest-africain ?',
    category: 'culture_entreprise',
    difficulty: 'avance',
    tips_reponse: 'Encourager et valoriser les réussites avec chaleur, tout en fixant des règles claires non négociables et en sanctionnant avec justice les manquements répétés.',
    what_recruiter_looks_for: 'Équilibre managérial, justice d\'appréciation et autorité naturelle.'
  },
  {
    id: 'q_cul_07',
    text: 'Quelle place accordez-vous à la responsabilité sociétale (RSE) et à l\'impact positif sur la jeunesse locale dans votre travail ?',
    category: 'culture_entreprise',
    difficulty: 'intermediaire',
    tips_reponse: 'Montrez votre intérêt pour le mentorat des stagiaires locaux, l\'achat responsable auprès de fournisseurs locaux et la protection de l\'environnement.',
    what_recruiter_looks_for: 'Citoyenneté d\'entreprise, ancrage local et conscience éthique.'
  },
  {
    id: 'q_cul_08',
    text: 'Comment contribuez-vous personnellement à instaurer une ambiance de travail saine, solidaire et sans commérages ?',
    category: 'culture_entreprise',
    difficulty: 'debutant',
    tips_reponse: 'Favoriser la franchise en face-à-face, refuser de colporter des rumeurs de couloir et célébrer publiquement les victoires collectives.',
    what_recruiter_looks_for: 'Esprit positif, hygiène relationnelle et respect d\'autrui.'
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 7 : NEGOCIATION_SALARIALE (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_neg_01',
    text: 'Quelles sont vos prétentions salariales nettes mensuelles en FCFA pour assumer l\'ensemble de ces responsabilités ?',
    category: 'negociation_salariale',
    difficulty: 'intermediaire',
    tips_reponse: 'Donnez une fourchette réaliste cohérente avec la grille du secteur (ex: entre 750 000 et 900 000 FCFA net), en précisant que vous êtes ouvert à négocier selon le package global.',
    what_recruiter_looks_for: 'Connaissance des tarifs du marché UEMOA, assurance sans arrogance et flexibilité intelligente.'
  },
  {
    id: 'q_neg_02',
    text: 'Si notre proposition budgétaire maximale se situe à 15% en dessous de votre prétention souhaitée, quelle est votre position ?',
    category: 'negociation_salariale',
    difficulty: 'avance',
    tips_reponse: 'Ne dites ni un oui précipité ni un non brutal. Proposez de compenser cet écart par des avantages (prime sur objectifs, 13e mois, IPM à 100%, plan de formation ou révision à 6 mois).',
    what_recruiter_looks_for: 'Compétence de négociation, recherche de solutions créatives et sens du compromis.'
  },
  {
    id: 'q_neg_03',
    text: 'Quel est votre salaire actuel et quel pourcentage d\'augmentation justifie votre changement d\'entreprise ?',
    category: 'negociation_salariale',
    difficulty: 'intermediaire',
    tips_reponse: 'Évoquez votre rémunération globale actuelle (fixe + primes) et indiquez qu\'une valorisation de 15 à 25% correspond à l\'élargissement de vos responsabilités.',
    what_recruiter_looks_for: 'Transparence, réalisme économique et valorisation de ses acquis.'
  },
  {
    id: 'q_neg_04',
    text: 'Quels éléments du package global valorisez-vous en dehors du salaire fixe net en FCFA ?',
    category: 'negociation_salariale',
    difficulty: 'debutant',
    tips_reponse: 'Citez l\'assurance santé IPM/mutuelle pour la famille, le 13e mois, l\'indemnité de transport, les bonus de performance et la formation certifiante.',
    what_recruiter_looks_for: 'Vision globale de la rémunération et maturité financière.'
  },
  {
    id: 'q_neg_05',
    text: 'Comment justifiez-vous rationnellement le montant salarial que vous exigez aujourd\'hui ?',
    category: 'negociation_salariale',
    difficulty: 'avance',
    tips_reponse: 'Justifiez par le retour sur investissement que vous allez apporter à l\'entreprise : gains de productivité, sécurisation des opérations et chiffre d\'affaires généré.',
    what_recruiter_looks_for: 'Argumentation axée valeur, confiance en ses capacités et solidité des arguments.'
  },
  {
    id: 'q_neg_06',
    text: 'Seriez-vous disposé à accepter une part variable significative indexée sur l\'atteinte d\'objectifs trimestriels précis ?',
    category: 'negociation_salariale',
    difficulty: 'intermediaire',
    tips_reponse: 'Exprimez votre enthousiasme pour une part variable motivante, à condition que les objectifs fixés soient réalistes, mesurables et dotés des moyens d\'exécution nécessaires.',
    what_recruiter_looks_for: 'Gout du challenge, confiance en sa performance et lucidité contractuelle.'
  },
  {
    id: 'q_neg_07',
    text: 'Quelle est la rémunération plancher en-deçà de laquelle vous refuserez poliment ce contrat ?',
    category: 'negociation_salariale',
    difficulty: 'avance',
    tips_reponse: 'Fixez une limite claire avec courtoisie en expliquant que vos charges et votre valeur sur le marché nécessitent un niveau de sécurité financière minimal pour travailler sereinement.',
    what_recruiter_looks_for: 'Conscience de sa propre valeur, fermeté polie et clarté des limites.'
  },
  {
    id: 'q_neg_08',
    text: 'Si nous nous mettons d\'accord aujourd\'hui sur ces conditions, quel délai de préavis devez-vous respecter avant d\'être opérationnel ?',
    category: 'negociation_salariale',
    difficulty: 'debutant',
    tips_reponse: 'Rappelez le cadre légal du Code du travail local (généralement 1 à 3 mois selon le statut cadre), tout en indiquant votre volonté de négocier un départ anticipé à l\'amiable si besoin.',
    what_recruiter_looks_for: 'Respect des règles légales, loyauté envers l\'employeur quitté et clarté sur la disponibilité.'
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 8 : QUESTIONS_PIEGES (8 questions)
  // --------------------------------------------------------------------------
  {
    id: 'q_pieg_01',
    text: 'Quel est votre principal défaut professionnel et comment se manifeste-t-il sur le terrain ?',
    category: 'questions_pieges',
    difficulty: 'intermediaire',
    tips_reponse: 'Citez un vrai trait de travail (ex: impatience face à la lenteur, exigence perfectionniste ou difficulté initiale à déléguer) et montrez la méthode concrète que vous appliquez pour le corriger.',
    what_recruiter_looks_for: 'Authenticité (évitez les faux défauts du type "trop travailleur"), auto-dérision saine et maîtrise de soi.'
  },
  {
    id: 'q_pieg_02',
    text: 'Avez-vous déjà songé à lancer votre propre entreprise ou à vous mettre à votre compte prochainement ?',
    category: 'questions_pieges',
    difficulty: 'intermediaire',
    tips_reponse: 'Expliquez que votre énergie est pleinement dédiée à réussir dans une structure établie où les moyens et l\'échelle d\'impact correspondent à vos ambitions actuelles.',
    what_recruiter_looks_for: 'Stabilité, risque de départ précoce ou de concurrence déloyale.'
  },
  {
    id: 'q_pieg_03',
    text: 'N\'avez-vous pas l\'impression d\'être surqualifié pour les exigences de ce poste ? N\'allez-vous pas vite vous ennuyer ?',
    category: 'questions_pieges',
    difficulty: 'avance',
    tips_reponse: 'Expliquez que votre expérience vous permettra d\'être immédiatement productif et autonome, et que chaque entreprise comporte des défis uniques qui stimuleront votre créativité.',
    what_recruiter_looks_for: 'Humilité, investissement réel et garantie qu\'il ne s\'agit pas d\'un poste bouche-trou.'
  },
  {
    id: 'q_pieg_04',
    text: 'Pourquoi êtes-vous resté si peu de temps dans votre dernière expérience professionnelle ?',
    category: 'questions_pieges',
    difficulty: 'intermediaire',
    tips_reponse: 'Expliquez factuellement la fin de mission, la réorganisation de l\'entreprise ou l\'inadéquation de la mission initiale sans dénigrer l\'organisation.',
    what_recruiter_looks_for: 'Stabilité émotionnelle, honnêteté et capacité à rebondir avec dignité.'
  },
  {
    id: 'q_pieg_05',
    text: 'Que me dirait votre ancien employeur si je l\'appelais personnellement cet après-midi pour prendre des références ?',
    category: 'questions_pieges',
    difficulty: 'intermediaire',
    tips_reponse: 'Répondez avec assurance qu\'il saluera votre dévouement, votre rigueur et un accomplissement majeur, tout en mentionnant avec transparence un point de vigilance déjà connu.',
    what_recruiter_looks_for: 'Assurance, cohérence relationnelle et absence de cadavre dans le placard.'
  },
  {
    id: 'q_pieg_06',
    text: 'Si nous ne vous retenons pas à l\'issue de cette session d\'entretiens, quelle suite donnerez-vous à votre recherche ?',
    category: 'questions_pieges',
    difficulty: 'debutant',
    tips_reponse: 'Dites que vous continuerez avec détermination votre recherche, demanderez courtoisement un retour pour progresser, tout en gardant une excellente image de la société.',
    what_recruiter_looks_for: 'Fair-play, persévérance et résistance à la frustration.'
  },
  {
    id: 'q_pieg_07',
    text: 'Avez-vous d\'autres pistes avancées ou entretiens en cours avec nos concurrents directs sur la place ?',
    category: 'questions_pieges',
    difficulty: 'intermediaire',
    tips_reponse: 'Soyez honnête et mesuré : confirmez être actif sur le marché avec des contacts de qualité, tout en précisant que cette opportunité reste votre premier choix.',
    what_recruiter_looks_for: 'Valeur marchande, dynamisme de recherche et désirabilité.'
  },
  {
    id: 'q_pieg_08',
    text: 'Que feriez-vous si votre directeur général vous imposait une décision que vous savez techniquement erronée ou risquée ?',
    category: 'questions_pieges',
    difficulty: 'avance',
    tips_reponse: 'Demander un entretien en tête-à-tête, exposer calmement les risques avec données chiffrées à l\'appui et proposer une alternative constructive. Si la direction persiste, appliquer avec loyauté tant que la légalité n\'est pas violée.',
    what_recruiter_looks_for: 'Courage managérial, sens du devoir d\'alerte et respect final de la chaîne de commandement.'
  }
];

// In-memory store pour les sessions actives (clé: sessionId, valeur: session)
const activeSessions = new Map();

// ============================================================================
// 3. FONCTIONS PRINCIPALES DU SIMULATEUR D'ENTRETIEN
// ============================================================================

/**
 * Retourne la liste complète des personas de recruteurs disponibles
 * @returns {Array} Liste des personas
 */
function getPersonas() {
  return PERSONAS;
}

/**
 * Retourne les questions filtrées par catégorie
 * @param {string} [category] Catégorie souhaitée (optionnel)
 * @returns {Array} Liste des questions correspondantes
 */
function getQuestionsByCategory(category) {
  if (!category) return QUESTION_BANK;
  const cleanCat = String(category).trim().toLowerCase();
  return QUESTION_BANK.filter(q => q.category.toLowerCase() === cleanCat);
}

/**
 * Démarre une nouvelle session d'entretien d'embauche
 * @param {string} personaId Identifiant du persona recruteur
 * @param {Object} profile Profil du candidat (nom, titre, compétences, années d'exp)
 * @param {string} jobTitle Intitulé du poste convoité
 * @returns {Object} Objet session contenant les 5 premières questions sélectionnées
 */
function startSession(personaId, profile, jobTitle) {
  const persona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
  const candidateProfile = profile || {
    name: 'Candidat UEMOA',
    title: jobTitle || 'Cadre Opérationnel',
    years_of_experience: 3,
    skills: ['Gestion de projet', 'Communication', 'Bureautique']
  };

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Sélection intelligente des 5 premières questions adaptées au persona et au poste
  // Structure idéale : 1 Présentation, 1 Motivation, 1 Technique, 1 Comportementale/Situation, 1 Négociation/Culture
  const qPres = getQuestionsByCategory('presentation')[0]; // Présentation 2 min
  const qMot = getQuestionsByCategory('motivation')[0];    // Pourquoi cette boîte

  // Question technique selon les focus areas du persona
  const techQuestions = getQuestionsByCategory('competences_techniques');
  let qTech = techQuestions[0];
  if (persona.style === 'strict') {
    qTech = techQuestions.find(q => q.difficulty === 'avance') || techQuestions[1];
  } else if (persona.id === 'manager_tech_dakar') {
    qTech = techQuestions.find(q => q.id === 'q_tech_05') || techQuestions[2]; // incident / panne
  }

  // Question de mise en situation ou comportementale
  const sitQuestions = getQuestionsByCategory('mise_en_situation');
  let qSit = sitQuestions[0];
  if (persona.id === 'drh_banque_abidjan' || persona.id === 'daf_banque_panafricaine') {
    qSit = sitQuestions.find(q => q.id === 'q_sit_01') || sitQuestions[0]; // écart de 5M FCFA
  } else if (persona.id === 'dg_pme_cotonou') {
    qSit = sitQuestions.find(q => q.id === 'q_sit_03') || sitQuestions[1]; // coupure / plan B
  } else {
    qSit = sitQuestions.find(q => q.id === 'q_sit_02') || sitQuestions[2]; // client mécontent
  }

  // Cinquième question : négociation ou question piège
  const piegQuestions = getQuestionsByCategory('questions_pieges');
  const qPieg = piegQuestions[0]; // principal défaut

  const initialQuestions = [qPres, qMot, qTech, qSit, qPieg];

  const sessionData = {
    sessionId,
    started_at: new Date().toISOString(),
    persona: {
      id: persona.id,
      name: persona.name,
      title: persona.title,
      company: persona.company,
      country: persona.country,
      style: persona.style,
      greeting: persona.greeting,
      focus_areas: persona.focus_areas
    },
    candidate: {
      name: candidateProfile.name || 'Candidat',
      title: candidateProfile.title || jobTitle,
      experience: candidateProfile.years_of_experience || 'Non spécifié'
    },
    jobTitle: jobTitle || 'Poste à pourvoir',
    current_question_index: 0,
    questions: initialQuestions,
    answers_history: [],
    asked_question_ids: initialQuestions.map(q => q.id)
  };

  activeSessions.set(sessionId, sessionData);

  return {
    sessionId,
    persona: sessionData.persona,
    jobTitle: sessionData.jobTitle,
    greeting: persona.greeting,
    total_initial_questions: initialQuestions.length,
    first_question: initialQuestions[0],
    questions: initialQuestions
  };
}

/**
 * Évalue une réponse donnée par le candidat à une question d'entretien
 * @param {Object|string} question Question posée ou libellé de la question
 * @param {string} answer Réponse fournie par le candidat
 * @returns {Object} Évaluation détaillée (score 0-100, pertinence, points forts, faiblesses, conseils)
 */
function evaluateAnswer(question, answer) {
  const questionObj = typeof question === 'object' && question !== null
    ? question
    : (QUESTION_BANK.find(q => q.text === question || q.id === question) || {
        text: String(question),
        category: 'general',
        what_recruiter_looks_for: 'Pertinence, clarté et précision des arguments'
      });

  const rawAnswer = String(answer || '').trim();
  const wordCount = rawAnswer.split(/\s+/).filter(Boolean).length;

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  let score = 50; // Note de base

  // 1. Analyse de la longueur et de la profondeur de la réponse
  if (wordCount < 15) {
    score -= 30;
    weaknesses.push('Réponse trop brève et laconique, manque cruel de matière et d\'arguments développés.');
    suggestions.push('Développez davantage en utilisant la méthode STAR (Situation, Tâche, Action concrète, Résultat mesuré).');
  } else if (wordCount < 35) {
    score -= 10;
    weaknesses.push('Réponse un peu courte, mériterait d\'être illustrée par un exemple précis vécu.');
    suggestions.push('Ajoutez un cas réel issu de vos expériences passées à Dakar, Abidjan ou dans la sous-région.');
  } else if (wordCount >= 40 && wordCount <= 200) {
    score += 15;
    strengths.push('Longueur de réponse bien équilibrée, permettant d\'exposer le raisonnement sans lasser.');
  } else if (wordCount > 300) {
    score -= 10;
    weaknesses.push('Réponse trop verbeuse qui risque de diluer le message essentiel face à un recruteur pressé.');
    suggestions.push('Allez plus vite au fait et structurez votre propos en 3 points clés clairs.');
  }

  // 2. Détection de vocabulaire professionnel et d'indicateurs de méthode STAR
  const lower = rawAnswer.toLowerCase();

  const starKeywords = [
    'situation', 'contexte', 'mission', 'responsabilité', 'action', 'déployé',
    'mis en place', 'résultat', 'impact', 'chiffre', 'optimisé', 'succès', 'résolu'
  ];
  const foundStar = starKeywords.filter(k => lower.includes(k));
  if (foundStar.length >= 2) {
    score += 15;
    strengths.push('Bonne structuration méthodologique orientée vers l\'action et les résultats obtenus.');
  } else {
    suggestions.push('Utilisez des verbes d\'action à la première personne : "J\'ai piloté", "J\'ai structuré", "J\'ai négocié".');
  }

  // 3. Détection d'éléments chiffrés ou métriques
  const hasNumbers = /\b\d+(\s?[\%kKmM]|(\s?fcfa|\s?f\s?cfa|\s?frs))?\b/.test(rawAnswer);
  if (hasNumbers) {
    score += 15;
    strengths.push('Présence d\'éléments chiffrés ou métriques tangibles, ce qui rassure immédiatement le recruteur.');
  } else {
    suggestions.push('Quantifiez votre impact : pourcentages d\'objectifs, montants en FCFA, délais respectés ou taille d\'équipe gérée.');
  }

  // 4. Contexte ouest-africain / UEMOA / soft skills
  const contextKeywords = [
    'uemoa', 'fcfa', 'dakar', 'abidjan', 'sénégal', 'senegal', 'côte d\'ivoire',
    'équipe', 'clients', 'rigueur', 'respect', 'procédure', 'transparence', 'délais'
  ];
  const foundContext = contextKeywords.filter(k => lower.includes(k));
  if (foundContext.length >= 1) {
    score += 10;
    strengths.push('Bonne contextualisation professionnelle adaptée aux réalités opérationnelles du marché.');
  }

  // 5. Analyse spécifique à la catégorie
  if (questionObj.category === 'negociation_salariale') {
    if (/(fcfa|f cfa|net|brut|package|mutuelle|ipm|13e|13ème)/i.test(rawAnswer)) {
      score += 10;
      strengths.push('Excellente approche de la négociation salariale abordant le package global en FCFA.');
    } else {
      weaknesses.push('Vous n\'avez pas précisé si le montant évoqué est net ou brut, ni mentionné les avantages connexes.');
      suggestions.push('Pensez à négocier le package global : couverture santé IPM, 13ème mois et prime de transport.');
    }
  }

  if (questionObj.category === 'questions_pieges') {
    if (/(perfectionniste|trop travailleur)/i.test(rawAnswer)) {
      score -= 15;
      weaknesses.push('Évitez le piège des clichés convenus comme "je suis trop perfectionniste", très mal perçus par les DRH.');
      suggestions.push('Citez un vrai trait de travail avec humilité, puis démontrez comment vous le compensez activement.');
    }
  }

  // Bornage du score entre 0 et 100
  score = Math.max(10, Math.min(98, score));

  // Qualification qualitative
  let pertinence = 'Moyenne';
  if (score >= 80) pertinence = 'Excellente';
  else if (score >= 65) pertinence = 'Bonne';
  else if (score < 40) pertinence = 'Insuffisante';

  if (strengths.length === 0) {
    strengths.push('Clarté basique du propos.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Poursuivez sur cette dynamique en renforçant l\'impact de votre conclusion.');
  }

  return {
    score,
    pertinence,
    status: score >= 65 ? 'valide' : 'a_perfectionner',
    strengths,
    points_forts: strengths,
    weaknesses,
    points_faibles: weaknesses,
    suggestions,
    suggestion_amelioration: suggestions.join(' '),
    what_recruiter_looks_for: questionObj.what_recruiter_looks_for || 'Non spécifié'
  };
}

/**
 * Détermine et retourne la prochaine question de l'entretien de façon adaptative
 * @param {string} sessionId Identifiant de session
 * @param {Array} previousAnswers Historique des réponses fournies jusqu'alors
 * @returns {Object} Objet question suivante et métadonnées
 */
function getNextQuestion(sessionId, previousAnswers) {
  const session = activeSessions.get(sessionId) || {
    asked_question_ids: [],
    persona: PERSONAS[0]
  };

  const answeredIds = new Set([
    ...(session.asked_question_ids || []),
    ...(Array.isArray(previousAnswers) ? previousAnswers.map(a => a.questionId || (a.question && a.question.id)).filter(Boolean) : [])
  ]);

  // Évaluation de la tendance des réponses précédentes
  let avgScore = 70;
  if (Array.isArray(previousAnswers) && previousAnswers.length > 0) {
    const validScores = previousAnswers.map(a => Number(a.score) || 60);
    avgScore = Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length);
  }

  // Filtrer les questions non encore posées
  const availableQuestions = QUESTION_BANK.filter(q => !answeredIds.has(q.id));

  if (availableQuestions.length === 0) {
    // Si toutes les questions ont été posées, recycler une question de mise en situation avancée
    return {
      completed: true,
      message: 'Toutes les étapes clés de l\'entretien ont été parcourues. Vous pouvez générer le bilan final.',
      nextQuestion: null
    };
  }

  // Sélection adaptative selon la performance du candidat et le persona
  let nextQ = null;
  let adaptationReason = '';

  if (avgScore < 50) {
    // En difficulté : poser une question plus accessible (catégorie culture ou motivation débutant)
    nextQ = availableQuestions.find(q => (q.category === 'motivation' || q.category === 'culture_entreprise') && q.difficulty === 'debutant')
      || availableQuestions[0];
    adaptationReason = 'Question recentrée sur les valeurs et les motivations fondamentales pour relancer la confiance.';
  } else if (avgScore >= 75) {
    // Très bon niveau : challenger avec une question de négociation ou question piège avancée
    nextQ = availableQuestions.find(q => (q.category === 'negociation_salariale' || q.category === 'questions_pieges' || q.category === 'mise_en_situation') && q.difficulty === 'avance')
      || availableQuestions[0];
    adaptationReason = 'Le candidat démontrant une belle solidité, le recruteur intensifie le défi avec une question stratégique.';
  } else {
    // Niveau intermédiaire standard : varier vers une mise en situation terrain
    nextQ = availableQuestions.find(q => q.category === 'mise_en_situation' || q.category === 'competences_comportementales')
      || availableQuestions[0];
    adaptationReason = 'Exploration pratique des compétences comportementales et de gestion des imprévus.';
  }

  // Mise à jour de la session
  session.asked_question_ids.push(nextQ.id);
  activeSessions.set(sessionId, session);

  return {
    completed: false,
    questionNumber: answeredIds.size + 1,
    adaptation_reason: adaptationReason,
    question: nextQ
  };
}

/**
 * Génère le rapport final complet d'une session d'entretien
 * @param {Array} answers Tableau des réponses enregistrées avec leurs évaluations
 * @returns {Object} Rapport d'évaluation global et plan d'action
 */
function generateSessionReport(answers) {
  const answerList = Array.isArray(answers) ? answers : [];

  if (answerList.length === 0) {
    return {
      session_status: 'vide',
      score_global: 0,
      total_questions: 0,
      message: 'Aucune réponse enregistrée pour générer le bilan de l\'entretien.'
    };
  }

  // Calcul du score global moyen
  const scores = answerList.map(a => {
    if (typeof a.score === 'number') return a.score;
    if (a.evaluation && typeof a.evaluation.score === 'number') return a.evaluation.score;
    return 60;
  });
  const globalScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

  // Analyse par catégorie
  const categoryBreakdown = {};
  answerList.forEach(a => {
    const cat = (a.question && a.question.category) || a.category || 'general';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { count: 0, totalScore: 0 };
    }
    const s = typeof a.score === 'number' ? a.score : ((a.evaluation && a.evaluation.score) || 60);
    categoryBreakdown[cat].count += 1;
    categoryBreakdown[cat].totalScore += s;
  });

  const categoryScores = {};
  for (const [cat, data] of Object.entries(categoryBreakdown)) {
    categoryScores[cat] = Math.round(data.totalScore / data.count);
  }

  // Synthèse des forces et points d'amélioration
  const allStrengths = [];
  const allWeaknesses = [];
  const allSuggestions = [];

  answerList.forEach(a => {
    const ev = a.evaluation || a;
    if (Array.isArray(ev.strengths)) allStrengths.push(...ev.strengths);
    if (Array.isArray(ev.points_forts)) allStrengths.push(...ev.points_forts);
    if (Array.isArray(ev.weaknesses)) allWeaknesses.push(...ev.weaknesses);
    if (Array.isArray(ev.points_faibles)) allWeaknesses.push(...ev.points_faibles);
    if (Array.isArray(ev.suggestions)) allSuggestions.push(...ev.suggestions);
    if (typeof ev.suggestion_amelioration === 'string' && ev.suggestion_amelioration.length > 5) {
      allSuggestions.push(ev.suggestion_amelioration);
    }
  });

  // Déduplication
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);
  const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 5);

  // Verdict et appréciation générale du jury
  let verdict = '';
  let readyForHire = false;

  if (globalScore >= 80) {
    verdict = 'Excellent profil. Candidat très convaincant, structuré et prêt pour les entretiens de haut niveau dans l\'UEMOA.';
    readyForHire = true;
  } else if (globalScore >= 65) {
    verdict = 'Bonne prestation globale. Les compétences fondamentales sont solides, quelques ajustements recommandés sur la précision des chiffres et la négociation.';
    readyForHire = true;
  } else if (globalScore >= 50) {
    verdict = 'Prestation moyenne. Le candidat possède du potentiel mais manque de concision et de structure STAR dans ses démonstrations.';
    readyForHire = false;
  } else {
    verdict = 'Niveau encore insuffisant pour des postes sélectifs. Nécessite un entraînement soutenu sur le pitch et les mises en situation.';
    readyForHire = false;
  }

  return {
    score_global: globalScore,
    mention: globalScore >= 80 ? 'Très Favorable' : (globalScore >= 65 ? 'Favorable' : (globalScore >= 50 ? 'Réservé' : 'À retravailler')),
    ready_for_interview: readyForHire,
    verdict_recruteur: verdict,
    total_questions_answered: answerList.length,
    scores_par_categorie: categoryScores,
    points_forts_majeurs: uniqueStrengths.length > 0 ? uniqueStrengths : ['Motivation affirmée pour le poste.'],
    axes_amelioration: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['Penser à davantage quantifier les résultats obtenus.'],
    recommandations_prioritaires: uniqueSuggestions.length > 0 ? uniqueSuggestions : [
      'Entraînez-vous à répondre en 90 secondes chrono sans vous éparpiller.',
      'Ayez toujours 2 réussites chiffrées en tête pour chaque expérience mentionnée.'
    ],
    conseils_contexte_afrique: [
      'Veillez à toujours valoriser le travail d\'équipe et la cohésion collective, très appréciés en entreprise ouest-africaine.',
      'Dans la négociation, valorisez la sécurité du package global (IPM famille, prime transport, 13ème mois).',
      'Adoptez une posture alliant respect chaleureux de la hiérarchie et assurance technique.'
    ]
  };
}

/**
 * Simule une négociation salariale contextualisée en FCFA (Afrique de l'Ouest / UEMOA)
 * @param {number|string} desiredSalary Prétention salariale mensuelle souhaitée
 * @param {Object|string} marketRange Fourchette du marché (ex: { min: 600000, max: 900000 } ou texte)
 * @param {Object} [profile] Profil du candidat (expérience, poste actuel)
 * @returns {Object} Analyse de la prétention, contre-proposition recruteur et stratégie
 */
function simulateSalaryNegotiation(desiredSalary, marketRange, profile) {
  // Extraction propre des montants numériques
  function parseFCFA(val, defaultVal = 0) {
    if (typeof val === 'number') return val;
    if (!val) return defaultVal;
    const clean = String(val).replace(/[^0-9]/g, '');
    return clean ? parseInt(clean, 10) : defaultVal;
  }

  const desired = parseFCFA(desiredSalary, 750000);

  let marketMin = 600000;
  let marketMax = 900000;

  if (marketRange && typeof marketRange === 'object') {
    marketMin = parseFCFA(marketRange.min, marketMin);
    marketMax = parseFCFA(marketRange.max, marketMax);
  } else if (typeof marketRange === 'string') {
    const parts = marketRange.split(/[-–àa]/);
    if (parts.length >= 2) {
      marketMin = parseFCFA(parts[0], marketMin);
      marketMax = parseFCFA(parts[1], marketMax);
    } else {
      const single = parseFCFA(marketRange, 700000);
      marketMin = Math.round(single * 0.85);
      marketMax = Math.round(single * 1.15);
    }
  }

  if (marketMin > marketMax) {
    const tmp = marketMin;
    marketMin = marketMax;
    marketMax = tmp;
  }

  const marketMid = Math.round((marketMin + marketMax) / 2);

  // Positionnement du candidat par rapport au marché
  let marketPosition = 'aligne';
  let ratio = desired / marketMid;

  if (ratio < 0.85) {
    marketPosition = 'sous_evalue';
  } else if (ratio > 1.25) {
    marketPosition = 'sur_evalue';
  }

  // Simulation de la contre-proposition employeur réaliste en zone UEMOA
  let simulatedOffer = desired;
  let recruiterFeedback = '';

  if (marketPosition === 'sur_evalue') {
    simulatedOffer = Math.min(marketMax, Math.round(desired * 0.82));
    recruiterFeedback = `Votre prétention de ${desired.toLocaleString('fr-FR')} FCFA se situe au-delà du plafond budgétaire de notre grille salariale. Notre proposition s'établit à ${simulatedOffer.toLocaleString('fr-FR')} FCFA net, complétée par un solide package social.`;
  } else if (marketPosition === 'sous_evalue') {
    simulatedOffer = Math.max(desired, marketMin);
    recruiterFeedback = `Votre demande de ${desired.toLocaleString('fr-FR')} FCFA est modeste au regard des responsabilités. Nous vous proposons ${simulatedOffer.toLocaleString('fr-FR')} FCFA net pour être en pleine équité avec la grille de l'entreprise.`;
  } else {
    // Aligné : négociation classique à -5% à -10% pour tester la flexibilité
    simulatedOffer = Math.round(desired * 0.93);
    recruiterFeedback = `Votre prétention de ${desired.toLocaleString('fr-FR')} FCFA est dans les clous du marché. Nous pouvons valider une base fixe de ${simulatedOffer.toLocaleString('fr-FR')} FCFA net accompagnée d'une prime de performance sur objectifs.`;
  }

  // Leviers de négociation spécifiques à l'Afrique de l'Ouest
  const packageLevers = [
    {
      item: '13ème mois & Gratification annuelle',
      value_estimate: `${Math.round(simulatedOffer / 12).toLocaleString('fr-FR')} FCFA/mois équivalent`,
      description: 'Prévu par la plupart des conventions collectives bancaires, de commerce ou d\'assurance dans l\'UEMOA.'
    },
    {
      item: 'Couverture Santé IPM / Assurance Maladie à 80%-100%',
      value_estimate: 'Prise en charge conjointe et enfants',
      description: 'Avantage capital pour sécuriser la famille sans débourser sur la consultation et la pharmacie.'
    },
    {
      item: 'Indemnité de transport / Véhicule de fonction ou dotation carburant',
      value_estimate: '50 000 à 150 000 FCFA/mois',
      description: 'Compense les coûts élevés de mobilité à Dakar (TER/BRT/Car rapide) ou Abidjan (VTC/Gbakas/Ponts à péage).'
    },
    {
      item: 'Dotation Télécom & Forfait Data Internet Pro',
      value_estimate: '25 000 à 50 000 FCFA/mois',
      description: 'Prise en charge de la ligne Orange/Wave/Moov pour le travail hybride et les astreintes.'
    },
    {
      item: 'Primes sur objectifs trimestriels ou annuels',
      value_estimate: '1 à 3 mois de salaire supplémentaire',
      description: 'Levier idéal pour combler un écart sur le salaire fixe initial sans bloquer la signature.'
    }
  ];

  // Scripts de négociation recommandés
  const recommendedScripts = {
    ouverture: `Au vu de mes compétences éprouvées et des réalisations que je m'engage à délivrer pour ${profile ? profile.title || 'ce poste' : 'l\'équipe'}, ma prétention s'établit à ${desired.toLocaleString('fr-FR')} FCFA net par mois, tout en restant attentif aux composantes de votre package global.`,
    reponse_a_offre_basse: `J'apprécie sincèrement votre proposition de ${simulatedOffer.toLocaleString('fr-FR')} FCFA net. Afin de nous aligner, pourrions-nous intégrer une prime d'objectifs semestrielle ou convenir d'une clause de réévaluation de mon fixe à l'issue de la période d'essai de 6 mois ?`,
    fermeture_elegante: `Je suis convaincu de la valeur que nous allons créer ensemble. Si nous formalisons cet accord avec la prise en charge de l'IPM à 100% et la prime de transport, je suis prêt à signer dès aujourd'hui.`
  };

  return {
    desired_salary: desired,
    desired_salary_formatted: `${desired.toLocaleString('fr-FR')} FCFA net/mois`,
    market_range: {
      min: marketMin,
      max: marketMax,
      median: marketMid,
      formatted: `${marketMin.toLocaleString('fr-FR')} - ${marketMax.toLocaleString('fr-FR')} FCFA net/mois`
    },
    market_position: marketPosition,
    simulated_recruiter_offer: simulatedOffer,
    simulated_recruiter_offer_formatted: `${simulatedOffer.toLocaleString('fr-FR')} FCFA net/mois`,
    recruiter_feedback: recruiterFeedback,
    ecart_montant: desired - simulatedOffer,
    package_negotiation_levers: packageLevers,
    recommended_scripts: recommendedScripts,
    conseils_tactiques: [
      'Ne donnez jamais de chiffre brut sans préciser le net perçu sur votre compte bancaire à la fin du mois.',
      'Ne justifiez jamais votre prétention par vos charges personnelles (loyer, famille), mais toujours par le retour sur investissement que vous apportez.',
      'Si le salaire fixe est bloqué, négociez systématiquement l\'indemnité logement, le carburant ou la prise en charge d\'une certification professionnelle reconnue.'
    ]
  };
}

// ============================================================================
// 4. EXPORTS DU MODULE
// ============================================================================

module.exports = {
  PERSONAS,
  QUESTION_BANK,
  startSession,
  evaluateAnswer,
  getNextQuestion,
  generateSessionReport,
  simulateSalaryNegotiation,
  getPersonas,
  getQuestionsByCategory
};
