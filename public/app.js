/**
 * Application Client — SunuJob AI (ai-job-search-africa)
 * Interface complète avec gestion des vues, multi-agents, matching et Mobile Money
 */

let state = {
  currentProfile: null,
  sampleProfiles: [],
  jobs: [],
  sources: [],
  credits: null,
  packs: [],
  selectedJob: null,
  currentGeneration: null,
  activeStudioTab: 'cv',
  selectedPackId: 'pack_starter',
  selectedOperator: 'wave'
};

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(e => console.log('SW register error', e));
  }
});

async function initApp() {
  await Promise.all([
    fetchProfile(),
    fetchSampleProfiles(),
    fetchCredits(),
    fetchJobs(),
    fetchSources()
  ]);
}

// ==================== NAVIGATION ENTRE LES VUES ==================== //

function switchNavView(view) {
  const views = ['feed', 'profile', 'custom', 'pricing', 'aggregator', 'salary', 'concours', 'companies', 'diaspora', 'network', 'bot', 'interview'];
  
  views.forEach(v => {
    const elId = 'view' + v.charAt(0).toUpperCase() + v.slice(1);
    const el = document.getElementById(elId);
    if (el) el.style.display = (view === v) ? 'block' : 'none';

    const btnId = 'nav' + v.charAt(0).toUpperCase() + v.slice(1) + 'Btn';
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.toggle('active', view === v);
  });

  // Ajuster la visibilité du banner héro (visible uniquement sur feed)
  const heroBanner = document.getElementById('heroBanner');
  if (heroBanner) heroBanner.style.display = (view === 'feed') ? 'block' : 'none';

  // Chargement des données à la demande
  if (view === 'salary') loadSalaryBenchmark();
  if (view === 'concours') loadConcoursList();
  if (view === 'companies') loadCompaniesList();
  if (view === 'diaspora') convertDiasporaSalary();
  if (view === 'network') loadReferralsNetwork();
  if (view === 'bot') initWhatsAppChat();
  if (view === 'interview') initInterviewView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==================== GESTION DU PROFIL ==================== //

async function fetchProfile() {
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (data.success && data.profile) {
      state.currentProfile = data.profile;
      renderSidebarProfile(data.profile);
      populateProfileForm(data.profile);
    }
  } catch (err) {
    console.error('Erreur fetchProfile:', err);
  }
}

function renderSidebarProfile(p) {
  document.getElementById('sideName').textContent = p.name || 'Candidat';
  document.getElementById('sideTitle').textContent = p.title || 'Professionnel';
  document.getElementById('sideAvatar').textContent = (p.name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2);
  document.getElementById('sideCity').textContent = `📍 ${p.district ? p.district + ', ' : ''}${p.city || ''}`;
  document.getElementById('sideDegree').textContent = `🎓 ${p.education || 'Diplôme'}`;
  document.getElementById('sideSalary').textContent = `💰 ${p.salary_expectation || 'À négocier'}`;

  const skillsBox = document.getElementById('sideSkillsList');
  skillsBox.innerHTML = '';
  (p.skills || []).slice(0, 8).forEach(skill => {
    const s = document.createElement('span');
    s.className = 'skill-chip';
    s.textContent = skill;
    skillsBox.appendChild(s);
  });
}

function populateProfileForm(p) {
  document.getElementById('formName').value = p.name || '';
  document.getElementById('formTitle').value = p.title || '';
  document.getElementById('formPhone').value = p.phone || '';
  document.getElementById('formEmail').value = p.email || '';
  document.getElementById('formCountry').value = p.country || 'Sénégal';
  document.getElementById('formCity').value = `${p.district ? p.district + ', ' : ''}${p.city || ''}`;
  document.getElementById('formEducation').value = p.education || '';
  document.getElementById('formYearsExp').value = p.years_of_experience || 3;
  document.getElementById('formSalary').value = p.salary_expectation || '';
  document.getElementById('formLanguages').value = (p.languages || []).join(', ');
  document.getElementById('formSkills').value = (p.skills || []).join(', ');
  document.getElementById('formSummary').value = p.summary || '';
}

async function saveProfileChanges() {
  const updated = {
    name: document.getElementById('formName').value.trim(),
    title: document.getElementById('formTitle').value.trim(),
    phone: document.getElementById('formPhone').value.trim(),
    email: document.getElementById('formEmail').value.trim(),
    country: document.getElementById('formCountry').value,
    city: document.getElementById('formCity').value.trim(),
    education: document.getElementById('formEducation').value.trim(),
    years_of_experience: parseInt(document.getElementById('formYearsExp').value) || 0,
    salary_expectation: document.getElementById('formSalary').value.trim(),
    languages: document.getElementById('formLanguages').value.split(',').map(s => s.trim()).filter(Boolean),
    skills: document.getElementById('formSkills').value.split(',').map(s => s.trim()).filter(Boolean),
    summary: document.getElementById('formSummary').value.trim(),
    experiences: (state.currentProfile && state.currentProfile.experiences) || []
  };

  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    if (data.success) {
      state.currentProfile = data.profile;
      renderSidebarProfile(data.profile);
      alert('✅ Profil candidat mis à jour avec succès !');
      switchNavView('feed');
    }
  } catch (err) {
    alert('Erreur lors de la sauvegarde du profil.');
  }
}

async function fetchSampleProfiles() {
  try {
    const res = await fetch('/api/profile/samples');
    const data = await res.json();
    if (data.success) {
      state.sampleProfiles = data.samples;
      const select = document.getElementById('sideSampleSelect');
      data.samples.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.title} - ${s.city})`;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

async function switchDemoProfile(sampleId) {
  if (!sampleId) return;
  try {
    const res = await fetch('/api/profile/select-sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sampleId })
    });
    const data = await res.json();
    if (data.success) {
      state.currentProfile = data.profile;
      renderSidebarProfile(data.profile);
      populateProfileForm(data.profile);
      await fetchJobs(); // Recalculer les scores
    }
  } catch (err) {
    alert('Erreur lors du chargement du profil exemple.');
  }
}

// ==================== GESTION DES CREDITS & TARIFS ==================== //

async function fetchCredits() {
  try {
    const res = await fetch('/api/credits');
    const data = await res.json();
    if (data.success) {
      state.credits = data.credits;
      state.packs = data.packs;

      const navEl = document.getElementById('navCreditsCount');
      if (data.credits.total_available > 0) {
        navEl.textContent = `${data.credits.total_available} crédit${data.credits.total_available > 1 ? 's' : ''}`;
      } else {
        navEl.textContent = `0 crédit`;
      }

      renderPricingView(data.packs);
      renderMiniPacks(data.packs);
    }
  } catch (err) {
    console.error(err);
  }
}

function renderPricingView(packs) {
  const container = document.getElementById('pricingCards');
  container.innerHTML = '';

  packs.forEach((pack, idx) => {
    const isPro = pack.id === 'pack_intensif';
    const card = document.createElement('div');
    card.className = `price-box ${isPro ? 'featured' : ''}`;
    card.innerHTML = `
      ${isPro ? '<span class="featured-ribbon">⭐ Plus Populaire</span>' : ''}
      <h3 class="price-box-title">${pack.name}</h3>
      <div class="price-amount">${pack.price_fcfa.toLocaleString()} FCFA</div>
      <p class="price-desc">${pack.description}</p>
      <ul class="price-features-list">
        <li><strong>${pack.applications_count} candidatures</strong> sur-mesure</li>
        <li>Double agent (Rédacteur ATS + DRH Critique)</li>
        <li>Format PDF propre & téléchargeable</li>
        <li>${pack.bonus_coach ? '<strong>Coach d\'entretien IA inclus</strong>' : 'Accès aux questions types'}</li>
        <li>Paiement Wave, Orange Money ou MTN MoMo</li>
      </ul>
      <button class="btn-primary" style="width:100%; justify-content:center; margin-top:auto;" onclick="openPaymentForPack('${pack.id}')">
        Recharger via Wave / OM
      </button>
    `;
    container.appendChild(card);
  });
}

function renderMiniPacks(packs) {
  const container = document.getElementById('miniPacksList');
  container.innerHTML = '';

  packs.forEach(pack => {
    const item = document.createElement('div');
    item.className = `mini-pack-item ${pack.id === state.selectedPackId ? 'active' : ''}`;
    item.onclick = () => {
      state.selectedPackId = pack.id;
      document.querySelectorAll('.mini-pack-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    };
    item.innerHTML = `
      <div>
        <strong>${pack.name}</strong> (${pack.applications_count} candidatures)
        <div style="font-size:0.75rem; color:var(--text-muted);">${pack.description}</div>
      </div>
      <strong style="color:var(--primary); font-size:1.05rem;">${pack.price_fcfa.toLocaleString()} FCFA</strong>
    `;
    container.appendChild(item);
  });
}

function openPaymentForPack(packId) {
  state.selectedPackId = packId;
  renderMiniPacks(state.packs);
  openPayModal();
}

// ==================== FEED DES OFFRES ==================== //

async function fetchJobs(q = '', country = '', contract = '') {
  try {
    const url = new URL('/api/jobs', window.location.origin);
    if (q) url.searchParams.set('q', q);
    if (country) url.searchParams.set('country', country);
    if (contract) url.searchParams.set('contract', contract);

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      state.jobs = data.jobs;
      renderJobsGrid(data.jobs);
    }
  } catch (err) {
    console.error(err);
  }
}

function handleSearch() {
  const q = document.getElementById('searchInput').value;
  const country = document.getElementById('countryFilter').value;
  const contract = document.getElementById('contractFilter').value;
  fetchJobs(q, country, contract);
}

function quickFilter(term) {
  document.getElementById('searchInput').value = term;
  handleSearch();
}

function renderJobsGrid(jobs) {
  const container = document.getElementById('jobsGrid');
  container.innerHTML = '';

  if (jobs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:48px; background:white; border-radius:16px; border:1px solid var(--border);">
        <p style="font-size:1.1rem; font-weight:700; color:var(--text-main);">Aucune offre d'emploi ne correspond à vos filtres.</p>
        <p style="color:var(--text-muted); font-size:0.88rem; margin-top:6px;">Essayez d'élargir votre recherche ou collez directement une offre libre.</p>
      </div>
    `;
    return;
  }

  jobs.forEach(job => {
    const isSn = job.country.toLowerCase().includes('sénégal');
    const flag = isSn ? '🇸🇳' : '🇨🇮';
    const badgeClass = isSn ? 'badge-sn' : 'badge-ci';

    const card = document.createElement('article');
    card.className = 'job-card';
    card.innerHTML = `
      <div class="job-top-bar">
        <div>
          <h3 class="job-main-title">${job.title}</h3>
          <div class="job-company-line">${job.company} — <span class="job-location-link">📍 ${job.district || job.city}</span></div>
        </div>
        <span class="country-flag-badge ${badgeClass}">${flag} ${job.country}</span>
      </div>

      <div class="job-meta-pills">
        <span class="meta-pill pill-contract">📄 ${job.contract}</span>
        <span class="meta-pill pill-salary">💰 ${job.salary_range}</span>
        <span class="meta-pill pill-deadline">⏳ Clôture : ${job.deadline}</span>
      </div>

      <p class="job-summary-text">${job.description}</p>

      <!-- Tiroir de matching calculé -->
      <div id="drawer-${job.id}" class="match-drawer" style="display:none;"></div>

      <div class="job-cta-bar">
        <button class="btn-secondary" onclick="scanMatching('${job.id}')">
          ⚡ Scanner Compatibilité IA
        </button>
        <button class="btn-primary" onclick="openStudioForJob('${job.id}')">
          🚀 Générer Candidature Sur-Mesure
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ==================== SCANNER DE MATCHING IA ==================== //

async function scanMatching(jobId) {
  const drawer = document.getElementById(`drawer-${jobId}`);
  drawer.style.display = 'block';
  drawer.innerHTML = `<em>Analyse sémantique par l'IA en cours...</em>`;

  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    const data = await res.json();
    if (data.success) {
      const m = data.match;
      let gaugeClass = 'gauge-high';
      if (m.score < 60) gaugeClass = 'gauge-low';
      else if (m.score < 80) gaugeClass = 'gauge-medium';

      drawer.innerHTML = `
        <div class="match-header-row">
          <div class="match-gauge ${gaugeClass}">
            <span>🎯 Score d'Adéquation : ${m.score} %</span>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">
            ${m.location_match ? '✅ Même ville' : 'ℹ️ Mobilité à préciser'}
          </span>
        </div>
        <p style="font-weight:700; font-size:0.85rem; margin-bottom:6px; color:#1e293b;">${m.verdict}</p>
        <div class="match-details-text">
          <strong>Points forts du candidat :</strong> ${m.matching_skills.join(', ') || 'Bases solides'}<br>
          ${m.missing_skills.length ? `<strong>Compétences à valoriser dans la lettre :</strong> ${m.missing_skills.join(', ')}` : ''}
        </div>
      `;
    }
  } catch (err) {
    drawer.innerHTML = `<span style="color:red;">Erreur lors du calcul d'adéquation.</span>`;
  }
}

