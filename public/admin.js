/* ============================================================
   admin.js — Back-Office SunuJob AI
   Gestion : Login, Utilisateurs, Offres, Transactions, IA, Paramètres
   ============================================================ */

const ADMIN_PWD_KEY = 'sunujob_admin_pwd';
const DEFAULT_PWD   = 'admin2026';
let adminUsers = [], adminJobs = [], adminTx = [];
let autoRefreshTimer = null;

/* ===== DÉMARRAGE ===== */
document.addEventListener('DOMContentLoaded', () => {
  checkLoginState();
  startClock();
});

/* ===== HORLOGE ===== */
function startClock() {
  const update = () => {
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2,'0');
    const mm = String(now.getUTCMinutes()).padStart(2,'0');
    const el = document.getElementById('adminClock');
    if (el) el.innerText = `Dakar / Abidjan : ${hh}:${mm} GMT`;
  };
  update();
  setInterval(update, 1000);
}

/* ===== AUTHENTIFICATION ===== */
function checkLoginState() {
  const stored = localStorage.getItem(ADMIN_PWD_KEY);
  const expected = localStorage.getItem('sunujob_admin_custom_pwd') || DEFAULT_PWD;
  if (stored === expected) {
    showAdminShell();
  }
  // Sinon on reste sur la page de login
}

function doLogin() {
  const pwd = document.getElementById('loginPwd').value;
  const expected = localStorage.getItem('sunujob_admin_custom_pwd') || DEFAULT_PWD;
  const errEl = document.getElementById('loginError');

  if (pwd === expected) {
    localStorage.setItem(ADMIN_PWD_KEY, pwd);
    errEl.style.display = 'none';
    showAdminShell();
  } else {
    errEl.style.display = 'block';
    document.getElementById('loginPwd').value = '';
  }
}

function doLogout() {
  localStorage.removeItem(ADMIN_PWD_KEY);
  document.getElementById('adminShell').style.display = 'none';
  document.getElementById('loginGate').style.display  = 'flex';
  document.getElementById('loginPwd').value = '';
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
}

function showAdminShell() {
  document.getElementById('loginGate').style.display  = 'none';
  document.getElementById('adminShell').style.display = 'block';
  loadAdminData();
  // Auto-refresh toutes les 60 secondes
  autoRefreshTimer = setInterval(loadAdminData, 60000);
}

function changePwd() {
  const np = (document.getElementById('newPwd')?.value || '').trim();
  const cp = (document.getElementById('confirmPwd')?.value || '').trim();
  if (!np) { toast('⚠️ Saisissez un nouveau mot de passe', true); return; }
  if (np !== cp) { toast('❌ Les mots de passe ne correspondent pas', true); return; }
  localStorage.setItem('sunujob_admin_custom_pwd', np);
  localStorage.setItem(ADMIN_PWD_KEY, np);
  toast('🔐 Mot de passe mis à jour avec succès');
  document.getElementById('newPwd').value = '';
  document.getElementById('confirmPwd').value = '';
}

/* ===== NAVIGATION PAR ONGLETS ===== */
function switchTab(name, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-section').forEach(s => s.style.display = 'none');
  if (btn) btn.classList.add('active');
  const sec = document.getElementById('sec-' + name);
  if (sec) sec.style.display = 'block';
}

/* ===== CHARGEMENT GLOBAL DES DONNÉES ===== */
async function loadAdminData() {
  try {
    await Promise.all([loadStats(), loadUsers(), loadJobs(), loadTransactions(), loadSettings()]);
  } catch (err) {
    console.error('Erreur chargement admin:', err);
    toast('⚠️ Synchronisation serveur impossible', true);
  }
}

