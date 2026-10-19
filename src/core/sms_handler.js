/**
 * SunuJob AI - Gestionnaire de Services et Candidatures par SMS (Compatible Twilio / Mode Simulé)
 * Module: sms_handler.js
 *
 * Ce module gère les interactions par SMS pour les chercheurs d'emploi en Afrique de l'Ouest
 * (Sénégal, Côte d'Ivoire, Bénin, Togo, Mali, etc.), où le SMS reste un canal d'accès
 * fondamental à l'information sans nécessiter de connexion Internet smartphone.
 *
 * Contraintes strictes : Chaque réponse SMS principale respecte le standard GSM 160 caractères.
 */

const path = require('path');

// Chargement sécurisé des modules internes avec fallbacks
let jobAggregator;
let profileManager;

try {
  jobAggregator = require('./job_aggregator');
} catch (e) {
  jobAggregator = null;
}

try {
  profileManager = require('./profile');
} catch (e) {
  profileManager = null;
}

// ============================================================================
// 1. REGISTRES EN MÉMOIRE (SIMULATION PERSISTANTE)
// ============================================================================

// Registre des profils enregistrés par numéro de téléphone
const smsProfiles = new Map();

// Registre des désinscriptions STOP
const unsubscribedNumbers = new Set();

// ============================================================================
// 2. DICTIONNAIRE DES COMMANDES SMS DISPONIBLES
// ============================================================================

const SMS_COMMANDS = {
  SUNUJOB: {
    command: 'SUNUJOB',
    syntax: 'SUNUJOB [mots-clés] [ville]',
    description: 'Rechercher des offres d\'emploi par métier et localisation',
    example: 'SUNUJOB developpeur dakar',
    category: 'recherche'
  },
  PROFIL: {
    command: 'PROFIL',
    syntax: 'PROFIL NOM PRENOM POSTE',
    description: 'Enregistrer son profil rapide pour postuler en 1 clic par SMS',
    example: 'PROFIL DIOP Moustapha Developpeur',
    category: 'candidat'
  },
  AIDE: {
    command: 'AIDE',
    syntax: 'AIDE',
    description: 'Afficher le menu des commandes SMS disponibles',
    example: 'AIDE',
    category: 'support'
  },
  SALAIRE: {
    command: 'SALAIRE',
    syntax: 'SALAIRE [secteur]',
    description: 'Consulter la grille des salaires moyens du secteur en FCFA',
    example: 'SALAIRE tech',
    category: 'information'
  },
  CONCOURS: {
    command: 'CONCOURS',
    syntax: 'CONCOURS [pays]',
    description: 'Connaître les concours publics et administratifs ouverts',
    example: 'CONCOURS senegal',
    category: 'opportunites'
  },
  POSTULER: {
    command: 'POSTULER',
    syntax: 'POSTULER [id_offre]',
    description: 'Transmettre sa candidature immédiate par SMS à un recruteur',
    example: 'POSTULER SN-DKR-001',
    category: 'candidature'
  },
  STOP: {
    command: 'STOP',
    syntax: 'STOP',
    description: 'Se désabonner immédiatement des alertes et notifications SMS',
    example: 'STOP',
    category: 'gestion'
  }
};

// ============================================================================
// 3. BASE DE DONNÉES DE SECTEURS SALARIAUX & CONCOURS LOCAUX
// ============================================================================