// ==================== STUDIO MULTI-AGENTS ==================== //

async function openStudioForJob(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;

  state.selectedJob = job;
  document.getElementById('studioJobHeading').textContent = job.title;
  document.getElementById('studioJobSub').textContent = `${job.company} — ${job.city}, ${job.country}`;

  // Réinitialiser les moniteurs
  document.getElementById('mAgent1Text').textContent = "Agent 1 : Analyse des compétences clés et alignement sur l'offre...";
  document.getElementById('mCriticScore').textContent = "...";
  document.getElementById('mAgent2Text').textContent = "Agent 2 : En attente du premier jet pour critique...";
  document.getElementById('cvRenderPaper').textContent = "Génération du CV sur-mesure en cours...";
  document.getElementById('letterRenderPaper').textContent = "Rédaction de la lettre ciblée en cours...";

  document.getElementById('studioModal').style.display = 'flex';

  try {
    const res = await fetch('/api/generate-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    const data = await res.json();

    if (!data.success) {
      if (data.error === 'CREDITS_EXHAUSTED') {
        closeStudioModal();
        openPayModal();
        alert(data.message);
        return;
      }
      alert('Erreur : ' + data.error);
      return;
    }

    state.currentGeneration = data.result;
    await fetchCredits(); // Actualiser solde

    // Mettre à jour le visualiseur du double agent
    const review = data.result.pipeline_execution.agent_2_review;
    document.getElementById('mAgent1Text').textContent = "Agent 1 : Dossier révisé et optimisé suite aux remarques du recruteur.";
    document.getElementById('mCriticScore').textContent = review.score_critique;
    document.getElementById('mAgent2Text').innerHTML = `<em>« ${review.verdict_drh} »</em> — <strong>${review.mention}</strong>`;

    // Affichage du CV
    const cv = data.result.final_output.tailored_cv;
    document.getElementById('cvRenderPaper').innerHTML = `
      <div style="border-bottom: 2px solid var(--primary); padding-bottom: 12px; margin-bottom: 16px;">
        <h1 style="font-size: 1.6rem; color: var(--primary); font-weight:800; font-family:'Space Grotesk',sans-serif;">${cv.header.name}</h1>
        <div style="font-size: 1.1rem; font-weight:700; color:#334155;">${cv.header.targeted_title}</div>
        <div style="font-size: 0.85rem; color:var(--text-muted); margin-top:2px;">📍 ${cv.header.location} | 📞 ${cv.header.contact}</div>
      </div>

      <div style="background:#ecfdf5; border-left:4px solid var(--success); padding:8px 12px; font-size:0.82rem; font-weight:700; color:var(--primary); margin-bottom:16px;">
        🛡️ ${cv.verif_drh_badge}
      </div>

      <div style="font-size: 0.92rem; font-style: italic; color:#1e293b; margin-bottom: 18px; line-height:1.6;">
        ${cv.profile_pitch}
      </div>

      <div style="margin-bottom: 18px;">
        <strong style="color:var(--primary-dark); font-size:0.88rem; text-transform:uppercase; letter-spacing:0.5px;">Expériences Professionnelles Spécifiques :</strong>
        <div style="margin-top:10px;">
          ${(cv.targeted_experiences || []).map(exp => `
            <div style="margin-bottom: 14px;">
              <div style="font-weight:800; font-size:0.95rem;">${exp.role} — <span style="color:var(--text-muted); font-weight:600;">${exp.company}</span> <small style="color:#64748b;">(${exp.period})</small></div>
              <ul style="margin-left: 20px; font-size: 0.88rem; margin-top: 4px; color:#334155;">
                ${exp.key_achievements.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <strong style="color:var(--primary-dark); font-size:0.88rem; text-transform:uppercase; letter-spacing:0.5px;">Diplômes & Formations :</strong>
        <p style="font-size:0.88rem; color:#334155; margin-top:4px;">${cv.education}</p>
      </div>
    `;

    // Affichage Lettre
    document.getElementById('letterRenderPaper').textContent = data.result.final_output.tailored_cover_letter;

    // Charger questions coach
    loadCoachQuestions(jobId);

  } catch (err) {
    console.error(err);
    alert('Erreur serveur lors de la génération.');
  }
}

async function loadCoachQuestions(jobId) {
  try {
    const res = await fetch('/api/interview-prep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    const data = await res.json();
    if (data.success && data.prep) {
      const container = document.getElementById('coachQuestionsList');
      container.innerHTML = `
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">
          5 questions clés sélectionnées pour <strong>${data.prep.company}</strong> à ${data.prep.location} :
        </p>
      `;

      data.prep.questions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'coach-q-card';
        item.innerHTML = `
          <div class="coach-q-category">Q${idx + 1} • ${q.category}</div>
          <div class="coach-q-title">${q.question}</div>
          <div class="coach-q-tip">💡 <strong>Conseil Stratégique :</strong> ${q.strategic_tip}</div>
          <div class="coach-q-answer">🎯 <strong>Modèle de réponse conseillé :</strong> "${q.sample_answer}"</div>
        `;
        container.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function setStudioTab(tab) {
  state.activeStudioTab = tab;
  document.getElementById('tabBtnCv').classList.toggle('active', tab === 'cv');
  document.getElementById('tabBtnLetter').classList.toggle('active', tab === 'letter');
  document.getElementById('tabBtnCoach').classList.toggle('active', tab === 'coach');

  document.getElementById('studioTabCv').style.display = tab === 'cv' ? 'block' : 'none';
  document.getElementById('studioTabLetter').style.display = tab === 'letter' ? 'block' : 'none';
  document.getElementById('studioTabCoach').style.display = tab === 'coach' ? 'block' : 'none';
}

function closeStudioModal() {
  document.getElementById('studioModal').style.display = 'none';
}

// ==================== ACTIONS 1-CLIC HUMAN-IN-THE-LOOP ==================== //

function triggerWhatsAppApply() {
  if (!state.selectedJob || !state.currentGeneration) return;
  const rawPhone = (state.selectedJob.contact_whatsapp || '').replace(/[^0-9]/g, '');
  const pitch = encodeURIComponent(state.currentGeneration.final_output.whatsapp_pitch);

  if (rawPhone) {
    window.open(`https://wa.me/${rawPhone}?text=${pitch}`, '_blank');
  } else {
    window.open(`https://wa.me/?text=${pitch}`, '_blank');
  }
}

function triggerEmailApply() {
  if (!state.selectedJob || !state.currentGeneration) return;
  const email = state.selectedJob.contact_email || '';
  const subject = encodeURIComponent(state.currentGeneration.final_output.suggested_email_subject);
  const body = encodeURIComponent(state.currentGeneration.final_output.tailored_cover_letter);

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

function copyDocumentText() {
  if (!state.currentGeneration) return;
  let text = '';
  if (state.activeStudioTab === 'letter') {
    text = state.currentGeneration.final_output.tailored_cover_letter;
  } else {
    const cv = state.currentGeneration.final_output.tailored_cv;
    text = `${cv.header.name}\n${cv.header.targeted_title}\n${cv.header.location} | ${cv.header.contact}\n\n${cv.profile_pitch}\n\nEXPERIENCES :\n` +
      cv.targeted_experiences.map(e => `${e.role} - ${e.company} (${e.period})\n` + e.key_achievements.map(a => `• ${a}`).join('\n')).join('\n\n') +
      `\n\nFORMATION :\n${cv.education}`;
  }

  navigator.clipboard.writeText(text).then(() => {
    alert('📋 Texte copié dans le presse-papier !');
  }).catch(() => {
    alert('Veuillez copier manuellement le texte sélectionné.');
  });
}

// ==================== AJOUT D'UNE OFFRE LIBRE ==================== //

async function handleCustomJobSubmit() {
  const title = document.getElementById('cJobTitle').value.trim();
  const company = document.getElementById('cJobCompany').value.trim();
  const country = document.getElementById('cJobCountry').value;
  const city = document.getElementById('cJobCity').value.trim();
  const description = document.getElementById('cJobDescription').value.trim();
  const contact_email = document.getElementById('cJobEmail').value.trim();
  const contact_whatsapp = document.getElementById('cJobWhatsapp').value.trim();

  if (!title || !description) {
    alert('Veuillez renseigner au moins le titre du poste et le texte de l\'offre.');
    return;
  }

  try {
    const res = await fetch('/api/jobs/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, company, country, city, description, contact_email, contact_whatsapp
      })
    });
    const data = await res.json();
    if (data.success) {
      alert('🎉 Offre enregistrée ! Redirection vers le studio de candidature...');
      await fetchJobs();
      switchNavView('feed');
      openStudioForJob(data.job.id);
    }
  } catch (err) {
    alert('Erreur lors de l\'enregistrement de l\'offre.');
  }
}

