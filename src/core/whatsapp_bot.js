/**
 * WHATSAPP BOT ENGINE — Le Compagnon Carrière IA Directement dans WhatsApp
 * ─────────────────────────────────────────────────────────────────────────────
 * Parser de commandes texte/audio, formatage adapté aux écrans mobiles
 * et simulation de chat en direct
 */

const jobAggregator = require('./job_aggregator');
const salaryBenchmark = require('./salary_benchmark');
const concoursTracker = require('./concours_tracker');
const interviewSimulator = require('./interview_simulator');

const BOT_COMMANDS = {
  "JOBS": "Chercher des offres (Ex: JOBS React Dakar ou JOBS Banque Abidjan)",
  "SALAIRE": "Estimer un salaire marché (Ex: SALAIRE Tech Senior Dakar)",
  "CONCOURS": "Voir les concours publics ouverts (Ex: CONCOURS Sénégal ou CONCOURS CI)",
  "ENTRETIEN": "Démarrer une session d'entraînement face à un recruteur virtuel",
  "PROFIL": "Consulter votre profil actif",
  "POSTULER": "Générer votre dossier pour l'offre numéro X (Ex: POSTULER 1)",
  "AIDE": "Afficher ce menu d'aide"
};

function processIncomingMessage(fromNumber, textMessage, profile) {
  const clean = (textMessage || "").trim();
  const parts = clean.split(/\s+/);
  const command = (parts[0] || "").toUpperCase();
  const args = parts.slice(1);

  switch (command) {
    case "AIDE":
    case "MENU":
    case "HELLO":
    case "BONJOUR":
    case "SALUT":
      return {
        reply_type: "text",
        text: generateWelcomeMessage(profile ? profile.name : "Candidat")
      };

    case "JOBS":
    case "EMPLOI":
    case "OFFRES": {
      const query = args.join(' ');
      const allJobs = jobAggregator.getAllJobs();
      const filtered = query
        ? allJobs.filter(j => 
            j.title.toLowerCase().includes(query.toLowerCase()) ||
            j.city.toLowerCase().includes(query.toLowerCase()) ||
            j.country.toLowerCase().includes(query.toLowerCase())
          )
        : allJobs;

      const top3 = filtered.slice(0, 3);
      if (top3.length === 0) {
        return {
          reply_type: "text",
          text: `🔍 Aucune offre trouvée pour "${query}".\n\nEssayez avec un mot-clé plus large comme : *JOBS Dakar*, *JOBS Tech*, ou *JOBS Abidjan*.`
        };
      }

      let responseText = `🎯 *${top3.length} opportunité(s) trouvée(s) pour vous :*\n\n`;
      top3.forEach((j, idx) => {
        responseText += `*${idx + 1}. ${j.title}*\n`;
        responseText += `🏢 ${j.company} — 📍 ${j.city}, ${j.country}\n`;
        responseText += `💰 ${j.salary_range || 'Salaire à négocier'}\n`;
        responseText += `📝 Contrat : ${j.contract}\n`;
        responseText += `👉 Répondez *POSTULER ${idx + 1}* pour générer votre candidature sur-mesure.\n\n`;
      });

      return {
        reply_type: "jobs_list",
        text: responseText.trim(),
        jobs: top3
      };
    }

    case "SALAIRE":
    case "SALAIRES": {
      const sector = args[0] ? (args[0].toLowerCase().includes("tech") ? "Tech & Digital" : "Finance & Banque") : "Tech & Digital";
      const city = args.find(a => ["Dakar", "Abidjan", "Cotonou", "Lomé"].includes(a)) || "Dakar";
      const bench = salaryBenchmark.getSalaryBenchmark(sector, "Confirmé (3-5 ans)", city);

      let txt = `📊 *Baromètre Salaires SunuJob AI*\n\n`;
      txt += `💼 Secteur : *${bench.sector}*\n`;
      txt += `📍 Ville : *${bench.city}* (Confirmé 3-5 ans)\n\n`;
      txt += `🟢 Médiane marché : *${bench.median.toLocaleString('fr-FR')} FCFA net/mois*\n`;
      txt += `📈 Fourchette : ${bench.min.toLocaleString('fr-FR')} - ${bench.max.toLocaleString('fr-FR')} FCFA\n`;
      txt += `🚀 Tendance 12 mois : *${bench.growth_12m}* (${bench.demand_level})\n`;
      txt += `🎁 Avantages fréquents : ${bench.top_perk}`;

      return { reply_type: "salary", text: txt };
    }

    case "CONCOURS": {
      const countryFilter = args.join(' ');
      const upcoming = concoursTracker.getUpcomingDeadlines(60);
      const filtered = countryFilter 
        ? upcoming.filter(c => c.country.toLowerCase().includes(countryFilter.toLowerCase()))
        : upcoming;

      const top3 = filtered.slice(0, 3);
      let txt = `📢 *Concours Fonction Publique en cours :*\n\n`;
      top3.forEach((c, idx) => {
        txt += `*${idx + 1}. ${c.title}*\n`;
        txt += `🏛️ ${c.institution} (${c.country})\n`;
        txt += `⏳ Clôture dans *${c.days_left} jours* (${c.deadline})\n`;
        txt += `👥 Postes ouverts : ${c.positions_count}\n\n`;
      });
      txt += `👉 Répondez *AIDE* pour d'autres options.`;
      return { reply_type: "concours", text: txt };
    }

    case "POSTULER": {
      const offerNum = parseInt(args[0]) || 1;
      return {
        reply_type: "application_ready",
        text: `⚡ *Candidature Préparée avec Succès !*\n\nPour l'offre sélectionnée, notre Double Agent IA a rédigé :\n✅ 1 CV calibré ATS format PDF\n✅ 1 Lettre de motivation personnalisée\n✅ 1 Pitch WhatsApp direct pour le recruteur\n\n📥 Cliquez ici pour télécharger votre dossier complet ou le consulter dans votre espace SunuJob AI web : http://localhost:3000`
      };
    }

    case "PROFIL": {
      if (!profile) return { reply_type: "text", text: "Aucun profil actif. Rendez-vous sur http://localhost:3000 pour le créer en 2 minutes !" };
      let txt = `👤 *Votre Profil Candidat :*\n\n`;
      txt += `*${profile.name}*\n`;
      txt += `💼 ${profile.title}\n`;
      txt += `📍 ${profile.city}, ${profile.country}\n`;
      txt += `🎓 ${profile.education}\n`;
      txt += `💰 Prétentions : ${profile.salary_expectation}\n`;
      txt += `⚡ Compétences : ${(profile.skills || []).slice(0, 5).join(', ')}...`;
      return { reply_type: "profile", text: txt };
    }

    case "ENTRETIEN": {
      return {
        reply_type: "interview_started",
        text: `🎙️ *Simulateur d'Entretien IA Démarré !*\n\nVous êtes face à *Koffi Kouamé (DRH Banque Atlantique Abidjan)*.\n\n*Question 1 :*\n"Parlez-moi de votre parcours et de ce qui vous motive à rejoindre notre institution aujourd'hui ?"\n\n👉 *Répondez directement par message texte ou note vocale pour recevoir l'évaluation immédiate de votre réponse.*`
      };
    }

    default:
      return {
        reply_type: "unknown",
        text: `🤖 Commande non reconnue. Tapez *AIDE* pour voir toutes les commandes possibles, ou écrivez simplement *JOBS* pour voir les offres du moment.`
      };
  }
}

