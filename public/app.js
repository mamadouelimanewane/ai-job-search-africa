// Application Client pour AI Job Search Africa

let currentProfile = null;
let currentJobs = [];
let currentSelectedJob = null;
let currentGeneratedData = null;
let selectedPaymentPackId = 'pack_starter';
let selectedPaymentMethod = 'wave';

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await loadSampleProfilesList();
  await loadCredits();
  await loadJobs();

  // Register service worker if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration error:', err));
  }
});

// ==================== GESTION DU PROFIL ==================== //

async function loadProfile() {
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (data.success && data.profile) {
      currentProfile = data.profile;
      renderProfile(data.profile);
    }
  } catch (err) {
    console.error('Erreur chargement profil:', err);
  }
}

function renderProfile(profile) {
  document.getElementById('profileName').textContent = profile.name || 'Candidat';
  document.getElementById('profileTitle').textContent = profile.title || 'Professionnel';
  document.getElementById('profileInitials').textContent = (profile.name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2);
  document.getElementById('profileLocation').textContent = `${profile.district ? profile.district + ', ' : ''}${profile.city || ''}, ${profile.country || ''}`;
  document.getElementById('profileEducation').textContent = profile.education || 'Diplôme non précisé';
  document.getElementById('profileSalary').textContent = `Prétention : ${profile.salary_expectation || 'À négocier'}`;

  const skillsContainer = document.getElementById('profileSkills');
  skillsContainer.innerHTML = '';
  (profile.skills || []).forEach(skill => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = skill;
    skillsContainer.appendChild(tag);
  });
}