// ==================== MODAL PAIEMENT MOBILE MONEY ==================== //

function openPaymentModal() {
  openPayModal();
}

function openPayModal() {
  document.getElementById('payModal').style.display = 'flex';
}

function closePayModal() {
  document.getElementById('payModal').style.display = 'none';
}

function setOperator(op) {
  state.selectedOperator = op;
  document.getElementById('opWave').classList.toggle('active', op === 'wave');
  document.getElementById('opOM').classList.toggle('active', op === 'orange_money');
  document.getElementById('opMTN').classList.toggle('active', op === 'mtn_momo');
}

async function confirmMobileMoneyPayment() {
  const phone = document.getElementById('payPhoneNumber').value.trim();
  if (!phone) {
    alert('Veuillez saisir votre numéro Mobile Money.');
    return;
  }

  try {
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packId: state.selectedPackId,
        method: state.selectedOperator,
        phone: phone
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`✅ Paiement Mobile Money validé avec succès (${data.transaction.amount_fcfa.toLocaleString()} FCFA via ${data.transaction.method.toUpperCase()}).\nVotre nouveau solde est de : ${data.new_balance} candidatures.`);
      closePayModal();
      await fetchCredits();
    } else {
      alert('Erreur paiement : ' + data.error);
    }
  } catch (err) {
    alert('Erreur réseau lors de la transaction.');
  }
}

// ==================== AGRÉGATEUR RADAR WEB ==================== //

async function fetchSources() {
  try {
    const res = await fetch('/api/aggregator/sites');
    const data = await res.json();
    const sources = data.sites || data.sources || [];
    state.sources = sources;
    renderSourcesGrid(sources);
    const badge = document.getElementById('sourcesCountBadge');
    if (badge) badge.textContent = sources.length + ' sources actives';
  } catch (err) {
    console.warn('Erreur chargement sources:', err);
  }
}

