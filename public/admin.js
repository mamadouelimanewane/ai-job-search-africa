let adminUsers = [];
let adminJobs = [];
let adminTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
  loadAdminData();
  startClock();
});

function startClock() {
  setInterval(() => {
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('lblClock');
    if (clockEl) {
      clockEl.innerText = `Dakar / Abidjan : ${utcHours}:${utcMins} GMT`;
    }
  }, 1000);
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

  const btn = event ? event.currentTarget : document.querySelector(`button[onclick="switchAdminTab('${tabName}')"]`);
  if (btn) btn.classList.add('active');

  const content = document.getElementById(`section-${tabName}`);
  if (content) content.style.display = 'block';
}

async function loadAdminData() {
  try {
    // 1. Charger Stats
    const statsRes = await fetch('/api/admin/stats');
    const statsData = await statsRes.json();
    if (statsData.success) {
      const s = statsData.stats;
      document.getElementById('kpiUsers').innerText = s.users_count;
      document.getElementById('kpiApplications').innerText = s.applications_generated;
      document.getElementById('kpiInterviews').innerText = s.interviews_simulated;
      document.getElementById('kpiRevenue').innerText = s.revenue_fcfa.toLocaleString('fr-FR') + ' F';
      document.getElementById('kpiScams').innerText = s.scams_intercepted;
      document.getElementById('kpiUptime').innerText = s.uptime_percentage;
    }

    // 2. Charger Utilisateurs
    const usersRes = await fetch('/api/admin/users');
    const usersData = await usersRes.json();
    if (usersData.success) {
      adminUsers = usersData.users;
      document.getElementById('tabUsersCount').innerText = adminUsers.length;
      renderUsers(adminUsers);
      renderRecentUsers(adminUsers.slice(0, 5));
    }

    // 3. Charger Offres
    const jobsRes = await fetch('/api/admin/jobs');
    const jobsData = await jobsRes.json();
    if (jobsData.success) {
      adminJobs = jobsData.jobs;
      document.getElementById('tabJobsCount').innerText = adminJobs.length;
      renderJobs(adminJobs);
    }

    // 4. Charger Transactions
    const txRes = await fetch('/api/admin/transactions');
    const txData = await txRes.json();
    if (txData.success) {
      adminTransactions = txData.transactions;
      renderPayments(adminTransactions);
      renderRecentPayments(adminTransactions.slice(0, 5));
    }

    // 5. Charger Paramètres
    const setRes = await fetch('/api/admin/settings');
    const setData = await setRes.json();
    if (setData.success) {
      const cfg = setData.settings;
      if (document.getElementById('cfgPlatformName')) document.getElementById('cfgPlatformName').value = cfg.platform_name || '';
      if (document.getElementById('cfgFreeCredits')) document.getElementById('cfgFreeCredits').value = cfg.free_credits_on_signup || 3;
      if (document.getElementById('cfgCostApp')) document.getElementById('cfgCostApp').value = cfg.credit_cost_application || 1;
      if (document.getElementById('cfgCostInterview')) document.getElementById('cfgCostInterview').value = cfg.credit_cost_interview || 2;
      if (document.getElementById('cfgWhatsappAdmin')) document.getElementById('cfgWhatsappAdmin').value = cfg.notification_whatsapp_admin || '+221774567890';
      if (document.getElementById('cfgSupportEmail')) document.getElementById('cfgSupportEmail').value = cfg.support_email || 'support@sunujob.ai';
    }

  } catch (err) {
    console.error('Erreur chargement données admin:', err);
    showAdminToast('⚠️ Erreur de synchronisation avec le serveur');
  }
}

