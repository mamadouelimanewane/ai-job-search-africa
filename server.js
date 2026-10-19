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
const salaryBenchmark = require('./src/core/salary_benchmark');
const concoursTracker = require('./src/core/concours_tracker');
const companyIntelligence = require('./src/core/company_intelligence');
const diasporaMode = require('./src/core/diaspora_mode');
const referralNetwork = require('./src/core/referral_network');
const whatsappBot = require('./src/core/whatsapp_bot');
const interviewSimulator = require('./src/core/interview_simulator');
const smsHandler = require('./src/core/sms_handler');
// Modules Phase 2 Game-Changer
const scamDetector = require('./src/core/scam_detector');
const payrollCalculator = require('./src/core/payroll_calculator');
const talentPool = require('./src/core/talent_pool');
const portfolioGenerator = require('./src/core/portfolio_generator');
const remoteHub = require('./src/core/remote_hub');
const b2bRecruiter = require('./src/core/b2b_recruiter');
const credentialVault = require('./src/core/credential_vault');
const careerRoadmap = require('./src/core/career_roadmap');
const videoPitch = require('./src/core/video_pitch');
const concoursPrep = require('./src/core/concours_prep');

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

// =================== ROUTES GAME-CHANGER =================== //

// --- 1. BAROMÈTRE SALAIRES FCFA ---
app.get('/api/salary/sectors', (req, res) => {
  res.json({ success: true, sectors: salaryBenchmark.getAllSectors() });
});

app.get('/api/salary/benchmark', (req, res) => {
  const { sector, level, city } = req.query;
  const benchmark = salaryBenchmark.getSalaryBenchmark(sector, level, city);
  res.json({ success: true, benchmark });
});

app.get('/api/salary/overview', (req, res) => {
  res.json({ success: true, overview: salaryBenchmark.getMarketOverview() });
});

app.post('/api/salary/convert-euro', (req, res) => {
  const { amount_eur, city } = req.body;
  const result = salaryBenchmark.convertSalaryEuroToFCFA(parseFloat(amount_eur) || 2500, city);
  res.json({ success: true, conversion: result });
});

// --- 2. CONCOURS & FONCTION PUBLIQUE ---
app.get('/api/concours', (req, res) => {
  const { country, sector, status } = req.query;
  const list = concoursTracker.getActiveCompetitions({ country, sector, status });
  res.json({ success: true, count: list.length, concours: list });
});

app.get('/api/concours/stats', (req, res) => {
  res.json({ success: true, stats: concoursTracker.getStats() });
});

app.get('/api/concours/search', (req, res) => {
  const { q } = req.query;
  res.json({ success: true, concours: concoursTracker.searchConcours(q) });
});

// --- 3. INTELLIGENCE ENTREPRISES ---
app.get('/api/companies', (req, res) => {
  const { country, sector, diasporaOnly } = req.query;
  const list = companyIntelligence.getCompanies({ country, sector, diasporaOnly: diasporaOnly === 'true' });
  res.json({ success: true, count: list.length, companies: list });
});

app.get('/api/companies/:id', (req, res) => {
  const company = companyIntelligence.getCompanyById(req.params.id);
  if (!company) return res.status(404).json({ success: false, error: 'Entreprise introuvable' });
  const reviews = companyIntelligence.getReviews(req.params.id);
  res.json({ success: true, company, reviews });
});

app.post('/api/companies/:id/reviews', (req, res) => {
  const newRev = companyIntelligence.addReview(req.params.id, req.body);
  res.json({ success: true, review: newRev });
});

// --- 4. MODE DIASPORA RETURN ---
app.post('/api/diaspora/convert-salary', (req, res) => {
  const { amount, currency, source_city, target_city } = req.body;
  const result = diasporaMode.convertSalaryToAOF(parseFloat(amount) || 3000, currency, source_city, target_city);
  res.json({ success: true, result });
});

app.post('/api/diaspora/adapt-cv', (req, res) => {
  const profile = req.body.profile || profileManager.getProfile();
  const adaptation = diasporaMode.adaptCVForAOF(profile);
  res.json({ success: true, adaptation });
});

app.get('/api/diaspora/guide', (req, res) => {
  const { country } = req.query;
  res.json({ success: true, guide: diasporaMode.getDiasporaGuide(country) });
});

// --- 5. PISTON DIGITAL (RÉSEAU DE COOPTATION) ---
app.get('/api/referrals', (req, res) => {
  const score = referralNetwork.getReferralScore(req.query.candidate || "Ibrahima Ndiaye");
  res.json({ success: true, ...score });
});

app.post('/api/referrals', (req, res) => {
  const newRef = referralNetwork.addReferral(req.body);
  res.json({ success: true, referral: newRef });
});