function renderSourcesGrid(sources) {
  const container = document.getElementById('sourcesGridContainer');
  if (!container) return;

  if (!sources || sources.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">
        <div style="font-size:2.5rem;">🌐</div>
        <p>Aucune source trouvée. Modifiez le filtre ou lancez un scan.</p>
      </div>`;
    return;
  }

  const flagMap = {
    SN:'🇸🇳', CI:'🇨🇮', BJ:'🇧🇯', TG:'🇹🇬',
    ML:'🇲🇱', BF:'🇧🇫', GN:'🇬🇳', NE:'🇳🇪',
    GH:'🇬🇭', NG:'🇳🇬', MR:'🇲🇷', ALL:'🌍'
  };

  container.innerHTML = sources.map(src => {
    const flag = flagMap[src.country] || '🌍';
    const statusClass = src.status === 'active' ? 'status-active' : 'status-inactive';
    const statusLabel = src.status === 'active' ? '✅ Actif' : '⚠️ Inactif';
    const typeLabel = src.type === 'job_board' ? 'Job Board'
      : src.type === 'company' ? 'Entreprise' : 'Gouvernement';
    return `
      <div class="source-card">
        <div class="source-card-header">
          <span class="source-flag">${flag}</span>
          <span class="source-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="source-card-body">
          <h4 class="source-name">${src.name}</h4>
          <p class="source-country">${src.city || ''} — ${src.country}</p>
          <span class="source-type-badge">${typeLabel}</span>
        </div>
        <div class="source-card-footer">
          <a href="${src.url}" target="_blank" rel="noopener" class="source-link-btn">🔗 Visiter</a>
          <span class="source-jobs-count">${src.last_scan_count || 0} offres</span>
        </div>
      </div>`;
  }).join('');
}

function filterSourcesByCountry(country) {
  if (!state.sources) return;
  const list = (!country || country === 'ALL')
    ? state.sources
    : state.sources.filter(s => s.country === country);
  renderSourcesGrid(list);
}

async function triggerLiveWebScan() {
  const query   = (document.getElementById('scanQueryInput')?.value || '').trim();
  const country = document.getElementById('scanCountrySelect')?.value || 'ALL';
  const logEl   = document.getElementById('scanLogContent');
  const reportBanner = document.getElementById('scanReportBanner');
  const btn     = document.getElementById('startScanBtn');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Scan en cours…'; }
  if (logEl) { logEl.innerHTML = ''; logEl.parentElement?.classList.remove('hidden'); }
  if (reportBanner) reportBanner.classList.add('hidden');

  const addLog = (msg, type = 'info') => {
    if (!logEl) return;
    const colors = { info:'#64b5f6', success:'#81c784', warn:'#ffb74d', error:'#e57373' };
    const line = document.createElement('div');
    line.style.color = colors[type] || '#ccc';
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  };

  addLog('🚀 Initialisation du radar web ouest-africain…');
  addLog(`🔍 Requête : "${query || 'toutes offres'}" — Pays : ${country}`);

  try {
    addLog('📡 Connexion aux sources répertoriées…');
    const res = await fetch('/api/aggregator/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, country })
    });
    const data = await res.json();

    if (data.success) {
      const found = data.new_offers_ingested ?? data.new_jobs_found ?? 0;
      const scanned = data.sources_scanned ?? 0;
      addLog(`✅ Scan terminé ! ${found} nouvelles offres détectées.`, 'success');
      addLog(`📊 Sources scannées : ${scanned} | Durée : ${data.execution_time_ms || data.duration_ms || 0}ms`);
      if (data.scan_logs) data.scan_logs.forEach(l => addLog(l));

      if (reportBanner) {
        reportBanner.classList.remove('hidden');
        reportBanner.innerHTML = `
          <div style="background:rgba(76,175,80,0.15);border:1px solid #4caf50;border-radius:12px;padding:20px;margin-top:16px;">
            <h4 style="color:#81c784;margin:0 0 8px;">✅ Scan terminé avec succès</h4>
            <p style="margin:4px 0;">📌 <strong>${found}</strong> nouvelles offres ajoutées au feed</p>
            <p style="margin:4px 0;">🌐 <strong>${scanned}</strong> sources analysées</p>
            <p style="margin:4px 0;font-size:0.85rem;color:#aaa;">Dernière analyse : ${new Date().toLocaleString('fr-FR')}</p>
          </div>`;
      }
      await fetchJobs();
      await fetchSources();
    } else {
      addLog('❌ Erreur scan : ' + (data.error || 'inconnue'), 'error');
    }
  } catch (err) {
    addLog('❌ Erreur réseau : ' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🛰️ Lancer le Scan'; }
  }
}

function openAddSourceModal() {
  document.getElementById('addSourceModal')?.classList.remove('hidden');
}

function closeAddSourceModal() {
  document.getElementById('addSourceModal')?.classList.add('hidden');
  ['newSiteName','newSiteUrl','newSiteCountry','newSiteCity','newSiteType']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

async function submitNewSource() {
  const name    = document.getElementById('newSiteName')?.value.trim();
  const url     = document.getElementById('newSiteUrl')?.value.trim();
  const country = document.getElementById('newSiteCountry')?.value;
  const city    = document.getElementById('newSiteCity')?.value.trim();
  const type    = document.getElementById('newSiteType')?.value || 'job_board';

  if (!name || !url || !country) {
    alert('Veuillez remplir au moins le nom, l\'URL et le pays.');
    return;
  }
  try {
    const res = await fetch('/api/aggregator/add-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, country, city, type })
    });
    const data = await res.json();
    if (data.success) {
      alert(`✅ Source "${name}" ajoutée avec succès !`);
      closeAddSourceModal();
      await fetchSources();
    } else {
      alert('Erreur : ' + (data.error || 'impossible d\'ajouter la source.'));
    }
  } catch (err) {
    alert('Erreur réseau. Veuillez réessayer.');
  }
}

// ==================== PANNEAU IA — INTELLIGENCE DU MARCHÉ ==================== //

// Stockage local de la dernière analyse
state.aiTrends = null;
state.aiReport = null;
state.aiSmartQuery = null;

async function runAIMarketAnalysis() {
  const btn = document.getElementById('btnAIAnalysis');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Analyse…'; btn.classList.add('btn-ai-active'); }

  try {
    const res = await fetch('/api/ai/market-trends');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur analyse');

    const trends = data.trends;
    state.aiTrends = trends;

    // Masquer placeholder
    document.getElementById('aiPlaceholder')?.style.setProperty('display','none');

    // Afficher KPI bar
    const kpiBar = document.getElementById('aiKpiBar');
    if (kpiBar) kpiBar.style.display = 'grid';
    setText('kpiHeatValue', `${trends.market_heat_score}/100`);
    setText('kpiSectorValue', trends.top_sectors[0]?.key || '—');
    setText('kpiSkillValue',  trends.top_skills_in_demand[0]?.key || '—');
    setText('kpiCityValue',   trends.top_cities[0]?.key || '—');
    setText('kpiJobsValue',   trends.total_jobs_analyzed);

    // Afficher barres secteurs
    renderSectorBars(trends.top_sectors);

    // Afficher skill tags
    renderSkillTags(trends.top_skills_in_demand);

    document.getElementById('aiTrendsPanel')?.style.setProperty('display','block');

  } catch (err) {
    alert('Erreur analyse IA : ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📊 Analyser le Marché'; btn.classList.remove('btn-ai-active'); }
  }
}

async function runAIInsightReport() {
  const btn = document.getElementById('btnInsightReport');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Génération…'; btn.classList.add('btn-ai-active'); }

  try {
    const res = await fetch('/api/ai/insight-report');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur rapport');

    const report = data.report;
    state.aiReport = report;

    document.getElementById('aiPlaceholder')?.style.setProperty('display','none');

    // D'abord, lancer l'analyse marché si pas déjà faite
    if (!state.aiTrends) await runAIMarketAnalysis();

    // Rendre le rapport narratif
    const panel = document.getElementById('aiInsightReportPanel');
    const content = document.getElementById('aiReportContent');
    if (panel && content) {
      panel.style.display = 'block';
      content.innerHTML = `
        <h4 style="font-family:'Space Grotesk',sans-serif;font-size:1.15rem;color:var(--accent);margin:0 0 14px;">
          ${report.title}
        </h4>
        <p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 10px;">📅 ${report.date}</p>
        <div class="ai-report-headline">${report.headline}</div>
        <h5 style="color:var(--text-main);margin:0 0 8px;font-size:0.9rem;">Points clés :</h5>
        <ul class="ai-report-insights">
          ${(report.key_insights || []).map(i => `<li>${i.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</li>`).join('')}
        </ul>
        <div class="ai-report-recommendation">
          💡 Recommandation IA : ${report.recommendation}
        </div>`;
    }

  } catch (err) {
    alert('Erreur génération rapport : ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🧠 Rapport IA Complet'; btn.classList.remove('btn-ai-active'); }
  }
}

async function runAISmartQuery() {
  const btn = document.getElementById('btnSmartQuery');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Génération…'; }

  try {
    const profile = state.currentProfile;
    const res = await fetch('/api/ai/smart-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur requête');

    const q = data.query;
    state.aiSmartQuery = q;

    document.getElementById('aiPlaceholder')?.style.setProperty('display','none');

    const panel  = document.getElementById('aiSmartQueryPanel');
    const result = document.getElementById('aiSmartQueryResult');
    if (panel && result) {
      panel.style.display = 'block';
      result.innerHTML = `
        <div style="color:var(--accent);font-weight:700;margin-bottom:6px;">🔍 "${q.primary_query || 'emploi Afrique Ouest'}"</div>
        ${q.alternative_queries && q.alternative_queries.length > 0 ?
          `<div style="font-size:0.82rem;color:var(--text-muted);margin-top:6px;">
            Alternatives : ${q.alternative_queries.map(alt => `<span class="ai-skill-tag">${alt}</span>`).join('')}
          </div>` : ''}
        ${q.explanation && q.explanation.length > 0 ?
          `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:8px;border-top:1px solid var(--border);padding-top:6px;">
            ${q.explanation.map(e => `• ${e}`).join('<br>')}
          </div>` : ''}`;
    }
  } catch (err) {
    alert('Erreur requête IA : ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔍 Requête Intelligente'; }
  }
}

function applySuggestedQuery() {
  if (!state.aiSmartQuery) return;
  const query = state.aiSmartQuery.primary_query;
  const input = document.getElementById('scanQueryInput');
  if (input) {
    input.value = query;
    input.focus();
    // Scroll vers le haut du formulaire de scan
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ─── Renderers ───────────────────────────────────────────────────────────────

function renderSectorBars(sectors) {
  const container = document.getElementById('aiSectorBars');
  if (!container || !sectors) return;
  const max = sectors[0]?.count || 1;
  container.innerHTML = sectors.map(s => {
    const pct = Math.round((s.count / max) * 100);
    return `
      <div class="ai-trend-bar-row">
        <span class="ai-trend-label" title="${s.key}">${s.key}</span>
        <div class="ai-trend-bar-wrap">
          <div class="ai-trend-bar-fill" style="width:${pct}%;"></div>
        </div>
        <span class="ai-trend-count">${s.count}</span>
      </div>`;
  }).join('');
}

function renderSkillTags(skills) {
  const container = document.getElementById('aiSkillTags');
  if (!container || !skills) return;
  const max = skills[0]?.count || 1;
  container.innerHTML = skills.map(sk => {
    const size = sk.count >= max * 0.7 ? 1.1 : sk.count >= max * 0.4 ? 0.95 : 0.82;
    return `<span class="ai-skill-tag" style="font-size:${size}rem;">${sk.key} (${sk.count})</span>`;
  }).join('');
}

// ─── Utilitaire ──────────────────────────────────────────────────────────────

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ==================== COACHING IA — PROFIL & DOSSIER ==================== //

// Stockage local des résultats IA profil
state.profileAnalysis = null;
state.generatedSummary = null;

async function runProfileAIAnalysis() {
  const btn = document.getElementById('btnProfileAnalysis');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Analyse…'; btn.classList.add('btn-ai-active'); }

  // Construire le profil depuis le formulaire (état actuel, pas forcément sauvegardé)
  const liveProfile = buildProfileFromForm();

  try {
    const res = await fetch('/api/ai/profile-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: liveProfile })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur analyse');

    const a = data.analysis;
    state.profileAnalysis = a;

    // Masquer placeholder
    document.getElementById('profileAIPlaceholder')?.style.setProperty('display','none');

    // Afficher KPI bar
    const kpiBar = document.getElementById('profileKpiBar');
    if (kpiBar) kpiBar.style.display = 'grid';
    setText('profileCompletionVal', a.completion_score + '% · ' + a.level);
    setText('profileAtsVal',        a.ats_score.score + '/100');
    setText('profileSectorVal',     a.detected_sector);
    setText('profileSkillsVal',     a.skills_count + ' listées');

    // Forces & Faiblesses
    const strengthsList = document.getElementById('profileStrengthsList');
    const weaknessesList = document.getElementById('profileWeaknessesList');
    if (strengthsList) {
      strengthsList.innerHTML = (a.strengths.length > 0
        ? a.strengths.map(s => `<li>✅ ${s}</li>`).join('')
        : '<li style="color:var(--text-muted)">Complétez votre profil pour voir vos forces.</li>');
    }
    if (weaknessesList) {
      weaknessesList.innerHTML = (a.weaknesses.length > 0
        ? a.weaknesses.map(w => `<li>${w}</li>`).join('')
        : '<li style="color:#34d399">✅ Aucune faiblesse majeure détectée !</li>');
    }
    document.getElementById('profileStrengthsPanel')?.style.setProperty('display','block');

    // ATS Checklist
    renderATSChecklist(a.ats_score.details);
    document.getElementById('profileAtsPanel')?.style.setProperty('display','block');

    // Actions prioritaires
    const actionsRes = await fetch('/api/ai/next-actions');
    const actionsData = await actionsRes.json();
    if (actionsData.success) renderProfileActions(actionsData.actions.priority_actions);
    document.getElementById('profileActionsPanel')?.style.setProperty('display','block');

  } catch (err) {
    alert('Erreur analyse profil IA : ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📊 Analyser mon profil'; btn.classList.remove('btn-ai-active'); }
  }
}

async function runGenerateSummary() {
  const btn = document.getElementById('btnGenerateSummary');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Génération…'; btn.classList.add('btn-ai-active'); }

  const liveProfile = buildProfileFromForm();

  try {
    const res = await fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: liveProfile })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur génération');

    const r = data.result;
    state.generatedSummary = r;

    document.getElementById('profileAIPlaceholder')?.style.setProperty('display','none');

    const panel = document.getElementById('profileSummaryPanel');
    const fullEl  = document.getElementById('profileSummaryFull');
    const shortEl = document.getElementById('profileShortPitch');

    if (panel) panel.style.display = 'block';
    if (fullEl)  fullEl.textContent  = r.full_summary;
    if (shortEl) shortEl.textContent = r.short_pitch;

  } catch (err) {
    alert('Erreur génération pitch IA : ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🖊️ Générer mon pitch IA'; btn.classList.remove('btn-ai-active'); }
  }
}

function applyGeneratedSummary() {
  if (!state.generatedSummary) return;
  const summaryField = document.getElementById('formSummary');
  if (summaryField) {
    summaryField.value = state.generatedSummary.full_summary;
    summaryField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Flash visuel pour indiquer la mise à jour
    summaryField.style.border = '2px solid var(--accent)';
    setTimeout(() => { summaryField.style.border = ''; }, 2000);
    alert('✅ Pitch IA inséré dans le champ résumé. N\'oubliez pas de sauvegarder votre profil !');
  }
}

async function runSkillGapAnalysis() {
  const btn    = document.getElementById('btnSkillGaps');
  const sector = document.getElementById('gapSectorSelect')?.value || 'Tech & Digital';

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Analyse…'; }

  const liveProfile = buildProfileFromForm();

  try {
    const res = await fetch('/api/ai/skill-gaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: liveProfile, sector })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erreur analyse lacunes');

    const gaps = data.gaps;
    document.getElementById('profileAIPlaceholder')?.style.setProperty('display','none');

    const panel   = document.getElementById('profileGapsPanel');
    const content = document.getElementById('profileGapsContent');
    if (panel) panel.style.display = 'block';

    if (content) {
      const coverageColor = gaps.coverage_rate >= 70 ? '#34d399' : gaps.coverage_rate >= 50 ? '#fbbf24' : '#f87171';
      content.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px; padding:10px; background:rgba(255,255,255,0.04); border-radius:8px;">
          <div style="font-size:1.8rem; font-weight:800; color:${coverageColor};">${gaps.coverage_rate}%</div>
          <div>
            <div style="font-weight:700; color:${coverageColor};">${gaps.market_alignment} — Alignement marché ${sector}</div>
            <div style="font-size:0.82rem; color:var(--text-muted);">${gaps.skills_present.length} compétences présentes · ${gaps.skills_missing.length} lacunes détectées</div>
          </div>
        </div>
        ${gaps.skills_present.length > 0 ? `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.82rem; font-weight:600; color:#34d399; margin-bottom:6px;">✅ Compétences validées :</div>
            <div>${gaps.skills_present.map(s => `<span class="ai-skill-tag" style="border-color:rgba(52,211,153,0.4);color:#34d399;">${s}</span>`).join('')}</div>
          </div>` : ''}
        ${gaps.skills_missing.length > 0 ? `
          <div style="margin-bottom:14px;">
            <div style="font-size:0.82rem; font-weight:600; color:#f87171; margin-bottom:6px;">❌ Compétences manquantes :</div>
            <div>${gaps.skills_missing.map(s => `<span class="ai-skill-tag" style="border-color:rgba(248,113,113,0.4);color:#f87171;">${s}</span>`).join('')}</div>
          </div>` : ''}
        ${gaps.training_recommendations.length > 0 ? `
          <div>
            <div style="font-size:0.85rem; font-weight:700; color:var(--accent); margin-bottom:8px;">📚 Formations recommandées :</div>
            ${gaps.training_recommendations.map(t => `
              <div style="background:var(--surface-2); border-radius:8px; padding:10px 12px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <div>
                  <span style="font-weight:600; color:var(--text-main);">${t.skill}</span>
                  <span style="font-size:0.78rem; color:var(--text-muted); margin-left:8px;">${t.duration}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:0.75rem;">${t.priority}</span>
                  <span style="font-size:0.78rem; color:var(--text-muted);">${t.platforms.join(' · ')}</span>
                </div>
              </div>`).join('')}
          </div>` : ''}`;
    }

  } catch (err) {
    alert('Erreur analyse lacunes : ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔍 Lacunes compétences'; }
  }
}

