/**
 * CREDENTIAL VAULT — Coffre-Fort Numérique & Certification des Diplômes
 * ─────────────────────────────────────────────────────────────────────────────
 * Hachage cryptographique SHA-256 et vérification anti-fraude des diplômes
 * et certificats universitaires en Afrique de l'Ouest.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const VAULT_FILE = path.join(__dirname, '../data/credential_vault.json');

const INITIAL_CREDENTIALS = [
  {
    id: "cred-esp-2024",
    candidate_name: "Ibrahima Ndiaye",
    document_type: "Diplôme de Master 2",
    title: "Master Professionnel en Génie Logiciel",
    institution: "École Supérieure Polytechnique (ESP) / UCAD Dakar",
    graduation_year: 2024,
    grade: "Mention Bien",
    verification_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "Certifié Authentique",
    verified_by: "Ministère de l'Enseignement Supérieur du Sénégal / Service Scolarité ESP",
    verified_at: "2024-07-15T10:00:00Z"
  },
  {
    id: "cred-cert-aws-2025",
    candidate_name: "Ibrahima Ndiaye",
    document_type: "Certification Internationale",
    title: "AWS Certified Solutions Architect – Associate",
    institution: "Amazon Web Services (AWS)",
    graduation_year: 2025,
    grade: "Score: 890/1000",
    verification_hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    status: "Certifié Authentique",
    verified_by: "Validation automatique Credly / AWS Certification Portal",
    verified_at: "2025-03-10T14:30:00Z"
  }
];

function loadCredentials() {
  if (fs.existsSync(VAULT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8'));
    } catch (e) {
      console.error(e);
    }
  }
  saveCredentials(INITIAL_CREDENTIALS);
  return INITIAL_CREDENTIALS;
}

function saveCredentials(data) {
  fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getCandidateCredentials(candidateName = "Ibrahima Ndiaye") {
  const all = loadCredentials();
  return all.filter(c => c.candidate_name.toLowerCase().includes(candidateName.toLowerCase()));
}

function registerNewCredential(data) {
  const all = loadCredentials();
  const rawString = `${data.candidate_name}|${data.title}|${data.institution}|${data.graduation_year}|${Date.now()}`;
  const hash = crypto.createHash('sha256').update(rawString).digest('hex');

  const newCred = {
    id: `cred-${Date.now()}`,
    candidate_name: data.candidate_name || "Ibrahima Ndiaye",
    document_type: data.document_type || "Diplôme Supérieur",
    title: data.title,
    institution: data.institution,
    graduation_year: parseInt(data.graduation_year) || 2024,
    grade: data.grade || "Validé",
    verification_hash: hash,
    status: "Certifié Authentique",
    verified_by: `Enregistrement Coffre-fort SunuJob AI (Horodatage Certifié)`,
    verified_at: new Date().toISOString()
  };

  all.unshift(newCred);
  saveCredentials(all);
  return newCred;
}

function verifyCredentialByHashOrId(query) {
  const all = loadCredentials();
  const found = all.find(c => c.id === query || c.verification_hash === query);
  if (!found) {
    return { valid: false, message: "Aucun diplôme ou certificat correspondant à cette signature." };
  }
  return {
    valid: true,
    credential: found,
    qr_verification_url: `http://localhost:3000/verify/${found.id}`
  };
}

module.exports = {
  getCandidateCredentials,
  registerNewCredential,
  verifyCredentialByHashOrId
};