const SALARY_BENCHMARKS = {
  tech: {
    label: 'Tech/Informatique',
    junior: '400k-650k',
    confirme: '700k-1.2M',
    senior: '1.3M-2.5M',
    perks: '13e mois + IPM 100%'
  },
  dev: {
    label: 'Developpement Logiciel',
    junior: '450k-700k',
    confirme: '750k-1.3M',
    senior: '1.4M-2.8M',
    perks: 'Télétravail + IPM'
  },
  banque: {
    label: 'Banque & Finance UEMOA',
    junior: '450k-700k',
    confirme: '800k-1.5M',
    senior: '1.6M-3.2M',
    perks: '13e/14e mois + bonus'
  },
  finance: {
    label: 'Finance & Audit',
    junior: '400k-650k',
    confirme: '750k-1.4M',
    senior: '1.5M-3M',
    perks: 'Primes + Assurance IPM'
  },
  comptabilite: {
    label: 'Comptabilite Syscohada',
    junior: '300k-500k',
    confirme: '550k-900k',
    senior: '1M-1.8M',
    perks: 'Primes de bilan'
  },
  logistique: {
    label: 'Logistique & Transit',
    junior: '350k-550k',
    confirme: '600k-1M',
    senior: '1.1M-2M',
    perks: 'Prime panier + transport'
  },
  rh: {
    label: 'Ressources Humaines',
    junior: '350k-500k',
    confirme: '550k-950k',
    senior: '1.1M-2M',
    perks: 'Mutuelle + formation'
  },
  commercial: {
    label: 'Commercial & Vente',
    junior: '250k-400k',
    confirme: '450k-850k',
    senior: '900k-1.8M',
    perks: 'Commissions + vehicule'
  },
  sante: {
    label: 'Sante & ONG',
    junior: '350k-600k',
    confirme: '650k-1.2M',
    senior: '1.3M-2.2M',
    perks: 'Indemnite zone + perdiem'
  },
  btp: {
    label: 'BTP & Genie Civil',
    junior: '400k-600k',
    confirme: '700k-1.3M',
    senior: '1.4M-2.7M',
    perks: 'Logement chantier + vehicule'
  }
};

const OFFICIAL_CONTESTS = {
  senegal: [
    { name: 'ENA Sénégal', deadline: '30 Nov 2026', link: 'ena.sn' },
    { name: 'FASTEF', deadline: '15 Déc 2026', link: 'fastef.ucad.sn' },
    { name: 'Douanes Sénégal', deadline: 'Ouvert', link: 'douanes.sn' },
    { name: 'Police Nationale', deadline: '10 Déc 2026', link: 'policenationale.gouv.sn' }
  ],
  ci: [
    { name: 'INFAS CI', deadline: 'Ouvert', link: 'infas.ci' },
    { name: 'ENA Côte d\'Ivoire', deadline: '25 Nov 2026', link: 'ena.ci' },
    { name: 'CAFOP Instituteurs', deadline: '12 Déc 2026', link: 'men-deco.org' },
    { name: 'Douanes Ivoiriennes', deadline: 'Ouvert', link: 'douanes.ci' }
  ],
  benin: [
    { name: 'ENA Bénin', deadline: 'Ouvert', link: 'enam.uac.bj' },
    { name: 'Concours Santé Bénin', deadline: '20 Déc 2026', link: 'sante.gouv.bj' }
  ]
};

// ============================================================================
// 4. UTILITAIRES DE FORMATAGE STRICT (MAX 160 CARACTÈRES)
// ============================================================================

/**
 * Tronque ou ajuste un texte pour garantir la limite de 160 caractères GSM
 * @param {string} text Texte brut
 * @returns {string} Texte d'une longueur <= 160 caractères
 */
function ensureMax160(text) {
  if (!text) return '';
  const clean = String(text).trim();
  if (clean.length <= 160) return clean;
  return clean.substring(0, 157).trim() + '...';
}

/**
 * Formate jusqu'à 3 offres d'emploi pour un affichage SMS ultra-compact
 * @param {Array} jobs Liste des offres trouvées
 * @returns {string} Texte SMS formatté (<= 160 caractères)
 */