async function loadStats() {
  const r = await fetch('/api/admin/stats');
  const d = await r.json();
  if (!d.success) return;
  const s = d.stats;

  setText('kpiUsers', s.users_count);
  setText('kpiApps', s.applications_generated);
  setText('kpiInterviews', s.interviews_simulated);
  setText('kpiRevenue', Number(s.revenue_fcfa).toLocaleString('fr-FR') + ' F');
  setText('kpiScams', s.scams_intercepted);
  setText('kpiUptime', s.uptime_percentage || '99.9%');
  setText('kpiRespTime', 'Réponse : ' + (s.avg_ai_response_time || '~1.4s'));
  setText('scamShieldCount', s.scams_intercepted + ' arnaques bloquées');
  setText('revTotalDisplay', Number(s.revenue_fcfa).toLocaleString('fr-FR') + ' FCFA');

  // Progress jobs sécurité
  const pct = s.active_jobs_count > 0
    ? Math.round((s.verified_jobs_count / s.active_jobs_count) * 100)
    : 0;
  setText('progJobsVal', pct + '%');
  const pjEl = document.getElementById('progJobs');
  if (pjEl) pjEl.style.width = pct + '%';

  // Sparkline (mini barres aléatoires décoratives)
  buildSparkline('sparkUsers', s.users_count);

  // Wave / OM share from transactions
  updatePaymentShare();
}

async function loadUsers() {
  const r = await fetch('/api/admin/users');
  const d = await r.json();
  if (!d.success) return;
  adminUsers = d.users;
  setText('cntUsers', adminUsers.length);
  renderUsersTable(adminUsers);
  renderRecentUsers(adminUsers.slice(0, 5));
}

async function loadJobs() {
  const r = await fetch('/api/admin/jobs');
  const d = await r.json();
  if (!d.success) return;
  adminJobs = d.jobs;
  setText('cntJobs', adminJobs.length);
  renderJobsTable(adminJobs);
}

async function loadTransactions() {
  const r = await fetch('/api/admin/transactions');
  const d = await r.json();
  if (!d.success) return;
  adminTx = d.transactions;
  setText('cntPayments', adminTx.length);
  renderPaymentsTable(adminTx);
  renderRecentPayments(adminTx.slice(0, 5));
}

async function loadSettings() {
  const r = await fetch('/api/admin/settings');
  const d = await r.json();
  if (!d.success) return;
  const c = d.settings;
  setVal('cfgName',         c.platform_name || 'SunuJob AI / IvoireJob');
  setVal('cfgFreeCredits',  c.free_credits_on_signup || 3);
  setVal('cfgCostApp',      c.credit_cost_application || 1);
  setVal('cfgCostInterview',c.credit_cost_interview || 2);
  setVal('cfgWA',           c.notification_whatsapp_admin || '');
  setVal('cfgEmail',        c.support_email || '');
}

/* ===== RENDU TABLEAUX ===== */
function renderRecentUsers(users) {
  const el = document.getElementById('tblRecUsers');
  if (!el) return;
  if (!users?.length) { el.innerHTML = emptyRow(7, 'Aucun candidat enregistré.'); return; }
  el.innerHTML = users.map(u => `
    <tr>
      <td><strong>${esc(u.name)}</strong></td>
      <td>${esc(u.phone || u.email || '—')}</td>
      <td>${esc(u.country)} · ${esc(u.city || '—')}</td>
      <td>${esc(u.target_role)}</td>
      <td><span style="color:var(--green);font-weight:800">${u.credits||0}</span> cr.</td>
      <td>${statusBadge(u.status)}</td>
      <td style="color:var(--muted);font-size:.78rem">${fmtDate(u.registered_at)}</td>
    </tr>`).join('');
}

