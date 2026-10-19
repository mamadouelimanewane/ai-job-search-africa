const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const profileManager = require('./src/core/profile');
const jobAggregator = require('./src/core/job_aggregator');
const matchingEngine = require('./src/core/matching');
const dualAgentEngine = require('./src/core/dual_agent');
const interviewCoach = require('./src/core/interview_coach');
const paymentManager = require('./src/core/payments');
const webScanner = require('./src/core/web_scanner');
const aiAnalyzer = require('./src/core/ai_analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =================== ROUTES PROFIL CANDIDAT =================== //

app.get('/api/profile', (req, res) => {
  const profile = profileManager.getProfile();
  res.json({ success: true, profile });
});

app.post('/api/profile', (req, res) => {
  const updated = profileManager.saveProfile(req.body);
  res.json({ success: true, profile: updated });
});

app.get('/api/profile/samples', (req, res) => {
  const samples = profileManager.getSampleProfiles();
  res.json({ success: true, samples });
});

app.post('/api/profile/select-sample', (req, res) => {
  const { id } = req.body;
  const samples = profileManager.getSampleProfiles();
  const selected = samples.find(s => s.id === id);
  if (selected) {
    profileManager.saveProfile(selected);
    return res.json({ success: true, profile: selected });
  }
  res.status(404).json({ success: false, error: 'Profil exemple introuvable' });
});

// =================== ROUTES OFFRES D'EMPLOI =================== //

app.get('/api/jobs', (req, res) => {
  const { q, country, contract } = req.query;
  const jobs = jobAggregator.searchJobs(q, country, contract);
  res.json({ success: true, total: jobs.length, jobs });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobAggregator.getJobById(req.params.id);
  if (job) {
    return res.json({ success: true, job });
  }
  res.status(404).json({ success: false, error: 'Offre non trouvée' });
});

app.post('/api/jobs/custom', (req, res) => {
  const newJob = jobAggregator.addCustomJob(req.body);
  res.json({ success: true, job: newJob });
});

// =================== ROUTE MATCHING & SCORING =================== //

app.post('/api/match', (req, res) => {
  const { jobId, profileData } = req.body;
  const profile = profileData || profileManager.getProfile();
  const job = jobAggregator.getJobById(jobId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Offre introuvable' });
  }

  const matchResult = matchingEngine.calculateMatch(profile, job);
  res.json({ success: true, match: matchResult, job });
});

// =================== ROUTE MULTI-AGENTS CANDIDATURE =================== //

app.post('/api/generate-application', async (req, res) => {
  const { jobId, profileData } = req.body;
  const profile = profileData || profileManager.getProfile();
  const job = jobAggregator.getJobById(jobId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Offre introuvable' });
  }

  // Vérifier et débiter un crédit (Freemium ou payant)
  const creditCheck = paymentManager.consumeCredit();
  if (!creditCheck.success) {
    return res.status(402).json({
      success: false,
      error: "CREDITS_EXHAUSTED",
      message: creditCheck.message
    });
  }

  try {
    const result = await dualAgentEngine.generateWithDualAgent(profile, job);
    res.json({
      success: true,
      result,
      credits_remaining: creditCheck.remaining
    });
  } catch (error) {
    console.error('Erreur génération multi-agents:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la génération' });
  }
});

// =================== ROUTE COACH D'ENTRETIEN =================== //

app.post('/api/interview-prep', (req, res) => {
  const { jobId, profileData } = req.body;
  const profile = profileData || profileManager.getProfile();
  const job = jobAggregator.getJobById(jobId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Offre introuvable' });
  }

  const prep = interviewCoach.generateInterviewPrep(profile, job);
  res.json({ success: true, prep });
});

// =================== ROUTES PAIEMENT MOBILE MONEY =================== //

app.get('/api/credits', (req, res) => {
  const credits = paymentManager.getCredits();
  res.json({ success: true, credits, packs: paymentManager.PACKS });
});

app.post('/api/payments/checkout', (req, res) => {
  const { packId, method, phone } = req.body;
  if (!packId || !method || !phone) {
    return res.status(400).json({ success: false, error: 'Informations incomplètes' });
  }

  const outcome = paymentManager.processPayment(packId, method, phone);
  res.json(outcome);
});

// =================== ROUTES AGRÉGATEUR & SCANNER WEB =================== //

app.get('/api/aggregator/sites', (req, res) => {
  const sites = webScanner.getMonitoredSources();
  res.json({ success: true, count: sites.length, sites });
});