function formatJobsForSMS(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return ensureMax160('SunuJob: 0 offre trouvee. Modifiez vos mots-cles (ex: SUNUJOB dev dakar) ou consultez sunujob.sn.');
  }

  const list = jobs.slice(0, 3);
  const items = list.map((j, idx) => {
    // Abréviation intelligente pour faire tenir l'information clé
    const shortTitle = (j.title || 'Poste')
      .replace(/Développeur/i, 'Dev')
      .replace(/Ingénieur/i, 'Ing')
      .replace(/Responsable/i, 'Resp')
      .replace(/Directeur/i, 'Dir')
      .replace(/Comptable/i, 'Compt')
      .replace(/Technicien/i, 'Tech');

    const shortCity = (j.city || '').replace(/Dakar/i, 'Dkr').replace(/Abidjan/i, 'Abj').replace(/Cotonou/i, 'Cot');
    const cityPart = shortCity ? ` ${shortCity}` : '';
    return `${idx + 1})${shortTitle}${cityPart} [${j.id}]`;
  });

  const fullStr = `SunuJob: ${items.join(' ')}. Pour postuler: POSTULER ID`;
  return ensureMax160(fullStr);
}

/**
 * Formate les informations de salaire pour affichage SMS
 * @param {Object|string} data Secteur ou objet de benchmark salarial
 * @returns {string} Texte SMS (<= 160 caractères)
 */
function formatSalaryForSMS(data) {
  let benchmark = null;

  if (typeof data === 'string') {
    const key = data.toLowerCase().trim();
    benchmark = SALARY_BENCHMARKS[key] || Object.values(SALARY_BENCHMARKS).find(b => b.label.toLowerCase().includes(key));
  } else if (data && typeof data === 'object') {
    benchmark = data;
  }

  if (!benchmark) {
    return ensureMax160('SunuJob Salaire: Secteur non liste. Dispos: tech, dev, banque, finance, logistique, rh, commercial, sante, btp. Ex: SALAIRE dev');
  }

  const msg = `Salaire ${benchmark.label} (net/mois FCFA): Jr ${benchmark.junior}, Conf ${benchmark.confirme}, Sr ${benchmark.senior}. ${benchmark.perks || ''}`;
  return ensureMax160(msg);
}

/**
 * Génère un rapport SMS de confirmation d'action
 * @param {string} action Type d'action (postuler, profil, alerte, stop, paiement)
 * @param {Object|string} result Données du résultat
 * @returns {string} Message SMS de confirmation (<= 160 caractères)
 */
function generateSMSReport(action, result) {
  const act = String(action || '').toLowerCase();

  switch (act) {
    case 'postuler': {
      const jobTitle = (result && result.title) ? result.title : 'le poste';
      const jobId = (result && result.id) ? ` (${result.id})` : '';
      return ensureMax160(`SunuJob: Candidature validee pour ${jobTitle}${jobId} ! Le recruteur a recu votre profil. Bonne chance !`);
    }

    case 'profil': {
      const name = (result && result.name) ? result.name : 'Candidat';
      const title = (result && result.title) ? ` (${result.title})` : '';
      return ensureMax160(`SunuJob: Profil ${name}${title} enregistre avec succes ! Envoyez SUNUJOB pour decouvrir vos offres correspondantes.`);
    }

    case 'stop': {
      return ensureMax160('SunuJob: Desinscription prise en compte. Vous ne recevrez plus d\'alertes SMS. Pour vous reabonner : envoyez SUNUJOB ou AIDE.');
    }

    case 'alerte': {
      const kw = (result && result.keyword) ? result.keyword : 'vos criteres';
      return ensureMax160(`SunuJob: Alerte activee pour "${kw}". Vous recevrez un SMS des qu'une nouvelle opportunite sera publiee.`);
    }

    default:
      return ensureMax160('SunuJob: Votre demande a bien ete traitee. Envoyez AIDE pour decouvrir les services disponibles.');
  }
}

// ============================================================================
// 5. VALIDATION DU FORMAT DE NUMÉRO TÉLÉPHONIQUE (UEMOA & AFRIQUE DE L'OUEST)
// ============================================================================