function renderRecentUsers(users) {
  const tbody = document.getElementById('tblRecentUsers');
  if (!tbody) return;
  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Aucun inscrit pour le moment.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.name)}</strong></td>
      <td>${escapeHtml(u.phone || u.email || 'N/A')}</td>
      <td>${escapeHtml(u.country)} · ${escapeHtml(u.city || '')}</td>
      <td>${escapeHtml(u.target_role)}</td>
      <td><span style="color: #10b981; font-weight: 800;">${u.credits || 0}</span> cr.</td>
      <td><span class="badge-status ${u.status}">${u.status}</span></td>
      <td style="font-size: 0.8rem; color: #64748b;">${formatDate(u.registered_at)}</td>
    </tr>
  `).join('');
}

function renderUsers(users) {
  const tbody = document.getElementById('tblAllUsers');
  if (!tbody) return;
  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Aucun candidat trouvé.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td style="font-family: monospace; font-size: 0.78rem;">${u.id}</td>
      <td><strong>${escapeHtml(u.name)}</strong></td>
      <td>${escapeHtml(u.phone || u.email || 'N/A')}</td>
      <td>${escapeHtml(u.country)} (${escapeHtml(u.city || '')})</td>
      <td>${escapeHtml(u.target_role)}</td>
      <td>
        <span style="color: #10b981; font-weight: 800; font-size: 1rem;">${u.credits || 0}</span>
      </td>
      <td><span class="badge-status ${u.status}">${u.status}</span></td>
      <td style="font-size: 0.8rem; color: #64748b;">${formatDate(u.registered_at)}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-action-sm" onclick="promptAddCredits('${u.id}', '${escapeHtml(u.name)}')">+ Crédits</button>
          <button class="btn-action-sm" onclick="toggleUserStatus('${u.id}')">${u.status === 'actif' ? 'Suspendre' : 'Activer'}</button>
          <button class="btn-action-sm btn-action-danger" onclick="deleteUser('${u.id}')">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterUsersTable() {
  const query = document.getElementById('searchUserInput').value.toLowerCase();
  const filtered = adminUsers.filter(u => 
    u.name.toLowerCase().includes(query) ||
    (u.phone && u.phone.includes(query)) ||
    u.target_role.toLowerCase().includes(query) ||
    u.country.toLowerCase().includes(query)
  );
  renderUsers(filtered);
}

function renderJobs(jobs) {
  const tbody = document.getElementById('tblAllJobs');
  if (!tbody) return;
  if (!jobs || jobs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucune offre disponible.</td></tr>';
    return;
  }
  tbody.innerHTML = jobs.map(j => {
    const isScam = j.is_scam || j.scam_flag;
    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.78rem;">${j.id}</td>
        <td><strong>${escapeHtml(j.title)}</strong></td>
        <td>${escapeHtml(j.company)}</td>
        <td>${escapeHtml(j.country || 'Sénégal')} · ${escapeHtml(j.city || '')}</td>
        <td>${escapeHtml(j.contract || 'CDI')}</td>
        <td style="color: #fbbf24;">${escapeHtml(j.salary_range || 'N/C')}</td>
        <td>
          ${isScam ? 
            '<span class="badge-status suspendu">⚠️ Alerte Fraude</span>' : 
            '<span class="badge-status valide">🛡️ Vérifiée</span>'}
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn-action-sm" onclick="toggleJobVerify('${j.id}')">${isScam ? 'Réhabiliter' : 'Valider'}</button>
            <button class="btn-action-sm btn-action-danger" onclick="deleteJob('${j.id}')">Supprimer</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderRecentPayments(txs) {
  const tbody = document.getElementById('tblRecentPayments');
  if (!tbody) return;
  if (!txs || txs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Aucune transaction enregistrée.</td></tr>';
    return;
  }
  tbody.innerHTML = txs.map(t => `
    <tr>
      <td style="font-family: monospace; font-size: 0.8rem;">${t.id}</td>
      <td><strong>${escapeHtml(t.user_name)}</strong></td>
      <td>${escapeHtml(t.pack)}</td>
      <td><span style="font-weight: 700; color: ${t.method === 'Wave' ? '#38bdf8' : '#fb923c'};">${t.method}</span></td>
      <td><strong>${Number(t.amount_fcfa).toLocaleString('fr-FR')} FCFA</strong></td>
      <td><span class="badge-status ${t.status}">${t.status}</span></td>
      <td style="font-size: 0.8rem; color: #64748b;">${formatDate(t.created_at)}</td>
    </tr>
  `).join('');
}

function renderPayments(txs) {
  const tbody = document.getElementById('tblFullPayments');
  if (!tbody) return;
  if (!txs || txs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucune transaction.</td></tr>';
    return;
  }
  tbody.innerHTML = txs.map(t => `
    <tr>
      <td style="font-family: monospace; font-size: 0.8rem;">${t.id}</td>
      <td><strong>${escapeHtml(t.user_name)}</strong></td>
      <td>${escapeHtml(t.user_phone || 'N/A')}</td>
      <td>${escapeHtml(t.pack)}</td>
      <td><span style="font-weight: 700; color: ${t.method === 'Wave' ? '#38bdf8' : '#fb923c'};">${t.method}</span></td>
      <td><strong style="color: #34d399;">${Number(t.amount_fcfa).toLocaleString('fr-FR')} FCFA</strong></td>
      <td><span class="badge-status ${t.status}">${t.status}</span></td>
      <td style="font-size: 0.8rem; color: #64748b;">${formatDate(t.created_at)}</td>
    </tr>
  `).join('');
}

async function promptAddCredits(userId, userName) {
  const amount = prompt(`Combien de crédits souhaitez-vous attribuer à ${userName} ?`, "5");
  if (!amount || isNaN(amount)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: Number(amount) })
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast(`✅ +${amount} crédits attribués à ${userName}`);
      loadAdminData();
    } else {
      showAdminToast('❌ ' + (data.error || 'Erreur'));
    }
  } catch (e) {
    showAdminToast('❌ Erreur de communication');
  }
}

async function toggleUserStatus(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/toggle`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showAdminToast(`Statut mis à jour : ${data.user.status}`);
      loadAdminData();
    }
  } catch (e) {
    showAdminToast('❌ Erreur');
  }
}