// --- 6. WHATSAPP BOT IA ---
app.post('/api/whatsapp/simulate', (req, res) => {
  const { message, from } = req.body;
  const profile = profileManager.getProfile();
  const outcome = whatsappBot.processIncomingMessage(from || "+221770000000", message, profile);
  res.json({ success: true, reply: outcome });
});

app.get('/api/whatsapp/demo-thread', (req, res) => {
  res.json({ success: true, thread: whatsappBot.simulateBotConversation() });
});

// --- 7. SIMULATEUR D'ENTRETIEN IA ---
app.get('/api/interview/personas', (req, res) => {
  res.json({ success: true, personas: interviewSimulator.getPersonas() });
});

app.post('/api/interview/start', (req, res) => {
  const { personaId, jobTitle } = req.body;
  const profile = profileManager.getProfile();
  const session = interviewSimulator.startSession(personaId, profile, jobTitle);
  res.json({ success: true, session });
});

app.post('/api/interview/evaluate', (req, res) => {
  const { question, answer } = req.body;
  const evalResult = interviewSimulator.evaluateAnswer(question, answer);
  res.json({ success: true, evaluation: evalResult });
});

app.post('/api/interview/salary-negotiation', (req, res) => {
  const { desiredSalary, marketRange } = req.body;
  const profile = profileManager.getProfile();
  const sim = interviewSimulator.simulateSalaryNegotiation(desiredSalary, marketRange, profile);
  res.json({ success: true, negotiation: sim });
});

// --- 8. MODE SMS INCLUSION ---
app.post('/api/sms/simulate', (req, res) => {
  const { body, from } = req.body;
  const reply = smsHandler.processIncomingSMS(from || "+221771234567", body);
  res.json({ success: true, ...reply });
});

app.get('/api/sms/help', (req, res) => {
  res.json({ success: true, ...smsHandler.getHelpText() });
});

// --- 9. PARSING D'OFFRES INFORMELLES (FACEBOOK / WHATSAPP) ---
app.post('/api/ai/parse-informal-job', (req, res) => {
  const { rawText } = req.body;
  if (!rawText) return res.status(400).json({ success: false, error: 'Texte d\'offre manquant' });
  const parsed = aiAnalyzer.parseInformalJobPost(rawText);
  res.json({ success: true, ...parsed });
});

// --- 10. VOICE-TO-CV (DICTÉE VOCALE DU PROFIL) ---
app.post('/api/ai/parse-voice-profile', (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ success: false, error: 'Transcription manquante' });
  const parsed = aiAnalyzer.parseVoiceProfile(transcript);
  res.json({ success: true, ...parsed });
});

// =================== ROUTES PHASE 2 GAME-CHANGER =================== //

// --- 1. BOUCLIER ANTI-ARNAQUE ---
app.post('/api/scam/audit', (req, res) => {
  const result = scamDetector.auditJobOfferForScam(req.body.job);
  res.json({ success: true, audit: result });
});

app.post('/api/scam/report', (req, res) => {
  const report = scamDetector.reportScamOffer(req.body);
  res.json({ success: true, report });
});

app.get('/api/scam/recent', (req, res) => {
  res.json({ success: true, reports: scamDetector.getRecentScamReports() });
});

// --- 2. FICHE DE PAIE & CONTRATS UEMOA ---
app.post('/api/payroll/calculate', (req, res) => {
  const { gross, country, isCadre, partsFiscales } = req.body;
  const result = country === "Côte d'Ivoire"
    ? payrollCalculator.calculatePayrollCoteIvoire(gross, { partsFiscales })
    : payrollCalculator.calculatePayrollSenegal(gross, { isCadre, partsFiscales });
  res.json({ success: true, payroll: result });
});

app.post('/api/payroll/gross-from-net', (req, res) => {
  const { netDesired, country, isCadre } = req.body;
  const result = payrollCalculator.calculateGrossFromNet(netDesired, country, isCadre);
  res.json({ success: true, payroll: result });
});

app.post('/api/payroll/contract', (req, res) => {
  const contract = payrollCalculator.generateLegalWorkContract(req.body);
  res.json({ success: true, contract });
});

// --- 3. MATCHING INVERSÉ & TALENT POOL ---
app.get('/api/talent-pool', (req, res) => {
  const { sector, country, min_exp } = req.query;
  const profiles = talentPool.getTalentPoolProfiles({ sector, country, min_exp });
  res.json({ success: true, count: profiles.length, profiles });
});

app.post('/api/talent-pool/unlock', (req, res) => {
  const { profileId, recruiter } = req.body;
  const outcome = talentPool.requestUnlockProfile(profileId, recruiter);
  res.json(outcome);
});

