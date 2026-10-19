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
  // Masquer toutes les vues
  document.getElementById('viewFeed').style.display = view === 'feed' ? 'block' : 'none';
  document.getElementById('viewProfile').style.display = view === 'profile' ? 'block' : 'none';
  document.getElementById('viewCustom').style.display = view === 'custom' ? 'block' : 'none';
  document.getElementById('viewPricing').style.display = view === 'pricing' ? 'block' : 'none';
  const aggView = document.getElementById('viewAggregator');
  if (aggView) aggView.style.display = view === 'aggregator' ? 'block' : 'none';

  // Mettre à jour les boutons navbar
  document.getElementById('navFeedBtn').classList.toggle('active', view === 'feed');
  document.getElementById('navProfileBtn').classList.toggle('active', view === 'profile');
  document.getElementById('navCustomJobBtn').classList.toggle('active', view === 'custom');
  document.getElementById('navPricingBtn').classList.toggle('active', view === 'pricing');
  const navAggBtn = document.getElementById('navAggregatorBtn');
  if (navAggBtn) navAggBtn.classList.toggle('active', view === 'aggregator');

  // Ajuster la visibilité du banner héro
  const heroBanner = document.getElementById('heroBanner');
  if (view === 'feed') {
    heroBanner.style.display = 'block';
  } else {
    heroBanner.style.display = 'none';
  }

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