async function deleteUser(userId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
  try {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Utilisateur supprimé avec succès');
      loadAdminData();
    }
  } catch (e) {
    showAdminToast('❌ Erreur');
  }
}

function openAddJobModal() {
  document.getElementById('modalAddJob').style.display = 'flex';
}

function closeAddJobModal() {
  document.getElementById('modalAddJob').style.display = 'none';
}

async function handleAddJobSubmit(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('newJobTitle').value,
    company: document.getElementById('newJobCompany').value,
    country: document.getElementById('newJobCountry').value,
    city: document.getElementById('newJobCity').value,
    contract: document.getElementById('newJobContract').value,
    salary_range: document.getElementById('newJobSalary').value,
    description: document.getElementById('newJobDesc').value
  };

  try {
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast('✅ Offre publiée avec succès');
      closeAddJobModal();
      loadAdminData();
    }
  } catch (e) {
    showAdminToast('❌ Erreur publication offre');
  }
}

async function toggleJobVerify(jobId) {
  try {
    const res = await fetch(`/api/admin/jobs/${jobId}/verify`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Offre validée et sécurisée');
      loadAdminData();
    }
  } catch (e) {
    showAdminToast('❌ Erreur');
  }
}

async function deleteJob(jobId) {
  if (!confirm('Supprimer cette offre ?')) return;
  try {
    const res = await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Offre supprimée');
      loadAdminData();
    }
  } catch (e) {
    showAdminToast('❌ Erreur');
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const payload = {
    platform_name: document.getElementById('cfgPlatformName').value,
    free_credits_on_signup: Number(document.getElementById('cfgFreeCredits').value),
    credit_cost_application: Number(document.getElementById('cfgCostApp').value),
    credit_cost_interview: Number(document.getElementById('cfgCostInterview').value),
    notification_whatsapp_admin: document.getElementById('cfgWhatsappAdmin').value,
    support_email: document.getElementById('cfgSupportEmail').value
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast('💾 Configuration enregistrée avec succès');
    }
  } catch (e) {
    showAdminToast('❌ Erreur enregistrement');
  }
}

function showAdminToast(msg) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(isoStr) {
  if (!isoStr) return '--';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoStr;
  }
}