app.post('/api/aggregator/scan', async (req, res) => {
  const { query, country, deepScan } = req.body;
  try {
    const scanResult = await webScanner.performLiveWebCrawl({ query, country, deepScan });
    res.json(scanResult);
  } catch (err) {
    console.error('Erreur scan web temps réel:', err);
    res.status(500).json({ success: false, error: 'Erreur lors du balayage du web' });
  }
});

app.post('/api/aggregator/add-site', (req, res) => {
  const { name, url, country, city, type } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, error: 'Nom et URL obligatoires' });
  }
  const newSite = webScanner.addNewSource({ name, url, country, city, type });
  res.json({ success: true, site: newSite });
});

// =================== ROUTES IA — ANALYSE INTELLIGENTE DES OFFRES =================== //

// Analyser une offre spécifique
app.post('/api/ai/analyze-job', (req, res) => {
  const { job } = req.body;
  if (!job) return res.status(400).json({ success: false, error: 'Offre manquante' });
  const analysis = aiAnalyzer.analyzeJobOffer(job);
  res.json({ success: true, analysis });
});

// Analyser en lot toutes les offres de la base
app.get('/api/ai/analyze-all', (req, res) => {
  const jobs = jobAggregator.getAllJobs();
  const enriched = aiAnalyzer.batchAnalyzeJobs(jobs);
  res.json({ success: true, count: enriched.length, jobs: enriched });
});

// Tendances du marché
app.get('/api/ai/market-trends', (req, res) => {
  const jobs = jobAggregator.getAllJobs();
  const trends = aiAnalyzer.detectMarketTrends(jobs);
  res.json({ success: true, trends });
});

// Rapport narratif IA du marché
app.get('/api/ai/insight-report', (req, res) => {
  const jobs = jobAggregator.getAllJobs();
  const report = aiAnalyzer.generateInsightReport(jobs);
  res.json({ success: true, report });
});

// Générer une requête de recherche intelligente depuis le profil
app.post('/api/ai/smart-query', (req, res) => {
  const { profile } = req.body;
  const query = aiAnalyzer.generateSmartQuery(profile || profileManager.getProfile());
  res.json({ success: true, query });
});

// Classement personnalisé des offres pour le profil actif
app.post('/api/ai/rank-jobs', (req, res) => {
  const { profile } = req.body;
  const jobs  = jobAggregator.getAllJobs();
  const activeProfile = profile || profileManager.getProfile();
  const ranked = aiAnalyzer.rankJobsForProfile(jobs, activeProfile);
  res.json({ success: true, count: ranked.length, jobs: ranked });
});

// =================== ROUTES IA — PROFIL & DOSSIER DE CANDIDATURE =================== //

// Analyse complète du profil actif
app.get('/api/ai/profile-analysis', (req, res) => {
  const profile = profileManager.getProfile();
  const analysis = aiAnalyzer.analyzeProfile(profile);
  res.json({ success: true, analysis });
});

// Analyse d'un profil fourni en POST
app.post('/api/ai/profile-analysis', (req, res) => {
  const profile = req.body.profile || profileManager.getProfile();
  const analysis = aiAnalyzer.analyzeProfile(profile);
  res.json({ success: true, analysis });
});

// Générer un pitch/résumé professionnel automatique
app.post('/api/ai/generate-summary', (req, res) => {
  const profile = req.body.profile || profileManager.getProfile();
  const result  = aiAnalyzer.generateProfessionalSummary(profile);
  res.json({ success: true, result });
});

// Détecter les lacunes de compétences vs marché
app.post('/api/ai/skill-gaps', (req, res) => {
  const { profile, sector } = req.body;
  const activeProfile = profile || profileManager.getProfile();
  const gaps = aiAnalyzer.detectSkillGaps(activeProfile, sector);
  res.json({ success: true, gaps });
});

// Score ATS du profil
app.post('/api/ai/ats-score', (req, res) => {
  const profile  = req.body.profile || profileManager.getProfile();
  const atsScore = aiAnalyzer.scoreProfileATS(profile);
  res.json({ success: true, ats: atsScore });
});

// Suggestions d'actions prioritaires
app.get('/api/ai/next-actions', (req, res) => {
  const profile  = profileManager.getProfile();
  const actions  = aiAnalyzer.suggestNextActions(profile);
  res.json({ success: true, actions });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` AI JOB SEARCH AFRIQUE (SunuJob AI / IvoireJob)`);
  console.log(` Serveur actif sur : http://localhost:${PORT}`);
  console.log(` Répertoire local : ${__dirname}`);
  console.log(`=======================================================`);
});