// --- 4. MINI-SITE PRO PUBLIC (/u/:slug) ---
app.get('/u/:slug', (req, res) => {
  const profile = profileManager.getProfile();
  const referrals = referralNetwork.getAllReferrals();
  const html = portfolioGenerator.renderPublicPortfolioHTML(profile, referrals);
  res.send(html);
});

// --- 5. TÉLÉTRAVAIL INTERNATIONAL & FACTURATION ---
app.get('/api/remote/jobs', (req, res) => {
  res.json({ success: true, jobs: remoteHub.getRemoteJobs() });
});

app.post('/api/remote/invoice', (req, res) => {
  const invoice = remoteHub.generateInternationalInvoice(req.body);
  res.json({ success: true, invoice });
});

// --- 6. PORTAIL RECRUTEUR B2B (SHORTLIST IA 10S) ---
app.post('/api/b2b/shortlist', (req, res) => {
  const shortlist = b2bRecruiter.generateAIShortlist(req.body);
  res.json({ success: true, ...shortlist });
});

// --- 7. COFFRE-FORT NUMÉRIQUE & DIPLÔMES VÉRIFIÉS ---
app.get('/api/credentials', (req, res) => {
  const creds = credentialVault.getCandidateCredentials(req.query.candidate);
  res.json({ success: true, credentials: creds });
});

app.post('/api/credentials/register', (req, res) => {
  const registered = credentialVault.registerNewCredential(req.body);
  res.json({ success: true, credential: registered });
});

app.get('/verify/:id', (req, res) => {
  const outcome = credentialVault.verifyCredentialByHashOrId(req.params.id);
  if (!outcome.valid) {
    return res.status(404).send(`<h1>Authenticité Non Reconnue</h1><p>${outcome.message}</p>`);
  }
  const c = outcome.credential;
  res.send(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Vérification Officielle Diplôme | SunuJob AI</title>
<style>body{font-family:sans-serif;background:#091310;color:#f8fafc;display:flex;justify-content:center;padding:40px 16px;}
.box{background:#11221c;border:2px solid #10b981;border-radius:16px;padding:32px;max-width:600px;width:100%;text-align:center;}
.seal{font-size:3rem;margin-bottom:12px;}h1{color:#10b981;font-size:1.5rem;margin-bottom:14px;}
.hash{word-break:break-all;font-family:monospace;background:rgba(0,0,0,0.4);padding:10px;border-radius:8px;font-size:0.8rem;color:#86efac;margin:16px 0;}
</style></head>
<body><div class="box"><div class="seal">🛡️</div><h1>Diplôme Certifié Authentique</h1>
<p style="font-size:1.1rem;font-weight:700;margin-bottom:6px;">${c.title}</p>
<p style="color:#fbbf24;margin-bottom:12px;">Délivré à : <strong>${c.candidate_name}</strong> par <strong>${c.institution}</strong> (${c.graduation_year})</p>
<div class="hash">Hash SHA-256 : ${c.verification_hash}</div>
<p style="font-size:0.85rem;color:#94a3b8;">${c.verified_by} · Horodatage : ${c.verified_at}</p>
<p style="margin-top:20px;"><a href="/" style="color:#10b981;text-decoration:none;font-weight:700;">← Retour à SunuJob AI</a></p>
</div></body></html>`);
});

// --- 8. MENTOR CARRIÈRE IA (ROADMAP 3 ANS) ---
app.post('/api/career/roadmap', (req, res) => {
  const { currentRole, currentSalary, targetRole, targetSalary, sector, city } = req.body;
  const roadmap = careerRoadmap.generateCareerRoadmap(currentRole, currentSalary, targetRole, targetSalary, sector, city);
  res.json({ success: true, ...roadmap });
});

// --- 9. VIDÉO PITCH 30S ---
app.post('/api/video-pitch/generate', (req, res) => {
  const profile = req.body.profile || profileManager.getProfile();
  const script = videoPitch.generate30SecVideoScript(profile);
  res.json({ success: true, ...script });
});

// --- 10. PRÉPARATION CONCOURS (QCM QUOTIDIEN) ---
app.get('/api/concours-prep/quiz', (req, res) => {
  res.json({ success: true, quiz: concoursPrep.getDailyQuiz() });
});

app.post('/api/concours-prep/submit', (req, res) => {
  const evaluation = concoursPrep.evaluateQuizSubmission(req.body.answers || {});
  res.json({ success: true, evaluation });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` AI JOB SEARCH AFRIQUE (SunuJob AI / IvoireJob)`);
  console.log(` Serveur actif sur : http://localhost:${PORT}`);
  console.log(` Répertoire local : ${__dirname}`);
  console.log(`=======================================================`);
});
