const fs = require('fs');
const path = require('path');

const PROFILE_FILE = path.join(__dirname, '../data/current_profile.json');
const SAMPLE_PROFILES_FILE = path.join(__dirname, '../data/sample_profiles.json');

function getSampleProfiles() {
  if (fs.existsSync(SAMPLE_PROFILES_FILE)) {
    return JSON.parse(fs.readFileSync(SAMPLE_PROFILES_FILE, 'utf-8'));
  }
  return [];
}

function getProfile() {
  if (fs.existsSync(PROFILE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
    } catch (e) {
      console.error('Erreur de lecture du profil:', e);
    }
  }
  const samples = getSampleProfiles();
  return samples.length > 0 ? samples[0] : null;
}

function saveProfile(profileData) {
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(profileData, null, 2), 'utf-8');
  return profileData;
}

function parseCvText(rawText) {
  // Extraction simple et intelligente des éléments clés du CV
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const detectedSkills = [];
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PHP', 'Laravel',
    'PostgreSQL', 'MySQL', 'Docker', 'Git', 'Wave', 'Orange Money', 'Syscohada',
    'Sage', 'Comptabilité', 'Fiscalité', 'Logistique', 'Odoo', 'SAP', 'Marketing',
    'Vente', 'Management', 'Communication', 'Anglais', 'Français', 'Excel'
  ];

  commonSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(rawText)) {
      detectedSkills.push(skill);
    }
  });

  return {
    raw_lines_count: lines.length,
    detected_skills: detectedSkills,
    extracted_preview: lines.slice(0, 10).join(' ')
  };
}

module.exports = {
  getProfile,
  saveProfile,
  getSampleProfiles,
  parseCvText
};