function renderUsersTable(users) {
  const el = document.getElementById('tblUsers');
  if (!el) return;
  if (!users?.length) { el.innerHTML = emptyRow(9, 'Aucun candidat trouvé.'); return; }
  el.innerHTML = users.map(u => `
    <tr>
      <td style="font-family:monospace;font-size:.76rem;color:var(--muted)">${u.id}</td>
      <td><strong>${esc(u.name)}</strong></td>
      <td>${esc(u.phone || u.email || '—')}</td>
      <td>${esc(u.country)} (${esc(u.city||'—')})</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.target_role)}</td>
      <td><span style="color:var(--green);font-weight:800;font-size:1rem">${u.credits||0}</span></td>
      <td>${statusBadge(u.status)}</td>
      <td style="color:var(--muted);font-size:.78rem">${fmtDate(u.registered_at)}</td>
      <td>
        <div class="btn-row">
          <button class="btn-sm" onclick="addCreditsPrompt('${u.id}','${esc(u.name)}')">+ Crédits</button>
          <button class="btn-sm" onclick="toggleUser('${u.id}')">${u.status==='actif'?'Suspendre':'Activer'}</button>
          <button class="btn-sm danger" onclick="removeUser('${u.id}')">✕</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterUsers() {
  const q = document.getElementById('searchUser').value.toLowerCase();
  renderUsersTable(adminUsers.filter(u =>
    u.name.toLowerCase().includes(q) ||
    (u.phone||'').includes(q) ||
    (u.email||'').toLowerCase().includes(q) ||
    u.target_role.toLowerCase().includes(q) ||
    u.country.toLowerCase().includes(q)
  ));
}

function renderJobsTable(jobs) {
  const el = document.getElementById('tblJobs');
  if (!el) return;
  if (!jobs?.length) { el.innerHTML = emptyRow(8, 'Aucune offre.'); return; }
  el.innerHTML = jobs.map(j => {
    const scam = j.is_scam || j.scam_flag;
    return `
    <tr>
      <td style="font-family:monospace;font-size:.76rem;color:var(--muted)">${j.id}</td>
      <td><strong>${esc(j.title)}</strong></td>
      <td>${esc(j.company)}</td>
      <td>${esc(j.country||'Sénégal')} · ${esc(j.city||'—')}</td>
      <td><span class="badge ${j.contract==='CDI'?'badge-green':'badge-blue'}">${esc(j.contract||'CDI')}</span></td>
      <td style="color:#fbbf24">${esc(j.salary_range||'N/C')}</td>
      <td>${scam
        ? '<span class="badge badge-red">⚠️ Fraude</span>'
        : '<span class="badge badge-green">🛡️ Vérifiée</span>'}</td>
      <td>
        <div class="btn-row">
          <button class="btn-sm" onclick="verifyJob('${j.id}')">${scam?'Réhabiliter':'Valider'}</button>
          <button class="btn-sm danger" onclick="removeJob('${j.id}')">Supprimer</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterJobs() {
  const q = document.getElementById('searchJob').value.toLowerCase();
  renderJobsTable(adminJobs.filter(j =>
    j.title.toLowerCase().includes(q) ||
    j.company.toLowerCase().includes(q) ||
    (j.city||'').toLowerCase().includes(q) ||
    (j.country||'').toLowerCase().includes(q)
  ));
}

function renderRecentPayments(txs) {
  const el = document.getElementById('tblRecPayments');
  if (!el) return;
  if (!txs?.length) { el.innerHTML = emptyRow(7, 'Aucune transaction.'); return; }
  el.innerHTML = txs.map(t => txRow(t, false)).join('');
}

function renderPaymentsTable(txs) {
  const el = document.getElementById('tblPayments');
  if (!el) return;
  if (!txs?.length) { el.innerHTML = emptyRow(8, 'Aucune transaction.'); return; }
  el.innerHTML = txs.map(t => txRow(t, true)).join('');
}

function txRow(t, showPhone) {
  const color = t.method === 'Wave' ? '#38bdf8' : '#fb923c';
  return `
    <tr>
      <td style="font-family:monospace;font-size:.78rem">${t.id}</td>
      <td><strong>${esc(t.user_name)}</strong></td>
      ${showPhone ? `<td>${esc(t.user_phone||'—')}</td>` : ''}
      <td>${esc(t.pack)}</td>
      <td><span style="font-weight:700;color:${color}">${t.method}</span></td>
      <td><strong style="color:var(--green2)">${Number(t.amount_fcfa).toLocaleString('fr-FR')} F</strong></td>
      <td>${statusBadge(t.status)}</td>
      <td style="color:var(--muted);font-size:.78rem">${fmtDate(t.created_at)}</td>
    </tr>`;
}

function updatePaymentShare() {
  if (!adminTx.length) return;
  const waveTotal = adminTx.filter(t => t.method==='Wave').reduce((s,t)=>s+t.amount_fcfa,0);
  const total     = adminTx.reduce((s,t)=>s+t.amount_fcfa,0);
  if (!total) return;
  const wavePct = Math.round((waveTotal/total)*100);
  const omPct   = 100 - wavePct;
  setText('waveShare', wavePct + '%');
  setText('omShare',   omPct  + '%');
  const pw = document.getElementById('progWave'); if (pw) pw.style.width = wavePct + '%';
  const po = document.getElementById('progOM');   if (po) po.style.width = omPct   + '%';
}

/* ===== ACTIONS CANDIDATS ===== */
async function addCreditsPrompt(id, name) {
  const n = prompt(`Crédits à attribuer à ${name} :`, '5');
  if (!n || isNaN(n)) return;
  const r = await fetch(`/api/admin/users/${id}/credits`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ delta: Number(n) })
  });
  const d = await r.json();
  if (d.success) { toast(`✅ +${n} crédits → ${name}`); loadUsers(); }
  else toast('❌ ' + (d.error||'Erreur'), true);
}