// ─── Renderers profil ────────────────────────────────────────────────────────

function renderATSChecklist(details) {
  const container = document.getElementById('profileAtsChecklist');
  if (!container || !details) return;
  container.innerHTML = details.map(item => `
    <div style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:var(--surface-3,rgba(255,255,255,0.04)); border-radius:8px; font-size:0.82rem;">
      <span style="font-size:1rem;">${item.ok ? '✅' : '❌'}</span>
      <span style="flex:1; color:${item.ok ? 'var(--text-main)' : '#f87171'};">${item.label}</span>
      <span style="color:var(--accent); font-weight:700; font-size:0.78rem;">+${item.pts}pts</span>
    </div>`).join('');
}

function renderProfileActions(actions) {
  const container = document.getElementById('profileActionsList');
  if (!container || !actions) return;
  container.innerHTML = actions.map((a, i) => `
    <div style="display:flex; align-items:flex-start; gap:12px; padding:10px; border-radius:10px; background:rgba(255,255,255,0.03); margin-bottom:8px; border-left:3px solid var(--accent);">
      <span style="font-size:1.3rem; min-width:28px;">${a.icon}</span>
      <div style="flex:1;">
        <div style="font-weight:600; font-size:0.9rem; color:var(--text-main);">${a.action}</div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
          Impact : <strong style="color:${a.impact === 'Très élevé' ? '#34d399' : a.impact === 'Élevé' ? '#fbbf24' : '#94a3b8'};">${a.impact}</strong>
          &nbsp;·&nbsp; Effort : ${a.effort}
        </div>
      </div>
      <span style="font-size:0.75rem; font-weight:700; color:var(--accent); min-width:20px; text-align:right;">#${i + 1}</span>
    </div>`).join('');
}

// ─── Helper : lire le profil depuis le formulaire (sans sauvegarder) ──────────

