const fs = require('fs');
const path = require('path');

const JOBS_FILE = path.join(__dirname, '../data/jobs.json');
const DEFAULT_JOBS_FILE = path.join(__dirname, '../data/default_jobs.json');

function getAllJobs() {
  if (fs.existsSync(JOBS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Erreur lecture jobs.json:', e);
    }
  }
  if (fs.existsSync(DEFAULT_JOBS_FILE)) {
    const defaults = JSON.parse(fs.readFileSync(DEFAULT_JOBS_FILE, 'utf-8'));
    fs.writeFileSync(JOBS_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  }
  return [];
}

function saveJobs(jobs) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

function getJobById(id) {
  const jobs = getAllJobs();
  return jobs.find(j => j.id === id) || null;
}

function addCustomJob(jobData) {
  const jobs = getAllJobs();
  const newJob = {
    id: `CUSTOM-${Date.now()}`,
    title: jobData.title || 'Poste sans titre',
    company: jobData.company || 'Entreprise Confidentielle',
    country: jobData.country || 'Sénégal',
    city: jobData.city || 'Dakar',
    district: jobData.district || 'Non spécifié',
    contract: jobData.contract || 'CDI',
    salary_range: jobData.salary_range || 'À négocier',
    deadline: jobData.deadline || 'À convenir',
    contact_email: jobData.contact_email || '',
    contact_whatsapp: jobData.contact_whatsapp || '',
    requirements: Array.isArray(jobData.requirements) ? jobData.requirements : (jobData.requirements ? [jobData.requirements] : []),
    description: jobData.description || '',
    is_custom: true,
    created_at: new Date().toISOString()
  };
  jobs.unshift(newJob);
  saveJobs(jobs);
  return newJob;
}

function searchJobs(query = '', country = '', contract = '') {
  const jobs = getAllJobs();
  return jobs.filter(job => {
    const matchesQuery = !query || 
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.description.toLowerCase().includes(query.toLowerCase()) ||
      (job.requirements && job.requirements.some(r => r.toLowerCase().includes(query.toLowerCase())));

    const matchesCountry = !country || job.country.toLowerCase() === country.toLowerCase();
    const matchesContract = !contract || job.contract.toLowerCase() === contract.toLowerCase();

    return matchesQuery && matchesCountry && matchesContract;
  });
}

module.exports = {
  getAllJobs,
  saveJobs,
  getJobById,
  addCustomJob,
  searchJobs
};