/**
 * Valide et identifie l'opérateur d'un numéro téléphonique ouest-africain
 * @param {string} phone Numéro de téléphone (ex: +221771234567, 0708091011, etc.)
 * @returns {Object} Analyse de conformité et opérateur
 */
function validatePhoneNumber(phone) {
  if (!phone) {
    return {
      valid: false,
      country: 'Inconnu',
      operator: 'Inconnu',
      formatted: '',
      raw: '',
      error: 'Numéro de téléphone absent'
    };
  }

  // Nettoyage des espaces, tirets, parenthèses
  let clean = String(phone).replace(/[\s\-\(\)\.]/g, '');

  // Remplacement de 00 par +
  if (clean.startsWith('00')) {
    clean = '+' + clean.substring(2);
  }

  // Gestion des formats locaux sans préfixe international
  // Si numéro ivoirien à 10 chiffres commençant par 01, 05, 07
  if (/^0[157]\d{8}$/.test(clean)) {
    clean = '+225' + clean;
  }
  // Si numéro sénégalais à 9 chiffres commençant par 70, 75, 76, 77, 78
  else if (/^7[05678]\d{7}$/.test(clean)) {
    clean = '+221' + clean;
  }

  // Vérification de la présence du +
  if (!clean.startsWith('+')) {
    clean = '+' + clean;
  }

  // 1. Sénégal (+221) : 9 chiffres après l'indicatif (+221 followed by 9 digits)
  const snMatch = clean.match(/^\+221(7[05678]\d{7})$/);
  if (snMatch) {
    const prefix2 = snMatch[1].substring(0, 2);
    let operator = 'Orange Sénégal (Sonatel)';
    if (prefix2 === '76') operator = 'Free Sénégal (Tigo)';
    else if (prefix2 === '70') operator = 'Expresso Sénégal';
    else if (prefix2 === '75') operator = 'Promobile Sénégal';

    return {
      valid: true,
      country: 'Sénégal',
      country_code: 'SN',
      operator,
      formatted: `+221 ${snMatch[1].substring(0, 2)} ${snMatch[1].substring(2, 5)} ${snMatch[1].substring(5, 7)} ${snMatch[1].substring(7, 9)}`,
      raw: clean
    };
  }

  // 2. Côte d'Ivoire (+225) : 10 chiffres (Plan de numérotation 2021)
  const ciMatch = clean.match(/^\+225(0[157]\d{8})$/);
  if (ciMatch) {
    const prefix2 = ciMatch[1].substring(0, 2);
    let operator = 'Orange Côte d\'Ivoire';
    if (prefix2 === '05') operator = 'MTN Côte d\'Ivoire';
    else if (prefix2 === '01') operator = 'Moov Africa CI';

    return {
      valid: true,
      country: 'Côte d\'Ivoire',
      country_code: 'CI',
      operator,
      formatted: `+225 ${ciMatch[1].substring(0, 2)} ${ciMatch[1].substring(2, 4)} ${ciMatch[1].substring(4, 6)} ${ciMatch[1].substring(6, 8)} ${ciMatch[1].substring(8, 10)}`,
      raw: clean
    };
  }

  // 3. Bénin (+229) : 8 chiffres après l'indicatif
  const bjMatch = clean.match(/^\+229(\d{8})$/);
  if (bjMatch) {
    const p = bjMatch[1].substring(0, 2);
    let operator = 'MTN Bénin';
    if (['95', '94', '60'].includes(p)) operator = 'Moov Africa Bénin';
    else if (['40', '51'].includes(p)) operator = 'Celtiis Bénin';

    return {
      valid: true,
      country: 'Bénin',
      country_code: 'BJ',
      operator,
      formatted: `+229 ${bjMatch[1].substring(0, 2)} ${bjMatch[1].substring(2, 5)} ${bjMatch[1].substring(5, 8)}`,
      raw: clean
    };
  }

  // 4. Togo (+228) : 8 chiffres après l'indicatif
  const tgMatch = clean.match(/^\+228([79]\d{7})$/);
  if (tgMatch) {
    const p = tgMatch[1].substring(0, 2);
    const operator = ['90', '91', '92', '93', '70'].includes(p) ? 'Togocom' : 'Moov Africa Togo';
    return {
      valid: true,
      country: 'Togo',
      country_code: 'TG',
      operator,
      formatted: `+228 ${tgMatch[1].substring(0, 2)} ${tgMatch[1].substring(2, 5)} ${tgMatch[1].substring(5, 8)}`,
      raw: clean
    };
  }

  // 5. Mali (+223) : 8 chiffres après l'indicatif
  const mlMatch = clean.match(/^\+223([56789]\d{7})$/);
  if (mlMatch) {
    const p = mlMatch[1][0];
    const operator = (p === '7' || p === '8') ? 'Orange Mali' : 'Moov Africa Malitel';
    return {
      valid: true,
      country: 'Mali',
      country_code: 'ML',
      operator,
      formatted: `+223 ${mlMatch[1].substring(0, 2)} ${mlMatch[1].substring(2, 5)} ${mlMatch[1].substring(5, 8)}`,
      raw: clean
    };
  }

  // 6. Burkina Faso (+226) : 8 chiffres après l'indicatif
  const bfMatch = clean.match(/^\+226([0567]\d{7})$/);
  if (bfMatch) {
    return {
      valid: true,
      country: 'Burkina Faso',
      country_code: 'BF',
      operator: 'Orange / Moov / Telecel BF',
      formatted: `+226 ${bfMatch[1]}`,
      raw: clean
    };
  }

  // 7. Format international générique valide (+ et 8 à 14 chiffres)
  if (/^\+\d{8,15}$/.test(clean)) {
    return {
      valid: true,
      country: 'International / Autre',
      country_code: 'INTL',
      operator: 'Opérateur Mobile International',
      formatted: clean,
      raw: clean
    };
  }

  return {
    valid: false,
    country: 'Inconnu',
    operator: 'Inconnu',
    formatted: clean,
    raw: clean,
    error: 'Format de numéro non reconnu. Ex: +221771234567 ou +2250708091011'
  };
}

