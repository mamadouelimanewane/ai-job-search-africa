/**
 * Application Client — SunuJob AI (ai-job-search-africa)
 * Interface complète avec gestion des vues, multi-agents, matching et Mobile Money
 */

let state = {
  currentProfile: null,
  sampleProfiles: [],
  jobs: [],
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
    fetchJobs()
  ]);
}

// ==================== NAVIGATION ENTRE LES VUES ==================== //

function switchNavView(view) {
  // Masquer toutes les vues
  document.getElementById('viewFeed').style.display = view === 'feed' ? 'block' : 'none';
  document.getElementById('viewProfile').style.display = view === 'profile' ? 'block' : 'none';
  document.getElementById('viewCustom').style.display = view === 'custom' ? 'block' : 'none';
  document.getElementById('viewPricing').style.display = view === 'pricing' ? 'block' : 'none';

  // Mettre à jour les boutons navbar
  document.getElementById('navFeedBtn').classList.toggle('active', view === 'feed');
  document.getElementById('navProfileBtn').classList.toggle('active', view === 'profile');
  document.getElementById('navCustomJobBtn').classList.toggle('active', view === 'custom');
  document.getElementById('navPricingBtn').classList.toggle('active', view === 'pricing');

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
