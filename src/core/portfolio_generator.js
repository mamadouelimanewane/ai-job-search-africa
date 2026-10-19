/**
 * PORTFOLIO GENERATOR — Mini-Site Web Pro en 1 Clic (sunujob.me / /u/:username)
 * ─────────────────────────────────────────────────────────────────────────────
 * Génère instantanément une page web professionnelle ultra-rapide et responsive,
 * optimisée pour être partagée directement sur WhatsApp et LinkedIn.
 */

function generateProfileSlug(name) {
  return (name || 'candidat')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function renderPublicPortfolioHTML(profile, referrals = []) {
  const p = profile || {
    name: "Ibrahima Ndiaye",
    title: "Développeur Web & Mobile Full-Stack",
    city: "Dakar",
    country: "Sénégal",
    education: "Master en Génie Logiciel (ESP Dakar)",
    years_of_experience: 4,
    salary_expectation: "750 000 FCFA net / mois",
    phone: "+221 77 654 32 10",
    email: "ibrahima.ndiaye.dev@gmail.com",
    skills: ["React", "Node.js", "PostgreSQL", "Docker", "API Wave", "API Orange Money"],
    summary: "Développeur Full-Stack passionné avec 4 années d'expérience dans la conception d'applications web et l'intégration de solutions de paiement Mobile Money au Sénégal."
  };

  const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(`Bonjour ${p.name}, j'ai découvert votre profil professionnel sur SunuJob AI et souhaiterais échanger avec vous au sujet d'une opportunité.`);
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} — Profil Professionnel Certifié | SunuJob AI</title>
  <meta name="description" content="${p.title} basé(e) à ${p.city}, ${p.country}. Consultez le profil vérifié, les compétences et contactez directement sur WhatsApp.">
  <!-- OpenGraph pour aperçu WhatsApp riche -->
  <meta property="og:title" content="${p.name} — ${p.title}">
  <meta property="og:description" content="📍 ${p.city}, ${p.country} · ${p.years_of_experience} ans d'expérience · Profil certifié SunuJob AI">
  <meta property="og:type" content="profile">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0a4c3e;
      --primary-light: #10b981;
      --accent: #f59e0b;
      --bg: #091310;
      --card-bg: #11221c;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: rgba(255, 255, 255, 0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
    }
    .portfolio-wrapper {
      width: 100%;
      max-width: 680px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .profile-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      position: relative;
      overflow: hidden;
    }
    .profile-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 5px;
      background: linear-gradient(90deg, var(--primary-light), var(--accent));
    }
    .avatar-wrap {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 18px;
    }
    .avatar {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: white;
      font-size: 2rem;
      font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid rgba(245, 158, 11, 0.4);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }
    .name-heading {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 800;
      color: white;
      margin-bottom: 4px;
    }
    .title-sub {
      font-size: 0.95rem;
      color: var(--accent);
      font-weight: 700;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #86efac;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      margin-top: 6px;
    }
    .meta-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 16px 0;
    }
    .chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .bio-box {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 12px;
      padding: 16px;
      font-size: 0.9rem;
      line-height: 1.6;
      color: #e2e8f0;
      margin-bottom: 20px;
      border-left: 3px solid var(--primary-light);
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 22px;
    }
    .skill-tag {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      border-radius: 16px;
      padding: 5px 14px;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .cta-btn-whatsapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: #25d366;
      color: white;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 1.05rem;
      box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-btn-whatsapp:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px rgba(37, 211, 102, 0.5);
    }
    .referral-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
    }
    .referral-quote {
      font-style: italic;
      font-size: 0.88rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 8px 0;
    }
    .footer-brand {
      text-align: center;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 14px;
    }
  </style>
</head>
<body>
  <div class="portfolio-wrapper">
    <div class="profile-card">
      <div class="avatar-wrap">
        <div class="avatar">${(p.name || 'C').split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
        <div>
          <h1 class="name-heading">${p.name}</h1>
          <div class="title-sub">${p.title}</div>
          <span class="badge-pill">✅ Profil Vérifié SunuJob AI</span>
        </div>
      </div>

      <div class="meta-chips">
        <span class="chip">📍 ${p.city}, ${p.country}</span>
        <span class="chip">🎓 ${p.education}</span>
        <span class="chip">💼 ${p.years_of_experience} ans d'expérience</span>
        <span class="chip">💰 ${p.salary_expectation}</span>
      </div>

      <div class="bio-box">
        ${p.summary}
      </div>

      <h3 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 10px;">
        Compétences Validées
      </h3>
      <div class="skills-grid">
        ${(p.skills || []).map(s => `<span class="skill-tag">✓ ${s}</span>`).join('')}
      </div>

      <a href="${waUrl}" target="_blank" rel="noopener" class="cta-btn-whatsapp">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/>
        </svg>
        Contacter directement sur WhatsApp
      </a>
    </div>

    ${referrals.length > 0 ? `
    <div class="referral-card">
      <h3 style="font-size: 1rem; color: var(--accent); margin-bottom: 10px;">🤝 Recommandations Professionnelles (Piston Digital)</h3>
      ${referrals.map(r => `
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 10px;">
          <div style="font-weight: 700; font-size: 0.9rem;">${r.referrer_name} (${r.referrer_title} · ${r.referrer_company})</div>
          <p class="referral-quote">"${r.text}"</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="footer-brand">
      Propulsé par <strong>SunuJob AI</strong> — L'IA de Recrutement d'Afrique de l'Ouest
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  generateProfileSlug,
  renderPublicPortfolioHTML
};