// ============================================================================
// 6. GUIDE D'AIDE SMS COMPLET
// ============================================================================

/**
 * Retourne le texte d'aide SMS sous forme de segments <= 160 caractères
 * @returns {Object} Objet contenant la version courte, le tableau de segments et le texte complet
 */
function getHelpText() {
  const shortSummary = 'SunuJob SMS: 1)SUNUJOB [metier] [ville] 2)PROFIL Nom Prenom Poste 3)POSTULER [id] 4)SALAIRE [secteur] 5)CONCOURS [pays] 6)STOP. Service gratuit.';

  const segments = [
    'SunuJob SMS (1/3): Bienvenue sur le service emploi par SMS pour l\'UEMOA. Trouvez un job sans connexion internet. Repondez avec l\'une des commandes suivantes :',
    'SunuJob SMS (2/3): - SUNUJOB dev dakar (cherche offres)\n- POSTULER SN-DKR-001 (postule en 1 clic)\n- PROFIL Diop Awa Comptable (cree votre CV)',
    'SunuJob SMS (3/3): - SALAIRE tech (grille salaires FCFA)\n- CONCOURS senegal (concours ouverts)\n- STOP (desinscription). Aide en ligne sur sunujob.sn'
  ];

  return {
    summary: ensureMax160(shortSummary),
    segments: segments.map(s => ensureMax160(s)),
    fullText: segments.join('\n\n')
  };
}

// ============================================================================
// 7. TRAITEMENT DU SMS ENTRANT (PROCESS INCOMING SMS)
// ============================================================================