async function loadSampleProfilesList() {
  try {
    const res = await fetch('/api/profile/samples');
    const data = await res.json();
    if (data.success && data.samples) {
      const select = document.getElementById('sampleProfileSelect');
      data.samples.forEach(sample => {
        const opt = document.createElement('option');
        opt.value = sample.id;
        opt.textContent = `${sample.name} (${sample.title} - ${sample.city})`;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    console.error(e);
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
      currentProfile = data.profile;
      renderProfile(data.profile);
      await loadJobs(); // Rafraîchir les scores
    }
  } catch (e) {
    alert('Erreur lors du changement de profil.');
  }
}

// ==================== GESTION DES CREDITS ==================== //

async function loadCredits() {
  try {
    const res = await fetch('/api/credits');
    const data = await res.json();
    if (data.success) {
      const credits = data.credits;
      const countEl = document.getElementById('creditsCount');
      if (credits.total_available > 0) {
        countEl.textContent = `${credits.total_available} candidature${credits.total_available > 1 ? 's' : ''} restante${credits.total_available > 1 ? 's' : ''}`;
      } else {
        countEl.textContent = `0 crédit - Recharger`;
      }
      renderPacks(data.packs);
    }
  } catch (e) {
    console.error(e);
  }
}

function renderPacks(packs) {
  const container = document.getElementById('packsContainer');
  container.innerHTML = '';
  (packs || []).forEach((pack, index) => {
    const card = document.createElement('div');
    card.className = `pack-card ${pack.id === selectedPaymentPackId ? 'selected' : ''}`;
    card.onclick = () => {
      selectedPaymentPackId = pack.id;
      document.querySelectorAll('.pack-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    };
    card.innerHTML = `
      <strong style="font-size:1.05rem;">${pack.name}</strong>
      <div class="pack-price">${pack.price_fcfa.toLocaleString()} FCFA</div>
      <p style="font-size:0.8rem; color:var(--text-muted);">${pack.description}</p>
    `;
    container.appendChild(card);
  });
}

// ==================== GESTION DES OFFRES ==================== //

async function loadJobs(query = '', country = '', contract = '') {
  try {
    const url = new URL('/api/jobs', window.location.origin);
    if (query) url.searchParams.set('q', query);
    if (country) url.searchParams.set('country', country);
    if (contract) url.searchParams.set('contract', contract);

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      currentJobs = data.jobs;
      renderJobs(data.jobs);
    }
  } catch (e) {
    console.error(e);
  }
}

function handleSearch() {
  const q = document.getElementById('searchInput').value;
  const country = document.getElementById('countryFilter').value;
  const contract = document.getElementById('contractFilter').value;
  loadJobs(q, country, contract);
}

function renderJobs(jobs) {
  const container = document.getElementById('jobsListContainer');
  container.innerHTML = '';

  if (jobs.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Aucune offre d'emploi trouvée pour vos critères.</div>`;
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement('article');
    card.className = 'job-card';

    const isSn = job.country.toLowerCase().includes('sénégal');
    const countryTagClass = isSn ? 'tag-country-sn' : 'tag-country-ci';
    const flag = isSn ? '🇸🇳' : '🇨🇮';

    card.innerHTML = `
      <div class="job-header">
        <div>
          <h3 class="job-title">${job.title}</h3>
          <p class="job-company">${job.company} — <span style="color:#2563eb;">${job.district || job.city}</span></p>
        </div>
        <span class="tag-badge ${countryTagClass}">${flag} ${job.country}</span>
      </div>

      <div class="job-tags">
        <span class="tag-badge tag-contract">${job.contract}</span>
        <span class="tag-badge tag-salary">💰 ${job.salary_range}</span>
        <span class="tag-badge" style="background:#f1f5f9;">⏳ Échéance : ${job.deadline}</span>
      </div>

      <p class="job-desc">${job.description}</p>

      <div id="matchBox-${job.id}" class="matching-result-box" style="display:none;"></div>

      <div class="job-actions">
        <button class="btn-secondary" onclick="runMatching('${job.id}')">
          ⚡ Tester Compatibilité IA
        </button>
        <button class="btn-primary" onclick="launchDualAgentApplication('${job.id}')">
          🚀 Générer Candidature Sur-Mesure
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ==================== MATCHING & SCORING ==================== //

async function runMatching(jobId) {
  const matchBox = document.getElementById(`matchBox-${jobId}`);
  matchBox.style.display = 'block';
  matchBox.innerHTML = `<em>Calcul du score de compatibilité par l'IA...</em>`;

  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    const data = await res.json();
    if (data.success) {
      const m = data.match;
      let scoreColor = '#10b981';
      if (m.score < 60) scoreColor = '#f59e0b';

      matchBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div class="score-badge" style="color:${scoreColor};">
            <span>🎯 Adéquation Profil : ${m.score}%</span>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">${m.location_match ? '✅ Ville identique' : 'ℹ️ Mobilité requise'}</span>
        </div>
        <p style="font-size:0.85rem; font-weight:600; margin-bottom:6px;">${m.verdict}</p>
        <div style="font-size:0.8rem; color:#475569;">
          <strong>Points forts :</strong> ${m.matching_skills.join(', ') || 'Bases acquises'}<br>
          ${m.missing_skills.length ? `<strong>Compétences à valoriser dans la lettre :</strong> ${m.missing_skills.join(', ')}` : ''}
        </div>
      `;
    }
  } catch (e) {
    matchBox.innerHTML = `<span style="color:red;">Erreur lors du calcul de compatibilité.</span>`;
  }
}

// ==================== MULTI-AGENTS CANDIDATURE ==================== //

async function launchDualAgentApplication(jobId) {
  const job = currentJobs.find(j => j.id === jobId);
  if (!job) return;

  currentSelectedJob = job;
  document.getElementById('modalJobTitle').textContent = `Candidature : ${job.title}`;
  document.getElementById('modalJobCompany').textContent = `${job.company} — ${job.city}, ${job.country}`;
  
  // Reset affichages modal
  document.getElementById('agent1Status').textContent = "Agent 1 : Analyse de l'offre et alignement des compétences...";
  document.getElementById('agent2Score').textContent = "...";
  document.getElementById('agent2Verdict').textContent = "Agent 2 : En attente du premier jet...";
  document.getElementById('cvPreview').textContent = "Génération du CV par l'Agent 1 en cours...";
  document.getElementById('letterPreview').textContent = "Rédaction de la lettre en cours...";
  
  openModal('applicationModal');

  try {
    const res = await fetch('/api/generate-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    const data = await res.json();

    if (!data.success) {
      if (data.error === 'CREDITS_EXHAUSTED') {
        closeModal('applicationModal');
        openPaymentModal();
        alert(data.message);
        return;
      }
      alert('Erreur lors de la génération : ' + (data.error || 'Veuillez réessayer'));
      return;
    }

    currentGeneratedData = data.result;
    await loadCredits(); // Mettre à jour solde

    // Affichage des résultats du système à double agent
    const review = data.result.pipeline_execution.agent_2_review;
    document.getElementById('agent1Status').textContent = "Agent 1 : Dossier rédigé et perfectionné selon les remarques du DRH.";
    document.getElementById('agent2Score').textContent = review.score_critique;
    document.getElementById('agent2Verdict').textContent = `"${review.verdict_drh}" — ${review.mention}`;

    // Rendu CV
    const cv = data.result.final_output.tailored_cv;
    document.getElementById('cvPreview').innerHTML = `
      <div style="border-bottom: 2px solid var(--primary); padding-bottom: 12px; margin-bottom: 14px;">
        <h2 style="font-size: 1.4rem; color: var(--primary); font-weight:800;">${cv.header.name}</h2>
        <div style="font-weight:700; color:#374151; font-size:1.05rem;">${cv.header.targeted_title}</div>
        <div style="font-size:0.85rem; color:var(--text-muted);">${cv.header.location} | ${cv.header.contact}</div>
      </div>

      <div style="background:#e6f4ea; padding:8px 12px; border-radius:6px; font-size:0.85rem; color:var(--primary); font-weight:600; margin-bottom:14px;">
        🛡️ ${cv.verif_drh_badge}
      </div>

      <p style="font-size:0.9rem; margin-bottom:14px; font-style:italic;">${cv.profile_pitch}</p>

      <strong style="color:var(--primary-dark); font-size:0.9rem; text-transform:uppercase;">Expériences Ciblées pour ce Poste :</strong>
      <div style="margin: 10px 0 16px 0;">
        ${(cv.targeted_experiences || []).map(exp => `
          <div style="margin-bottom:12px;">
            <div style="font-weight:700;">${exp.role} — <span style="color:var(--text-muted);">${exp.company}</span> <small>(${exp.period})</small></div>
            <ul style="margin-left: 20px; font-size:0.85rem; margin-top:4px;">
              ${exp.key_achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <strong style="color:var(--primary-dark); font-size:0.9rem; text-transform:uppercase;">Formation & Diplômes :</strong>
      <p style="font-size:0.85rem; margin-top:4px;">${cv.education}</p>
    `;

    // Rendu Lettre
    document.getElementById('letterPreview').textContent = data.result.final_output.tailored_cover_letter;

    // Charger les questions d'entretien
    loadInterviewPrep(jobId);

  } catch (err) {
    console.error(err);
    alert('Erreur serveur lors de la génération.');
  }
}

async function loadInterviewPrep(jobId) {
  try {
    const res = await fetch('/api/interview-prep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    const data = await res.json();
    if (data.success && data.prep) {
      const container = document.getElementById('interviewQuestionsContainer');
      container.innerHTML = `
        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:14px;">
          L'IA a sélectionné 5 questions décisives spécifiques à ${data.prep.company} et au contexte de ${data.prep.location} :
        </p>
      `;

      data.prep.questions.forEach((q, idx) => {
        const qBox = document.createElement('div');
        qBox.style = "background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px;";
        qBox.innerHTML = `
          <strong style="color:var(--primary); font-size:0.95rem;">Q${idx + 1} (${q.category}) :</strong>
          <p style="font-weight:700; margin:4px 0 8px 0;">${q.question}</p>
          <div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:6px 10px; font-size:0.8rem; margin-bottom:6px;">
            💡 <strong>Conseil Stratégique :</strong> ${q.strategic_tip}
          </div>
          <div style="background:#f1f5f9; padding:8px; border-radius:6px; font-size:0.85rem;">
            🎯 <strong>Modèle de réponse conseillé :</strong> "${q.sample_answer}"
          </div>
        `;
        container.appendChild(qBox);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

// ==================== ACTIONS HUMAN-IN-THE-LOOP ==================== //

function sendWhatsAppApplication() {
  if (!currentSelectedJob || !currentGeneratedData) return;
  const phone = (currentSelectedJob.contact_whatsapp || '').replace(/[^0-9]/g, '');
  const pitch = encodeURIComponent(currentGeneratedData.final_output.whatsapp_pitch);
  
  if (phone) {
    window.open(`https://wa.me/${phone}?text=${pitch}`, '_blank');
  } else {
    // Si aucun numéro WhatsApp spécifié dans l'offre, ouvrir WhatsApp Web pour partage libre
    window.open(`https://wa.me/?text=${pitch}`, '_blank');
  }
}

function sendEmailApplication() {
  if (!currentSelectedJob || !currentGeneratedData) return;
  const email = currentSelectedJob.contact_email || '';
  const subject = encodeURIComponent(currentGeneratedData.final_output.suggested_email_subject);
  const body = encodeURIComponent(currentGeneratedData.final_output.tailored_cover_letter);

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// ==================== AJOUT D'UNE OFFRE LIBRE ==================== //

function openCustomJobModal() {
  openModal('customJobModal');
}

async function submitCustomJob() {
  const title = document.getElementById('customJobTitle').value.trim();
  const company = document.getElementById('customJobCompany').value.trim();
  const country = document.getElementById('customJobCountry').value;
  const city = document.getElementById('customJobCity').value.trim();
  const description = document.getElementById('customJobDesc').value.trim();
  const contact_email = document.getElementById('customJobEmail').value.trim();
  const contact_whatsapp = document.getElementById('customJobWhatsapp').value.trim();

  if (!title || !description) {
    alert("Veuillez renseigner au moins l'intitulé et le texte de l'annonce.");
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
      closeModal('customJobModal');
      await loadJobs();
      // Lancer directement le matching
      runMatching(data.job.id);
    }
  } catch (e) {
    alert("Erreur lors de l'enregistrement de l'offre.");
  }
}

// ==================== PAIEMENT MOBILE MONEY ==================== //

function openPaymentModal() {
  openModal('paymentModal');
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('selected'));
  if (method === 'wave') document.getElementById('methodWave').classList.add('selected');
  if (method === 'orange_money') document.getElementById('methodOM').classList.add('selected');
  if (method === 'mtn_momo') document.getElementById('methodMTN').classList.add('selected');
}

async function executePayment() {
  const phone = document.getElementById('paymentPhone').value.trim();
  if (!phone) {
    alert("Veuillez entrer votre numéro de téléphone Mobile Money.");
    return;
  }

  try {
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packId: selectedPaymentPackId,
        method: selectedPaymentMethod,
        phone: phone
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Paiement de ${data.transaction.amount_fcfa} FCFA validé avec succès par ${data.transaction.method.toUpperCase()} !\nNouveau solde : ${data.new_balance} candidatures.`);
      closeModal('paymentModal');
      await loadCredits();
    } else {
      alert("Échec du paiement : " + data.error);
    }
  } catch (e) {
    alert("Erreur réseau lors de la transaction.");
  }
}

// ==================== UTILS & ONGLETS ==================== //

function switchTab(tab) {
  document.getElementById('tabCvBtn').classList.toggle('active', tab === 'cv');
  document.getElementById('tabLetterBtn').classList.toggle('active', tab === 'letter');
  document.getElementById('tabCoachBtn').classList.toggle('active', tab === 'coach');

  document.getElementById('tabCvContent').style.display = tab === 'cv' ? 'block' : 'none';
  document.getElementById('tabLetterContent').style.display = tab === 'letter' ? 'block' : 'none';
  document.getElementById('tabCoachContent').style.display = tab === 'coach' ? 'block' : 'none';
}

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}