async function toggleUser(id) {
  const r = await fetch(`/api/admin/users/${id}/toggle`, { method:'POST' });
  const d = await r.json();
  if (d.success) { toast(`Statut : ${d.user.status}`); loadUsers(); }
  else toast('❌ Erreur', true);
}

async function removeUser(id) {
  if (!confirm('Supprimer ce candidat définitivement ?')) return;
  const r = await fetch(`/api/admin/users/${id}`, { method:'DELETE' });
  const d = await r.json();
  if (d.success) { toast('Candidat supprimé'); loadUsers(); loadStats(); }
  else toast('❌ ' + (d.error||'Erreur'), true);
}

/* ===== ACTIONS OFFRES ===== */
async function verifyJob(id) {
  const r = await fetch(`/api/admin/jobs/${id}/verify`, { method:'POST' });
  const d = await r.json();
  if (d.success) { toast('🛡️ Offre sécurisée'); loadJobs(); }
  else toast('❌ Erreur', true);
}

async function removeJob(id) {
  if (!confirm('Supprimer cette offre ?')) return;
  const r = await fetch(`/api/admin/jobs/${id}`, { method:'DELETE' });
  const d = await r.json();
  if (d.success) { toast('Offre supprimée'); loadJobs(); loadStats(); }
  else toast('❌ Erreur', true);
}