/**
 * Traite un SMS entrant compatible Webhook Twilio ou intégration directe
 * @param {string} from Numéro de téléphone de l'expéditeur
 * @param {string} body Contenu du message SMS
 * @returns {Object} Résultat de traitement contenant la réponse garantie <= 160 chars
 */
function processIncomingSMS(from, body) {
  const senderPhone = String(from || '').trim();
  const rawBody = String(body || '').trim();

  // Vérification de la désinscription préalable
  if (unsubscribedNumbers.has(senderPhone) && !/^sunujob|^aide|^start/i.test(rawBody)) {
    return {
      from: senderPhone,
      command: 'UNSUBSCRIBED',
      success: false,
      reply: ensureMax160('SunuJob: Votre numero est desinscrit. Pour reactiver le service d\'offres d\'emploi, envoyez SUNUJOB ou AIDE par SMS.'),
      charCount: 120,
      twiml: `<Response><Message>SunuJob: Votre numero est desinscrit. Pour reactiver, envoyez SUNUJOB.</Message></Response>`
    };
  }

  // Découpage du message en tokens
  const tokens = rawBody.split(/\s+/).filter(Boolean);
  const firstToken = tokens.length > 0 ? tokens[0].toUpperCase() : '';

  let replyText = '';
  let commandDetected = firstToken || 'EMPTY';
  let isSuccess = true;

  switch (firstToken) {
    // ------------------------------------------------------------------------
    // COMMANDE 1 : AIDE / HELP / MENU
    // ------------------------------------------------------------------------
    case 'AIDE':
    case 'HELP':
    case 'MENU':
    case 'INFOS': {
      commandDetected = 'AIDE';
      replyText = ensureMax160('SunuJob SMS: 1)SUNUJOB motcle ville (offres) 2)PROFIL Nom Prenom Poste 3)POSTULER id 4)SALAIRE secteur 5)CONCOURS pays 6)STOP. Gratuit.');
      break;
    }

    // ------------------------------------------------------------------------
    // COMMANDE 2 : STOP (Désinscription RGPD / CDP)
    // ------------------------------------------------------------------------
    case 'STOP':
    case 'ARRET':
    case 'QUITTER': {
      commandDetected = 'STOP';
      unsubscribedNumbers.add(senderPhone);
      replyText = generateSMSReport('stop');
      break;
    }

    // ------------------------------------------------------------------------
    // COMMANDE 3 : PROFIL (Création / mise à jour rapide du candidat)
    // ------------------------------------------------------------------------
    case 'PROFIL':
    case 'PROFILE':
    case 'CV': {
      commandDetected = 'PROFIL';
      if (tokens.length < 3) {
        replyText = ensureMax160('SunuJob: Format incorrect. Envoyez : PROFIL NOM PRENOM METIER (ex: PROFIL DIOP Moustapha Developpeur).');
        isSuccess = false;
      } else {
        const nom = tokens[1];
        const prenom = tokens[2];
        const poste = tokens.slice(3).join(' ') || 'Professionnel';

        const profileData = {
          phone: senderPhone,
          name: `${prenom} ${nom}`,
          title: poste,
          created_at: new Date().toISOString()
        };

        smsProfiles.set(senderPhone, profileData);

        // Sauvegarde éventuelle dans le profileManager global si dispo
        if (profileManager && typeof profileManager.saveProfile === 'function') {
          try {
            profileManager.saveProfile({
              name: `${prenom} ${nom}`,
              title: poste,
              phone: senderPhone
            });
          } catch (e) {
            // Silencieux pour ne pas impacter le SMS
          }
        }

        replyText = generateSMSReport('profil', { name: `${prenom} ${nom}`, title: poste });
      }
      break;
    }

    // ------------------------------------------------------------------------
    // COMMANDE 4 : SALAIRE (Grille de salaires FCFA par secteur)
    // ------------------------------------------------------------------------
    case 'SALAIRE':
    case 'SALAIRES': {
      commandDetected = 'SALAIRE';
      const sectorQuery = tokens.slice(1).join(' ').toLowerCase();
      if (!sectorQuery) {
        replyText = ensureMax160('SunuJob Salaire: Precisez le secteur. Ex: SALAIRE tech, SALAIRE banque, SALAIRE logistique, SALAIRE compta, SALAIRE btp.');
      } else {
        replyText = formatSalaryForSMS(sectorQuery);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // COMMANDE 5 : CONCOURS (Concours administratifs / fonction publique)
    // ------------------------------------------------------------------------
    case 'CONCOURS': {
      commandDetected = 'CONCOURS';
      const countryQuery = (tokens.slice(1).join(' ') || 'senegal').toLowerCase();

      let contestList = OFFICIAL_CONTESTS.senegal;
      let countryLabel = 'SN';

      if (countryQuery.includes('ci') || countryQuery.includes('ivoir') || countryQuery.includes('abidjan')) {
        contestList = OFFICIAL_CONTESTS.ci;
        countryLabel = 'CI';
      } else if (countryQuery.includes('benin') || countryQuery.includes('cotonou')) {
        contestList = OFFICIAL_CONTESTS.benin;
        countryLabel = 'Bénin';
      }

      const formattedItems = contestList.map(c => `${c.name} (${c.deadline})`).join(', ');
      replyText = ensureMax160(`Concours ${countryLabel} 2026: ${formattedItems}. Retrait dossiers sur sites officiels. Info: sunujob.sn`);
      break;
    }

    // ------------------------------------------------------------------------
    // COMMANDE 6 : POSTULER (Postuler par SMS à une offre avec son ID)
    // ------------------------------------------------------------------------
    case 'POSTULER':
    case 'APPLY': {
      commandDetected = 'POSTULER';
      const targetJobId = tokens[1] ? tokens[1].toUpperCase() : '';

      if (!targetJobId) {
        replyText = ensureMax160('SunuJob: ID d\'offre manquant. Envoyez: POSTULER ID (ex: POSTULER SN-DKR-001). Envoyez SUNUJOB pour voir les IDs.');
        isSuccess = false;
      } else {
        // Recherche du poste dans jobAggregator ou liste locale
        let foundJob = null;
        if (jobAggregator && typeof jobAggregator.getJobById === 'function') {
          foundJob = jobAggregator.getJobById(targetJobId);
        }

        // Si non trouvé par l'agrégateur, fallback sur ID connus
        if (!foundJob) {
          const knownJobs = [
            { id: 'SN-DKR-001', title: 'Dev Full-Stack', company: 'Baobab FinTech' },
            { id: 'CI-ABJ-002', title: 'Resp Logistique', company: 'Ivoire Transit' },
            { id: 'SN-DKR-003', title: 'Comptable Syscohada', company: 'Cabinet Audit Dakar' }
          ];
          foundJob = knownJobs.find(j => j.id.toUpperCase() === targetJobId);
        }

        if (!foundJob) {
          replyText = ensureMax160(`SunuJob: Offre "${targetJobId}" introuvable. Envoyez SUNUJOB dakar pour obtenir la liste des IDs valides.`);
          isSuccess = false;
        } else {
          // Vérification si profil déjà renseigné
          const candidate = smsProfiles.get(senderPhone);
          const candName = candidate ? ` de ${candidate.name}` : '';
          replyText = ensureMax160(`SunuJob: Candidature${candName} transmise a ${foundJob.company || 'l\'employeur'} pour ${foundJob.title || targetJobId} ! Bonne chance !`);
        }
      }
      break;
    }

    // ------------------------------------------------------------------------
    // COMMANDE 7 : SUNUJOB (Recherche d'offres d'emploi)
    // ------------------------------------------------------------------------
    case 'SUNUJOB':
    case 'EMPLOI':
    case 'JOB':
    case 'JOBS': {
      commandDetected = 'SUNUJOB';
      const searchTerms = tokens.slice(1).join(' ');

      let jobs = [];
      if (jobAggregator && typeof jobAggregator.getAllJobs === 'function') {
        const all = jobAggregator.getAllJobs();
        if (!searchTerms) {
          jobs = all.slice(0, 3);
        } else {
          const term = searchTerms.toLowerCase();
          jobs = all.filter(j =>
            (j.title && j.title.toLowerCase().includes(term)) ||
            (j.city && j.city.toLowerCase().includes(term)) ||
            (j.country && j.country.toLowerCase().includes(term)) ||
            (j.description && j.description.toLowerCase().includes(term))
          );
        }
      }

      // Si aucun résultat ou agrégateur non initialisé, fournir offres par défaut
      if (jobs.length === 0) {
        jobs = [
          { id: 'SN-DKR-001', title: 'Dev Full-Stack', city: 'Dakar', company: 'Baobab' },
          { id: 'CI-ABJ-002', title: 'Resp Logistique', city: 'Abidjan', company: 'Ivoire Transit' },
          { id: 'SN-DKR-003', title: 'Comptable Syscohada', city: 'Dakar', company: 'Audit Dakar' }
        ];
      }

      replyText = formatJobsForSMS(jobs);
      break;
    }

    // ------------------------------------------------------------------------
    // COMMANDE NON RECONNUE / TEXTE LIBRE
    // ------------------------------------------------------------------------
    default: {
      commandDetected = 'UNKNOWN';
      isSuccess = false;
      replyText = ensureMax160(`SunuJob: Commande inconnue. Tapez SUNUJOB pour voir les offres d'emploi ou AIDE pour le menu des commandes gratuites.`);
      break;
    }
  }

  // Garantie absolue que le texte ne dépasse pas 160 caractères
  const finalReply = ensureMax160(replyText);

  // Construction du XML TwiML pour compatibilité Twilio
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${finalReply}</Message></Response>`;

  return {
    from: senderPhone,
    command: commandDetected,
    success: isSuccess,
    reply: finalReply,
    charCount: finalReply.length,
    isWithin160Chars: finalReply.length <= 160,
    twiml: twimlResponse
  };
}

// ============================================================================
// 8. SIMULATION D'UNE CONVERSATION SMS COMPLÈTE (POUR TESTS & DEMOS)
// ============================================================================

/**
 * Simule un échange de plusieurs messages SMS pour démonstration et tests
 * @param {Array<string|Object>} messages Liste des messages entrants
 * @param {string} [defaultFrom] Numéro de téléphone de simulation (+221771234567 par défaut)
 * @returns {Object} Rapport de la conversation avec tous les échanges
 */
function simulateSMSConversation(messages, defaultFrom = '+221771234567') {
  const msgList = Array.isArray(messages) ? messages : [messages];
  const transcript = [];

  msgList.forEach((item, index) => {
    let from = defaultFrom;
    let body = '';

    if (typeof item === 'string') {
      body = item;
    } else if (item && typeof item === 'object') {
      body = item.body || item.message || '';
      from = item.from || defaultFrom;
    }

    const processed = processIncomingSMS(from, body);

    transcript.push({
      step: index + 1,
      inbound: {
        from,
        body
      },
      outbound: {
        reply: processed.reply,
        charCount: processed.charCount,
        command: processed.command,
        success: processed.success
      }
    });
  });

  return {
    total_messages: transcript.length,
    simulated_phone: defaultFrom,
    all_within_160_chars: transcript.every(t => t.outbound.charCount <= 160),
    conversation: transcript
  };
}

// ============================================================================
// 9. EXPORTS DU MODULE
// ============================================================================

module.exports = {
  SMS_COMMANDS,
  processIncomingSMS,
  formatJobsForSMS,
  formatSalaryForSMS,
  generateSMSReport,
  validatePhoneNumber,
  getHelpText,
  simulateSMSConversation
};