function buildProfileFromForm() {
  return {
    name:               document.getElementById('formName')?.value.trim() || '',
    title:              document.getElementById('formTitle')?.value.trim() || '',
    phone:              document.getElementById('formPhone')?.value.trim() || '',
    email:              document.getElementById('formEmail')?.value.trim() || '',
    country:            document.getElementById('formCountry')?.value || '',
    city:               document.getElementById('formCity')?.value.trim() || '',
    education:          document.getElementById('formEducation')?.value.trim() || '',
    years_of_experience: parseInt(document.getElementById('formYearsExp')?.value) || 0,
    salary_expectation: document.getElementById('formSalary')?.value.trim() || '',
    languages:          (document.getElementById('formLanguages')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    skills:             (document.getElementById('formSkills')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    summary:            document.getElementById('formSummary')?.value.trim() || '',
    experiences:        (state.currentProfile && state.currentProfile.experiences) || []
  };
}

// ==================== 1. BAROMÈTRE DES SALAIRES FCFA ==================== //

async function loadSalaryBenchmark() {
  const sector = document.getElementById('salarySectorSelect')?.value || 'Tech & Digital';
  const level = document.getElementById('salaryLevelSelect')?.value || 'Confirmé (3-5 ans)';
  const city = document.getElementById('salaryCitySelect')?.value || 'Dakar';
  const container = document.getElementById('salaryBenchmarkResult');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">⏳ Chargement du baromètre...</div>';

  try {
    const res = await fetch(`/api/salary/benchmark?sector=${encodeURIComponent(sector)}&level=${encodeURIComponent(level)}&city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const b = data.benchmark;
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="ai-kpi-card" style="border-top: 4px solid var(--accent);">
          <div class="ai-kpi-label">Salaire Net Médian</div>
          <div class="ai-kpi-value" style="font-size: 1.6rem; color: var(--accent); margin: 8px 0;">${b.median.toLocaleString('fr-FR')} FCFA</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${b.city} · ${b.level}</div>
        </div>
        <div class="ai-kpi-card">
          <div class="ai-kpi-label">Fourchette Pratiquée</div>
          <div class="ai-kpi-value" style="font-size: 1.25rem; color: var(--text-main); margin: 8px 0;">${b.min.toLocaleString('fr-FR')} - ${b.max.toLocaleString('fr-FR')}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Fourchette basse à haute</div>
        </div>
        <div class="ai-kpi-card">
          <div class="ai-kpi-label">Tendance sur 12 Mois</div>
          <div class="ai-kpi-value" style="font-size: 1.4rem; color: #34d399; margin: 8px 0;">${b.growth_12m}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Demande : ${b.demand_level}</div>
        </div>
        <div class="ai-kpi-card">
          <div class="ai-kpi-label">Avantages Courants</div>
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin: 8px 0;">${b.top_perk}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Négociable en entretien</div>
        </div>
      </div>

      <div class="page-card">
        <h4 style="font-size: 1.1rem; margin-bottom: 16px;">🌍 Comparatif Inter-Villes (${b.sector} · ${b.level})</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${b.city_comparison.map(c => `
            <div style="display: flex; align-items: center; gap: 14px; padding: 10px 14px; background: ${c.is_current ? 'rgba(245, 158, 11, 0.15)' : 'var(--surface-2)'}; border: 1px solid ${c.is_current ? 'var(--accent)' : 'var(--border)'}; border-radius: 8px;">
              <span style="font-weight: 700; width: 120px;">${c.city} ${c.is_current ? '👈' : ''}</span>
              <div style="flex: 1; background: var(--surface-3); height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, var(--primary-light), var(--accent)); height: 100%; width: ${Math.round((c.median / b.city_comparison[0].median) * 100)}%;"></div>
              </div>
              <span style="font-weight: 800; color: var(--accent); width: 140px; text-align: right;">${c.median.toLocaleString('fr-FR')} FCFA</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: #f87171; padding: 20px;">Erreur chargement : ${err.message}</div>`;
  }
}

// ==================== 2. RADAR CONCOURS FONCTION PUBLIQUE ==================== //

let stateConcoursList = [];

async function loadConcoursList() {
  const country = document.getElementById('filterConcoursCountry')?.value || 'Tous';
  const container = document.getElementById('concoursGridContainer');
  const counter = document.getElementById('concoursStatsCounter');
  if (!container) return;

  container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px;">⏳ Chargement des avis officiels...</div>';

  try {
    const res = await fetch(`/api/concours?country=${encodeURIComponent(country)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    stateConcoursList = data.concours;
    if (counter) counter.textContent = `${data.count} concours ouverts actuellement`;

    renderConcoursGrid(data.concours);
  } catch (err) {
    container.innerHTML = `<div style="color: #f87171; padding: 20px;">Erreur : ${err.message}</div>`;
  }
}

function renderConcoursGrid(list) {
  const container = document.getElementById('concoursGridContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Aucun concours correspondant.</div>';
    return;
  }

  container.innerHTML = list.map(c => `
    <div class="source-card" style="border-left: 4px solid #3b82f6;">
      <div class="source-card-header">
        <span class="source-flag">🏛️ ${c.country}</span>
        <span class="source-status-badge ${c.days_left <= 30 ? 'status-inactive' : 'status-active'}">
          ${c.days_left <= 30 ? '⏳ ' + c.days_left + 'j restants' : '✅ ' + c.days_left + ' jours'}
        </span>
      </div>
      <div class="source-card-body">
        <h4 class="source-name" style="font-size: 1.05rem; margin-bottom: 6px;">${c.title}</h4>
        <div style="font-size: 0.85rem; color: var(--accent); font-weight: 700; margin-bottom: 8px;">${c.institution}</div>
        <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 10px;">${c.description}</p>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
          <span class="badge-mini">👥 ${c.positions_count} postes</span>
          <span class="badge-mini">📚 ${c.sector}</span>
        </div>
      </div>
      <div class="source-card-footer">
        <a href="${c.registration_url}" target="_blank" rel="noopener" class="source-link-btn" style="color: #60a5fa; font-weight: 700;">
          📝 S'inscrire au concours
        </a>
      </div>
    </div>
  `).join('');
}

function searchConcoursUI() {
  const query = (document.getElementById('searchConcoursInput')?.value || '').toLowerCase();
  const filtered = stateConcoursList.filter(c => 
    c.title.toLowerCase().includes(query) ||
    c.institution.toLowerCase().includes(query) ||
    c.sector.toLowerCase().includes(query)
  );
  renderConcoursGrid(filtered);
}

// ==================== 3. INTELLIGENCE ENTREPRISES ==================== //

let stateCompaniesList = [];

async function loadCompaniesList() {
  const country = document.getElementById('filterCompanyCountry')?.value || 'Tous';
  const diasporaOnly = document.getElementById('filterDiasporaFriendly')?.checked || false;
  const container = document.getElementById('companiesGridContainer');
  if (!container) return;

  container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px;">⏳ Chargement des fiches entreprises...</div>';

  try {
    const res = await fetch(`/api/companies?country=${encodeURIComponent(country)}&diasporaOnly=${diasporaOnly}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    stateCompaniesList = data.companies;
    renderCompaniesGrid(data.companies);
  } catch (err) {
    container.innerHTML = `<div style="color: #f87171; padding: 20px;">Erreur : ${err.message}</div>`;
  }
}

function renderCompaniesGrid(list) {
  const container = document.getElementById('companiesGridContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Aucune entreprise trouvée.</div>';
    return;
  }

  container.innerHTML = list.map(c => `
    <div class="source-card" style="border-top: 3px solid var(--accent);">
      <div class="source-card-header">
        <span class="source-flag">🏢 ${c.country}</span>
        <span class="source-status-badge status-active">★ ${c.rating} (${c.review_count} avis)</span>
      </div>
      <div class="source-card-body">
        <h4 class="source-name" style="font-size: 1.15rem; margin-bottom: 4px;">${c.name}</h4>
        <div style="font-size: 0.82rem; color: var(--accent); margin-bottom: 8px;">${c.sector} · ${c.city}</div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px;">${c.description}</p>
        
        <div style="background: var(--surface-2); padding: 8px 10px; border-radius: 6px; font-size: 0.78rem; margin-bottom: 8px;">
          <strong>💰 Salaires observés :</strong> ${c.salary_range}
        </div>

        <div style="font-size: 0.78rem; color: var(--text-main); margin-bottom: 8px;">
          <strong>⚡ Délais de réponse :</strong> ~${c.avg_response_days} jours
        </div>

        ${c.diaspora_friendly ? '<span class="badge-mini" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; border-color: rgba(99, 102, 241, 0.4);">🌍 Diaspora Friendly</span>' : ''}
      </div>
      <div class="source-card-footer" style="flex-direction: column; align-items: flex-start; gap: 6px;">
        <div style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">💡 Conseil initié :</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">"${c.insider_tips[0] || 'Préparez votre entretien'}"</div>
      </div>
    </div>
  `).join('');
}

function searchCompaniesUI() {
  const query = (document.getElementById('searchCompanyInput')?.value || '').toLowerCase();
  const filtered = stateCompaniesList.filter(c => 
    c.name.toLowerCase().includes(query) ||
    c.sector.toLowerCase().includes(query) ||
    c.city.toLowerCase().includes(query)
  );
  renderCompaniesGrid(filtered);
}

// ==================== 4. MODE DIASPORA RETURN ==================== //

async function convertDiasporaSalary() {
  const amount = document.getElementById('diasporaAmountInput')?.value || 3000;
  const currency = document.getElementById('diasporaCurrencySelect')?.value || 'EUR';
  const source_city = document.getElementById('diasporaSourceCity')?.value || 'Paris';
  const target_city = document.getElementById('diasporaTargetCity')?.value || 'Dakar';
  const container = document.getElementById('diasporaConversionResult');
  if (!container) return;

  try {
    const res = await fetch('/api/diaspora/convert-salary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, source_city, target_city })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const r = data.result;
    container.innerHTML = `
      <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.8rem; color: #a5b4fc; text-transform: uppercase;">Salaire Nominal Converti</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: white;">${r.nominal_fcfa.toLocaleString('fr-FR')} FCFA</div>
            <div style="font-size: 0.78rem; color: #cbd5e1;">Taux officiel de change</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: #34d399; text-transform: uppercase;">Pouvoir d'Achat Équivalent</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #34d399;">${r.equivalent_purchasing_power_fcfa.toLocaleString('fr-FR')} FCFA</div>
            <div style="font-size: 0.78rem; color: #cbd5e1;">Pour vivre comme à ${r.source_city}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--accent); text-transform: uppercase;">Fourchette de Négociation</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent);">${r.recommended_negotiation_range.formatted}</div>
            <div style="font-size: 0.78rem; color: #cbd5e1;">À demander aux recruteurs locaux</div>
          </div>
        </div>
        <p style="font-size: 0.88rem; color: #e2e8f0; margin: 0; line-height: 1.6;">
          💡 <strong>Analyse du coût de la vie :</strong> ${r.rent_differential}
        </p>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: #f87171;">Erreur : ${err.message}</div>`;
  }
}

async function adaptProfileForDiaspora() {
  const container = document.getElementById('diasporaAdaptationResult');
  if (!container) return;

  container.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">⏳ Traduction et adaptation en cours...</div>';

  try {
    const res = await fetch('/api/diaspora/adapt-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: state.currentProfile })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const a = data.adaptation;
    container.innerHTML = `
      <div style="background: var(--surface-2); border-radius: 10px; padding: 18px; margin-top: 14px;">
        <h4 style="color: var(--accent); margin-bottom: 10px;">✅ Modifications Appliquées pour les DRH d'Afrique de l'Ouest :</h4>
        <ul style="margin: 0 0 14px 18px; font-size: 0.88rem; line-height: 1.6;">
          ${a.applied_changes.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 10px 14px; font-size: 0.85rem; border-radius: 4px; margin-bottom: 12px;">
          <strong>Mention mobilité ajoutée :</strong> "${a.mobility_statement}"
        </div>
        <button class="btn-primary" onclick="alert('✅ Profil adapté enregistré avec les équivalences CAMES !')">
          💾 Enregistrer ces adaptations au profil maître
        </button>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: #f87171;">Erreur : ${err.message}</div>`;
  }
}

async function loadDiasporaGuide(country) {
  const container = document.getElementById('diasporaGuideContent');
  if (!container) return;

  try {
    const res = await fetch(`/api/diaspora/guide?country=${encodeURIComponent(country)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const g = data.guide;
    container.innerHTML = `
      <div style="background: var(--surface-2); border-radius: 10px; padding: 16px; font-size: 0.88rem; line-height: 1.6;">
        <h4 style="color: var(--accent); margin-bottom: 8px;">Guide d'installation : ${g.country}</h4>
        <p><strong>Quartiers recommandés :</strong> ${g.main_cities.join(' · ')}</p>
        <p><strong>Banques avec services diaspora :</strong> ${g.banking_diaspora.join(', ')}</p>
        <p><strong>Fiscalité :</strong> ${g.tax_tips}</p>
        <p><strong>Loyers moyens :</strong> ${g.housing_avg_dakar || g.housing_avg_abidjan}</p>
        <p><strong>Écoles internationales :</strong> ${g.schools}</p>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: #f87171;">Erreur : ${err.message}</div>`;
  }
}

// ==================== 5. PISTON DIGITAL (RÉSEAU DE COOPTATION) ==================== //

async function loadReferralsNetwork() {
  const scoreNum = document.getElementById('referralScoreNum');
  const badgeText = document.getElementById('referralBadgeText');
  const listContainer = document.getElementById('referralsListContainer');
  if (!listContainer) return;

  try {
    const res = await fetch('/api/referrals');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (scoreNum) scoreNum.textContent = data.reputation_score;
    if (badgeText) badgeText.textContent = data.badge;

    listContainer.innerHTML = data.referrals.map(r => `
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 700; font-size: 1rem;">${r.referrer_name}</div>
            <div style="font-size: 0.82rem; color: var(--accent);">${r.referrer_title} — ${r.referrer_company}</div>
          </div>
          <span class="badge-mini" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">${r.endorsement_strength}</span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-main); font-style: italic; margin-bottom: 10px;">"${r.text}"</p>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${(r.skills_endorsed || []).map(s => `<span class="badge-mini">✓ ${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    listContainer.innerHTML = `<div style="color: #f87171;">Erreur : ${err.message}</div>`;
  }
}

function openAddReferralModal() {
  const name = prompt("Nom et prénom du référent (ex: Amadou Diallo) :");
  if (!name) return;
  const company = prompt("Entreprise du référent (ex: Sonatel) :", "Orange / Sonatel");
  const title = prompt("Titre du référent :", "Directeur de Projet");
  const text = prompt("Texte de recommandation :");
  if (!text) return;

  fetch('/api/referrals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referrer_name: name, referrer_company: company, referrer_title: title, text })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      alert("✅ Recommandation ajoutée à votre dossier !");
      loadReferralsNetwork();
    }
  });
}

// ==================== 6. WHATSAPP BOT & SMS EN DIRECT ==================== //

function initWhatsAppChat() {
  const chatBox = document.getElementById('whatsappChatBox');
  if (!chatBox || chatBox.children.length > 0) return;

  // Message d'accueil par défaut
  chatBox.innerHTML = `
    <div style="align-self: flex-start; max-width: 82%; background: #202c33; color: #e9edef; padding: 10px 14px; border-radius: 8px 8px 8px 0; font-size: 0.88rem; line-height: 1.5; white-space: pre-wrap;">👋 *Bienvenue sur SunuJob AI WhatsApp Bot !*

Bonjour Ibrahima. Je suis votre assistant de carrière autonome.

🔍 *JOBS [poste] [ville]* — Trouver les offres
💰 *SALAIRE [secteur] [ville]* — Baromètre salaires
📢 *CONCOURS [pays]* — Concours de l'État
👤 *PROFIL* — Voir mon profil actif

_Essayez dès maintenant en écrivant :_ *JOBS Dakar*</div>
  `;
}

async function sendWhatsAppMessage() {
  const input = document.getElementById('whatsappUserInput');
  const chatBox = document.getElementById('whatsappChatBox');
  if (!input || !chatBox) return;

  const msg = input.value.trim();
  if (!msg) return;

  // Bulle utilisateur (vert WhatsApp)
  chatBox.innerHTML += `
    <div style="align-self: flex-end; max-width: 80%; background: #005c4b; color: #e9edef; padding: 10px 14px; border-radius: 8px 8px 0 8px; font-size: 0.88rem; line-height: 1.5;">
      ${msg}
    </div>
  `;
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch('/api/whatsapp/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    if (data.success && data.reply) {
      setTimeout(() => {
        chatBox.innerHTML += `
          <div style="align-self: flex-start; max-width: 85%; background: #202c33; color: #e9edef; padding: 10px 14px; border-radius: 8px 8px 8px 0; font-size: 0.88rem; line-height: 1.5; white-space: pre-wrap;">${data.reply.text}</div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
      }, 400);
    }
  } catch (err) {
    chatBox.innerHTML += `<div style="align-self: flex-start; color: #f87171; font-size: 0.8rem;">Erreur de connexion bot</div>`;
  }
}

function triggerBotQuickCommand(cmd) {
  const input = document.getElementById('whatsappUserInput');
  if (input) {
    input.value = cmd;
    sendWhatsAppMessage();
  }
}

async function simulateSMS() {
  const input = document.getElementById('smsCommandInput');
  const output = document.getElementById('smsOutputBox');
  if (!input || !output) return;

  const cmd = input.value.trim() || 'SUNUJOB Dakar';
  output.textContent = 'Envoi du SMS vers le 21021...';

  try {
    const res = await fetch('/api/sms/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: cmd })
    });
    const data = await res.json();
    if (data.success) {
      output.innerHTML = `
        <div style="color: #86efac; font-weight: 700; margin-bottom: 4px;">📩 Réponse SMS Reçue (${data.char_count || 140}/160 car.) :</div>
        <div style="color: white; line-height: 1.4;">${data.message || data.text || 'Commande traitée avec succès'}</div>
      `;
    }
  } catch (err) {
    output.textContent = 'Erreur simulation SMS : ' + err.message;
  }
}

// ==================== 7. VOICE-TO-CV (DICTÉE VOCALE DU PROFIL) ==================== //

let voiceRecognitionInstance = null;
let isVoiceRecording = false;

function toggleVoiceRecording() {
  const btn = document.getElementById('btnVoiceRecord');
  const icon = document.getElementById('voiceRecordIcon');
  const label = document.getElementById('voiceRecordLabel');
  const transcriptInput = document.getElementById('voiceTranscriptInput');
  const statusMsg = document.getElementById('voiceStatusMsg');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#fbbf24';
      statusMsg.textContent = "ℹ️ Dictée vocale directe non supportée par ce navigateur. Utilisez les exemples audio ci-dessus ou saisissez votre texte.";
    }
    loadVoiceSample('tech_dakar');
    return;
  }

  if (isVoiceRecording) {
    if (voiceRecognitionInstance) voiceRecognitionInstance.stop();
    isVoiceRecording = false;
    if (icon) icon.textContent = '🎙️';
    if (label) label.textContent = 'Démarrer la dictée vocale';
    if (btn) btn.style.background = '#10b981';
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.textContent = "✅ Enregistrement terminé. Cliquez sur 'Extraire & Injecter'.";
    }
    return;
  }

  try {
    voiceRecognitionInstance = new SpeechRecognition();
    voiceRecognitionInstance.lang = 'fr-FR';
    voiceRecognitionInstance.continuous = true;
    voiceRecognitionInstance.interimResults = true;

    voiceRecognitionInstance.onstart = () => {
      isVoiceRecording = true;
      if (icon) icon.textContent = '🔴';
      if (label) label.textContent = 'En écoute... Parlez distinctement';
      if (btn) btn.style.background = '#ef4444';
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.textContent = "Microphone actif. Parlez en français de votre métier, expérience, ville et prétentions...";
      }
    };

    voiceRecognitionInstance.onresult = (event) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      if (transcriptInput) transcriptInput.value = current;
    };

    voiceRecognitionInstance.onerror = (e) => {
      console.warn('Voice recognition error', e);
      isVoiceRecording = false;
      if (icon) icon.textContent = '🎙️';
      if (label) label.textContent = 'Démarrer la dictée vocale';
      if (btn) btn.style.background = '#10b981';
    };

    voiceRecognitionInstance.onend = () => {
      isVoiceRecording = false;
      if (icon) icon.textContent = '🎙️';
      if (label) label.textContent = 'Démarrer la dictée vocale';
      if (btn) btn.style.background = '#10b981';
    };

    voiceRecognitionInstance.start();
  } catch (err) {
    console.error(err);
  }
}

function loadVoiceSample(sampleKey) {
  const input = document.getElementById('voiceTranscriptInput');
  const statusMsg = document.getElementById('voiceStatusMsg');
  if (!input) return;

  const samples = {
    tech_dakar: "Moi c'est Cheikh Tidiane Sall, ingénieur Cloud et DevOps avec 4 ans d'expérience à Dakar. J'ai un Master 2 de l'ESP Dakar. Je maîtrise Docker, Kubernetes, AWS, Terraform, Python et les APIs de paiement comme Wave. Je cherche un poste à 1 100 000 FCFA net par mois.",
    commercial_abidjan: "Je m'appelle Awa Koné, responsable commerciale B2B basée à Abidjan Marcory. J'ai 5 ans d'expérience dans la grande distribution et les biens de consommation. Maîtrise de Salesforce, CRM, négociation grands comptes. Prétentions salariales 950 000 FCFA.",
    comptable_cotonou: "Je m'appelle Bio Gado, auditeur et comptable senior avec 6 ans d'expérience à Cotonou. Diplôme DESCOGEF, parfaite maîtrise du SYSCOHADA révisé, Sage 100, fiscalité et audit bancaire. Prétentions 750 000 FCFA net."
  };

  if (samples[sampleKey]) {
    input.value = samples[sampleKey];
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#86efac';
      statusMsg.textContent = "🎧 Mémo vocal chargé avec succès. Cliquez sur 'Extraire & Injecter' pour pré-remplir le profil.";
    }
  }
}

async function applyVoiceProfile() {
  const input = document.getElementById('voiceTranscriptInput');
  const statusMsg = document.getElementById('voiceStatusMsg');
  const transcript = (input?.value || '').trim();

  if (!transcript) {
    alert("Veuillez d'abord dicter ou choisir un extrait vocal.");
    return;
  }

  if (statusMsg) {
    statusMsg.style.display = 'block';
    statusMsg.style.color = '#fbbf24';
    statusMsg.textContent = "⏳ Analyse IA du mémo vocal et extraction des entités...";
  }

  try {
    const res = await fetch('/api/ai/parse-voice-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const p = data.extracted_profile;

    // Remplissage animé des champs du formulaire
    if (p.name && document.getElementById('formName')) document.getElementById('formName').value = p.name;
    if (p.title && document.getElementById('formTitle')) document.getElementById('formTitle').value = p.title;
    if (p.city && document.getElementById('formCity')) document.getElementById('formCity').value = p.city;
    if (p.country && document.getElementById('formCountry')) document.getElementById('formCountry').value = p.country;
    if (p.education && document.getElementById('formEducation')) document.getElementById('formEducation').value = p.education;
    if (p.years_of_experience && document.getElementById('formYearsExp')) document.getElementById('formYearsExp').value = p.years_of_experience;
    if (p.salary_expectation && document.getElementById('formSalary')) document.getElementById('formSalary').value = p.salary_expectation;
    if (p.skills && p.skills.length > 0 && document.getElementById('formSkills')) {
      document.getElementById('formSkills').value = p.skills.join(', ');
    }
    if (p.summary && document.getElementById('formSummary')) document.getElementById('formSummary').value = p.summary;

    if (statusMsg) {
      statusMsg.style.color = '#34d399';
      statusMsg.textContent = "✅ Profil pré-rempli avec succès depuis la voix ! Vérifiez et cliquez sur 'Enregistrer le profil'.";
    }

    // Scroll doux vers le formulaire
    document.querySelector('.profile-form-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    if (statusMsg) {
      statusMsg.style.color = '#f87171';
      statusMsg.textContent = "Erreur lors de l'analyse vocale : " + err.message;
    }
  }
}

// ==================== 8. PARSER D'OFFRES INFORMELLES (FACEBOOK / WHATSAPP) ==================== //

function loadInformalSample(sampleKey) {
  const input = document.getElementById('informalRawPostInput');
  if (!input) return;

  const samples = {
    comptable_dakar: "URGENT RECRUTEMENT !! Cabinet d'expertise comptable recherche un comptable confirmé sur Dakar Plateau. Titulaire BAC+4/5 en comptabilité, minimum 3 ans d'expérience en cabinet, maîtrise du SYSCOHADA et logiciel Sage. Salaire net 650 000 FCFA + IPM. Envoyez votre CV par WhatsApp au +221 77 456 78 90 ou par email à recrutement@audit-dakar.sn avant le 30 novembre.",
    dev_abidjan: "Avis de recrutement Abidjan Cocody : Startup FinTech en forte croissance recrute un Lead Développeur Flutter & Node.js. CDI, salaire attractif 950 000 - 1 400 000 FCFA selon expérience. Intégration API Mobile Money requise. Contactez vite la DRH par whatsapp au +225 07 89 01 23 45 ou candidature@ivoirepay.ci"
  };

  if (samples[sampleKey]) {
    input.value = samples[sampleKey];
  }
}

async function parseAndFillInformalJob() {
  const input = document.getElementById('informalRawPostInput');
  const statusMsg = document.getElementById('informalParseStatus');
  const rawText = (input?.value || '').trim();

  if (!rawText) {
    alert("Veuillez d'abord coller le texte brut du post.");
    return;
  }

  if (statusMsg) {
    statusMsg.style.display = 'inline';
    statusMsg.style.color = '#fbbf24';
    statusMsg.textContent = "⏳ Extraction IA des entités en cours...";
  }

  try {
    const res = await fetch('/api/ai/parse-informal-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const j = data.extracted_job;

    if (j.title && document.getElementById('cJobTitle')) document.getElementById('cJobTitle').value = j.title;
    if (j.company && document.getElementById('cJobCompany')) document.getElementById('cJobCompany').value = j.company;
    if (j.country && document.getElementById('cJobCountry')) document.getElementById('cJobCountry').value = j.country;
    if (j.city && document.getElementById('cJobCity')) document.getElementById('cJobCity').value = j.city;
    if (j.description && document.getElementById('cJobDescription')) document.getElementById('cJobDescription').value = j.description;
    if (j.email && document.getElementById('cJobEmail')) document.getElementById('cJobEmail').value = j.email;
    if (j.whatsapp && document.getElementById('cJobWhatsapp')) document.getElementById('cJobWhatsapp').value = j.whatsapp;

    if (statusMsg) {
      statusMsg.style.color = '#34d399';
      statusMsg.textContent = `✅ Offre extraite avec ${data.confidence_score}% de confiance ! Formulaire pré-rempli.`;
    }

    document.getElementById('cJobTitle')?.focus();
  } catch (err) {
    if (statusMsg) {
      statusMsg.style.color = '#f87171';
      statusMsg.textContent = "Erreur parsing : " + err.message;
    }
  }
}

// ==================== 9. SIMULATEUR D'ENTRETIEN IA ==================== //

const INTERVIEW_PERSONAS_DETAILS = {
  drh_banque_abidjan: {
    name: "Koffi Kouamé",
    title: "DRH Banque Atlantique · Abidjan",
    avatar: "👨🏾‍💼",
    style: "Strict & Procédurier (BCEAO)",
    focus: ["Respect scrupuleux des normes bancaires", "Stabilité émotionnelle et rigueur éthique", "Expérience des audits et du contrôle interne"]
  },
  manager_tech_dakar: {
    name: "Aminata Diallo",
    title: "VP Tech & Produit · FinTech Dakar",
    avatar: "👩🏾‍💻",
    style: "Factuelle & Orientée Résultats",
    focus: ["Maîtrise concrète des architectures web/cloud", "Capacité à livrer sans supervision excessive", "Expérience des passerelles locales (Wave, OM)"]
  },
  dg_pme_cotonou: {
    name: "Bio Sika",
    title: "DG · Bénin Distribution & Logistique",
    avatar: "👨🏾",
    style: "Direct & Pragmatique",
    focus: ["Polyvalence terrain et sens commercial", "Résolution rapide des blocages opérationnels", "Rentabilité immédiate du poste"]
  },
  drh_multinationale_abidjan: {
    name: "Marie-Chantal Bamba",
    title: "Directrice RH Régionale · Unilever / Nestlé",
    avatar: "👩🏾‍💼",
    style: "Méthode STAR & Compétences Comportementales",
    focus: ["Leadership inclusif et intelligence émotionnelle", "Capacité d'adaptation aux standards mondiaux", "Résultats chiffrés vérifiables"]
  },
  recruteur_cabinet_dakar: {
    name: "Babacar Ndiaye",
    title: "Consultant Chasseur de Têtes · AfricSearch",
    avatar: "👨🏾‍🏫",
    style: "Bienveillant & Analytique",
    focus: ["Cohérence du plan de carrière", "Capacité de synthèse et storytelling", "Motivation profonde pour le poste"]
  },
  responsable_rh_ong: {
    name: "Fatoumata Traoré",
    title: "Responsable RH Régionale · ONG Sahel",
    avatar: "🧕🏾",
    style: "Humaniste & Orientée Valeurs",
    focus: ["Sens de l'engagement communautaire", "Résilience dans les contextes difficiles", "Respect de la diversité culturelle"]
  },
  manager_agro_sanpedro: {
    name: "Karamoko Sanogo",
    title: "Directeur Usine Cacao · San Pedro",
    avatar: "👨🏾‍🔧",
    style: "Opérationnel & Sécurité (HSE)",
    focus: ["Gestion rigoureuse des équipes de production", "Culture zéro accident et conformité qualité", "Disponibilité industrielle"]
  },
  daf_banque_panafricaine: {
    name: "Cheikh Oumar Ba",
    title: "Directeur Financier · BOAD Lomé",
    avatar: "👨🏾‍💼",
    style: "Analytique & Financement International",
    focus: ["Maîtrise du SYSCOHADA et des normes IFRS", "Négociation avec bailleurs de fonds internationaux", "Modélisation financière avancée"]
  }
};

const INTERVIEW_QUESTIONS_POOL = {
  presentation: [
    "Présentez-vous en 2 minutes en mettant en avant les étapes clés qui font de vous le candidat idéal pour notre structure en Afrique de l'Ouest.",
    "Qu'est-ce qui vous motive particulièrement à rejoindre notre entreprise plutôt qu'un concurrent sur le marché local ?"
  ],
  competences_techniques: [
    "Comment concevez-vous une architecture haute disponibilité pour gérer les pics de transactions Mobile Money lors des fêtes de Tabaski ou Korité ?",
    "Pouvez-vous me décrire le projet le plus complexe que vous avez mené à bien et les choix technologiques ou méthodologiques que vous avez arbitrés ?"
  ],
  mise_en_situation: [
    "Décrivez une situation où vous avez fait face à un retard critique d'un fournisseur ou partenaire local. Quelle action concrète avez-vous entreprise (Méthode STAR) ?",
    "Si un membre clé de votre équipe est en désaccord public avec vous sur un livrable urgent, comment gérez-vous la situation ?"
  ],
  competences_comportementales: [
    "Comment entretenez-vous la cohésion et la motivation au sein d'une équipe multiculturelle répartie entre Dakar, Abidjan et Paris ?",
    "Parlez-moi d'une erreur professionnelle que vous avez commise, et de la leçon pratique que vous en avez tirée pour la suite."
  ],
  questions_pieges: [
    "Quels sont vos 2 principaux points d'amélioration, et que faites-vous actuellement pour y remédier ?",
    "Si notre direction vous demande de travailler exceptionnellement tout le week-end pour sauver un projet critique, comment réagissez-vous ?"
  ],
  negociation_salariale: [
    "Quelles sont vos prétentions salariales nettes mensuelles en FCFA, et sur quels éléments concrets de votre parcours fondez-vous ce montant ?",
    "Si nous ne pouvons pas atteindre votre prétention fixe de base, quels avantages périphériques (13e mois, IPM 100%, véhicule) seriez-vous prêt à négocier ?"
  ]
};

function initInterviewView() {
  changePersonaInterview();
}

function changePersonaInterview() {
  const select = document.getElementById('interviewPersonaSelect');
  const personaKey = select?.value || 'manager_tech_dakar';
  const p = INTERVIEW_PERSONAS_DETAILS[personaKey] || INTERVIEW_PERSONAS_DETAILS.manager_tech_dakar;

  const avatarEl = document.getElementById('personaAvatarCircle');
  const nameEl = document.getElementById('personaNameHeading');
  const titleEl = document.getElementById('personaTitleSub');
  const styleEl = document.getElementById('personaStyleBadge');
  const focusList = document.getElementById('personaFocusList');

  if (avatarEl) avatarEl.textContent = p.avatar;
  if (nameEl) nameEl.textContent = p.name;
  if (titleEl) titleEl.textContent = p.title;
  if (styleEl) styleEl.textContent = `Style : ${p.style}`;

  if (focusList) {
    focusList.innerHTML = p.focus.map(f => `<li>${f}</li>`).join('');
  }

  loadNewInterviewQuestion();
}

function loadNewInterviewQuestion() {
  const cat = document.getElementById('interviewCategorySelect')?.value || 'competences_techniques';
  const pool = INTERVIEW_QUESTIONS_POOL[cat] || INTERVIEW_QUESTIONS_POOL.competences_techniques;
  const q = pool[Math.floor(Math.random() * pool.length)];

  const qText = document.getElementById('interviewQuestionText');
  if (qText) qText.textContent = `« ${q} »`;

  const answerInput = document.getElementById('interviewCandidateAnswer');
  if (answerInput) answerInput.value = '';

  const evalBox = document.getElementById('interviewEvaluationBox');
  if (evalBox) evalBox.style.display = 'none';
}

function insertAnswerTemplate() {
  const answerInput = document.getElementById('interviewCandidateAnswer');
  if (!answerInput) return;

  answerInput.value = `Situation : Lors de mon expérience récente chez...\nTâche : Notre objectif était de déployer une solution capable de...\nAction : J'ai personnellement pris en charge la coordination technique et mis en place...\nRésultat : Cela nous a permis d'augmenter le taux de succès de 35% et de réduire les coûts opérationnels.`;
  answerInput.focus();
}

function toggleInterviewSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const input = document.getElementById('interviewCandidateAnswer');
  const btn = document.getElementById('btnInterviewMic');

  if (!SpeechRecognition) {
    alert("Dictée vocale directe non disponible. Vous pouvez taper votre réponse ou utiliser le modèle proposé.");
    insertAnswerTemplate();
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'fr-FR';
  rec.start();

  if (btn) btn.textContent = '🔴 En écoute...';

  rec.onresult = (e) => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) {
      text += e.results[i][0].transcript + ' ';
    }
    if (input) input.value = text.trim();
  };

  rec.onend = () => {
    if (btn) btn.textContent = '🎤 Dictée vocale';
  };
}

async function submitInterviewAnswer() {
  const qText = document.getElementById('interviewQuestionText')?.textContent || '';
  const answer = document.getElementById('interviewCandidateAnswer')?.value.trim();
  const evalBox = document.getElementById('interviewEvaluationBox');
  const btn = document.getElementById('btnSubmitAnswer');

  if (!answer || answer.length < 15) {
    alert("Veuillez développer votre réponse avant de demander l'évaluation.");
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = "⏳ Évaluation par le DRH IA..."; }

  try {
    const res = await fetch('/api/interview/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: qText, answer })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const ev = data.evaluation;
    if (evalBox) {
      evalBox.style.display = 'block';
      const scoreColor = ev.score >= 80 ? '#34d399' : ev.score >= 60 ? '#fbbf24' : '#f87171';

      evalBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 14px;">
          <div>
            <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Note Globale du Recruteur :</span>
            <div style="font-size: 2rem; font-weight: 800; color: ${scoreColor};">${ev.score}/100</div>
          </div>
          <div class="badge-mini" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 0.82rem;">
            ${ev.method_star_detected ? '✅ Méthode STAR validée' : '⚠️ Structuration STAR à perfectionner'}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 12px;">
            <strong style="color: #34d399; font-size: 0.85rem; display: block; margin-bottom: 6px;">💪 Ce qui a plu au jury :</strong>
            <ul style="margin: 0 0 0 16px; font-size: 0.82rem; color: var(--text-main); line-height: 1.5;">
              ${(ev.strengths || ['Bonne clarté d\'expression', 'Contexte professionnel adapté']).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div style="background: rgba(239, 68, 68, 0.08); border-radius: 8px; padding: 12px;">
            <strong style="color: #f87171; font-size: 0.85rem; display: block; margin-bottom: 6px;">🎯 Points à améliorer :</strong>
            <ul style="margin: 0 0 0 16px; font-size: 0.82rem; color: var(--text-main); line-height: 1.5;">
              ${(ev.weaknesses || ['Ajouter des chiffres ou métriques de réussite']).map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid var(--accent); padding: 10px 14px; border-radius: 4px; font-size: 0.85rem; color: var(--text-main);">
          <strong>💡 Conseil du DRH :</strong> ${ev.advice || 'Précisez toujours le ROI et l\'impact chiffré de votre travail pour marquer des points décisifs.'}
        </div>
      `;
    }
  } catch (err) {
    alert("Erreur lors de l'évaluation : " + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "⚡ Faire évaluer ma réponse par l'IA"; }
  }
}

async function simulateSalaryNegotiationUI() {
  const desired = document.getElementById('desiredSalaryInput')?.value || 900000;
  const container = document.getElementById('salaryNegotiationResult');
  if (!container) return;

  container.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">⏳ Simulation de la négociation en cours...</div>';

  try {
    const res = await fetch('/api/interview/salary-negotiation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desiredSalary: parseInt(desired) })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const neg = data.negotiation;
    container.innerHTML = `
      <div style="background: var(--surface-2); border-radius: 12px; padding: 18px; margin-top: 14px; border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <span style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Verdict Recruteur :</span>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent);">${neg.verdict || 'Prétention Réaliste & Négociable'}</div>
          </div>
          <div class="badge-mini" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">
            Proposition employeur : ${neg.counter_offer_fcfa ? neg.counter_offer_fcfa.toLocaleString('fr-FR') + ' FCFA' : '850 000 FCFA'}
          </div>
        </div>

        <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main); margin-bottom: 14px;">
          ${neg.recruiter_pitch || 'Le recruteur trouve votre prétention cohérente mais proposera un fixe légèrement ajusté avec prime de fin d\'année.'}
        </p>

        <div style="background: rgba(245, 158, 11, 0.1); border-radius: 8px; padding: 12px;">
          <strong style="color: var(--accent); font-size: 0.85rem; display: block; margin-bottom: 6px;">🎁 Leviers de négociation recommandés en Afrique de l'Ouest :</strong>
          <ul style="margin: 0 0 0 16px; font-size: 0.82rem; color: var(--text-main); line-height: 1.6;">
            <li>13e mois automatique versé en décembre (standard bancaire/télécoms)</li>
            <li>Prise en charge à 100% de l'IPM (Institut de Prévoyance Médicale) familiale</li>
            <li>Indemnité mensuelle de carburant / transport (75 000 - 150 000 FCFA)</li>
            <li>Forfait communication & abonnement data 4G/5G</li>
          </ul>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: #f87171; padding: 12px;">Erreur : ${err.message}</div>`;
  }
}
