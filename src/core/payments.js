const fs = require('fs');
const path = require('path');

const USER_CREDITS_FILE = path.join(__dirname, '../data/user_credits.json');

const PACKS = [
  {
    id: "pack_starter",
    name: "Pack Découverte",
    price_fcfa: 1000,
    applications_count: 3,
    description: "3 dossiers de candidature sur-mesure (CV + Lettre révisés par l'Agent 2)"
  },
  {
    id: "pack_intensif",
    name: "Pack Candidat Pro",
    price_fcfa: 2500,
    applications_count: 10,
    bonus_coach: true,
    description: "10 candidatures sur-mesure + Préparation aux entretiens d'embauche"
  },
  {
    id: "pack_illimite",
    name: "Pass Réussite 30 Jours",
    price_fcfa: 5000,
    applications_count: 999,
    bonus_coach: true,
    description: "Candidatures illimitées pendant 1 mois + Coaching prioritaire"
  }
];

function getCredits() {
  if (fs.existsSync(USER_CREDITS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USER_CREDITS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Erreur lecture credits:', e);
    }
  }
  // Par défaut : 2 candidatures gratuites en modèle Freemium
  const defaultCredits = {
    free_quota_remaining: 2,
    purchased_credits: 0,
    total_available: 2,
    has_coach_access: true,
    history: []
  };
  fs.writeFileSync(USER_CREDITS_FILE, JSON.stringify(defaultCredits, null, 2), 'utf-8');
  return defaultCredits;
}

function saveCredits(credits) {
  fs.writeFileSync(USER_CREDITS_FILE, JSON.stringify(credits, null, 2), 'utf-8');
}

function consumeCredit() {
  const credits = getCredits();
  if (credits.total_available <= 0) {
    return {
      success: false,
      message: "Votre solde de candidatures est épuisé. Veuillez recharger via Wave ou Orange Money."
    };
  }

  if (credits.free_quota_remaining > 0) {
    credits.free_quota_remaining -= 1;
  } else {
    credits.purchased_credits -= 1;
  }
  credits.total_available = credits.free_quota_remaining + credits.purchased_credits;
  saveCredits(credits);

  return {
    success: true,
    remaining: credits.total_available
  };
}

function processPayment(packId, method, phoneNumber) {
  const pack = PACKS.find(p => p.id === packId);
  if (!pack) {
    return { success: false, error: "Pack introuvable." };
  }

  const credits = getCredits();
  const addedCredits = pack.applications_count;
  credits.purchased_credits += addedCredits;
  credits.total_available = credits.free_quota_remaining + credits.purchased_credits;
  if (pack.bonus_coach) {
    credits.has_coach_access = true;
  }

  const transaction = {
    tx_id: `TX-${Date.now()}`,
    date: new Date().toISOString(),
    pack: pack.name,
    amount_fcfa: pack.price_fcfa,
    method: method, // 'wave', 'orange_money', 'mtn_momo'
    phone: phoneNumber,
    status: "SUCCESS"
  };

  credits.history.unshift(transaction);
  saveCredits(credits);

  return {
    success: true,
    transaction: transaction,
    new_balance: credits.total_available
  };
}

module.exports = {
  PACKS,
  getCredits,
  consumeCredit,
  processPayment
};