function generateWelcomeMessage(userName = "Candidat") {
  return `👋 *Bienvenue sur SunuJob AI WhatsApp Bot !*\n\n` +
         `Bonjour ${userName}. Je suis votre assistant de carrière autonome pour toute l'Afrique de l'Ouest.\n\n` +
         `Voici ce que je peux faire pour vous 24/7 :\n` +
         `🔍 *JOBS [poste] [ville]* — Trouver les offres fraîches\n` +
         `💰 *SALAIRE [secteur] [ville]* — Baromètre salaires FCFA\n` +
         `📢 *CONCOURS [pays]* — Concours de la fonction publique\n` +
         `🎙️ *ENTRETIEN* — S'entraîner avec un DRH virtuel\n` +
         `👤 *PROFIL* — Voir mon profil actif\n` +
         `📝 *POSTULER [numéro]* — Générer dossier complet\n\n` +
         `_Essayez dès maintenant en écrivant par exemple :_ *JOBS Dakar*`;
}

function simulateBotConversation(scenario = "search_and_apply") {
  const steps = [
    { from: "user", text: "Bonjour !" },
    { from: "bot", text: generateWelcomeMessage("Ibrahima") },
    { from: "user", text: "JOBS Tech Dakar" },
    { 
      from: "bot", 
      text: "🎯 *3 opportunité(s) trouvée(s) pour vous :*\n\n*1. Développeur Full-Stack*\n🏢 Baobab FinTech Solutions — 📍 Dakar, Sénégal\n💰 750 000 - 1 100 000 FCFA net\n📝 Contrat : CDI\n👉 Répondez *POSTULER 1* pour générer votre dossier.\n\n*2. Ingénieur Cloud DevOps*\n🏢 Sahel Data Center — 📍 Dakar, Sénégal\n💰 800 000 - 1 200 000 FCFA net" 
    },
    { from: "user", text: "POSTULER 1" },
    { 
      from: "bot", 
      text: "⚡ *Candidature Prête !*\nLe Double Agent IA a généré votre CV et votre lettre optimisés pour Baobab FinTech. Votre dossier est disponible sur votre espace web !" 
    }
  ];
  return steps;
}

module.exports = {
  processIncomingMessage,
  generateWelcomeMessage,
  simulateBotConversation,
  BOT_COMMANDS
};