/* ===== SOUMISSIONS MODAUX ===== */
async function submitUser(e) {
  e.preventDefault();
  const payload = {
    name:             document.getElementById('uName').value,
    phone:            document.getElementById('uPhone').value,
    email:            document.getElementById('uEmail').value,
    country:          document.getElementById('uCountry').value,
    city:             document.getElementById('uCity').value,
    experience_level: document.getElementById('uLevel').value,
    target_role:      document.getElementById('uRole').value
  };
  const r = await fetch('/api/auth/register', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if (d.success) {
    toast('✅ ' + d.message);
    closeModal('modalUser');
    e.target.reset();
    loadUsers(); loadStats();
  } else toast('❌ ' + (d.error||'Erreur inscription'), true);
}

async function submitJob(e) {
  e.preventDefault();
  const payload = {
    title:        document.getElementById('jTitle').value,
    company:      document.getElementById('jCompany').value,
    contract:     document.getElementById('jContract').value,
    country:      document.getElementById('jCountry').value,
    city:         document.getElementById('jCity').value,
    salary_range: document.getElementById('jSalary').value,
    deadline:     document.getElementById('jDeadline').value,
    contact_email:document.getElementById('jEmail').value,
    description:  document.getElementById('jDesc').value
  };
  const r = await fetch('/api/admin/jobs', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if (d.success) {
    toast('📤 Offre publiée avec succès');
    closeModal('modalJob');
    e.target.reset();
    loadJobs(); loadStats();
  } else toast('❌ Erreur publication', true);
}

async function submitPayment(e) {
  e.preventDefault();
  const payload = {
    user_name:   document.getElementById('pName').value,
    user_phone:  document.getElementById('pPhone').value,
    pack:        document.getElementById('pPack').value,
    method:      document.getElementById('pMethod').value,
    amount_fcfa: Number(document.getElementById('pAmount').value),
    reference:   document.getElementById('pRef').value,
    status:      'valide'
  };
  const r = await fetch('/api/admin/transactions', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if (d.success) {
    toast('✅ Paiement enregistré — ' + Number(payload.amount_fcfa).toLocaleString('fr-FR') + ' FCFA');
    closeModal('modalPayment');
    e.target.reset();
    loadTransactions(); loadStats();
  } else toast('❌ Erreur enregistrement', true);
}

async function saveSettings(e) {
  e.preventDefault();
  const payload = {
    platform_name:             getVal('cfgName'),
    free_credits_on_signup:    Number(getVal('cfgFreeCredits')),
    credit_cost_application:   Number(getVal('cfgCostApp')),
    credit_cost_interview:     Number(getVal('cfgCostInterview')),
    notification_whatsapp_admin: getVal('cfgWA'),
    support_email:             getVal('cfgEmail'),
    ai_provider:               getVal('cfgAIProvider') || 'gemini-1.5-pro',
    maintenance_mode:          getVal('cfgMaintenance') === 'true'
  };
  const r = await fetch('/api/admin/settings', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if (d.success) toast('💾 Configuration sauvegardée');
  else toast('❌ Erreur sauvegarde', true);
}

/* ===== EXPORT CSV ===== */
function exportUsersCSV() {
  const header = 'ID,Nom,Téléphone,Email,Pays,Ville,Poste visé,Crédits,Statut,Date inscription';
  const rows   = adminUsers.map(u =>
    [u.id, u.name, u.phone||'', u.email||'', u.country, u.city||'', u.target_role,
     u.credits||0, u.status, u.registered_at].map(csvCell).join(',')
  );
  downloadCSV('candidats_sunujob_' + today() + '.csv', [header, ...rows].join('\n'));
}

function exportPaymentsCSV() {
  const header = 'ID,Client,Téléphone,Pack,Méthode,Montant FCFA,Statut,Date';
  const rows   = adminTx.map(t =>
    [t.id, t.user_name, t.user_phone||'', t.pack, t.method,
     t.amount_fcfa, t.status, t.created_at].map(csvCell).join(',')
  );
  downloadCSV('transactions_sunujob_' + today() + '.csv', [header, ...rows].join('\n'));
}

function csvCell(v) {
  const s = String(v ?? '').replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

function downloadCSV(filename, content) {
  const blob = new Blob(['\ufeff' + content], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('📥 Export CSV prêt : ' + filename);
}

function today() {
  return new Date().toISOString().slice(0,10).replace(/-/g,'');
}

/* ===== JOURNAL IA ===== */
function refreshAILog() {
  const now = new Date();
  const ts  = now.toISOString().replace('T',' ').slice(0,19);
  const entries = [
    `[${ts}] Agent-1 : Nouveau CV généré pour offre CUSTOM-${Math.floor(Math.random()*9000+1000)} — Score ATS : ${80+Math.floor(Math.random()*18)}% ✅`,
    `[${ts}] Radar Web : ${1+Math.floor(Math.random()*5)} nouvelles offres agrégées (EmploiDakar, Emploi.sn)`,
    `[${ts}] Scam Shield : Analyse de ${3+Math.floor(Math.random()*10)} annonces — 0 fraude détectée ✅`,
    `[${ts}] Agent-3 : Simulation entretien — note ${14+Math.floor(Math.random()*7)}/20`
  ];
  const log = document.getElementById('aiLog');
  if (log) {
    const newLine = document.createElement('div');
    newLine.style.color = '#34d399';
    newLine.innerText = entries[Math.floor(Math.random()*entries.length)];
    log.prepend(newLine);
    toast('🤖 Journal IA actualisé');
  }
}

/* ===== MODAUX ===== */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ===== SPARKLINE ===== */
function buildSparkline(containerId, total) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const vals = Array.from({length:7}, (_, i) => Math.max(10, Math.round((total / 7) * (0.5 + Math.random()))));
  const max  = Math.max(...vals);
  el.innerHTML = vals.map(v =>
    `<div class="spark-bar" style="height:${Math.round((v/max)*100)}%"></div>`
  ).join('');
}

/* ===== UTILITAIRES ===== */
function toast(msg, isError=false) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerText = msg;
  el.className = 'toast' + (isError ? ' error' : '');
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3800);
}

function statusBadge(status) {
  if (status === 'actif' || status === 'valide')
    return '<span class="badge badge-green">' + status + '</span>';
  if (status === 'suspendu' || status === 'fraude')
    return '<span class="badge badge-red">' + status + '</span>';
  return '<span class="badge badge-amber">' + (status||'inconnu') + '</span>';
}

function emptyRow(cols, msg) {
  return `<tr><td colspan="${cols}" style="text-align:center;color:var(--muted);padding:24px">${msg}</td></tr>`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  } catch { return iso; }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
