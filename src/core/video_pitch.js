/**
 * VIDEO PITCH — Générateur de Script & Conseils pour Pitch Vidéo 30s
 * ─────────────────────────────────────────────────────────────────────────────
 * Rédige un script de présentation percutant chronométré pour 30 secondes,
 * idéal pour WhatsApp et candidatures vidéo.
 */

function generate30SecVideoScript(profile) {
  const p = profile || {
    name: "Ibrahima Ndiaye",
    title: "Développeur Web & Mobile Full-Stack",
    city: "Dakar",
    years_of_experience: 4,
    skills: ["React", "Node.js", "Docker", "Mobile Money"]
  };

  const topSkills = (p.skills || ['votre spécialité']).slice(0, 3).join(', ');

  const scriptParts = [
    {
      timing: "00:00 - 00:05",
      stage: "Accroche directe",
      script: `« Bonjour, je m'appelle ${p.name}, je suis ${p.title} basé à ${p.city}. »`
    },
    {
      timing: "00:05 - 00:12",
      stage: "Proposition de valeur",
      script: `« Avec ${p.years_of_experience} années d'expérience, j'aide les entreprises à concevoir des solutions performantes et robustes, notamment autour de ${topSkills}. »`
    },
    {
      timing: "00:12 - 00:20",
      stage: "Réalisation probante",
      script: `« Récemment, j'ai piloté l'intégration de flux financiers haute disponibilité qui ont permis de traiter des milliers de transactions sans aucune interruption. »`
    },
    {
      timing: "00:20 - 00:26",
      stage: "Adéquation au poste",
      script: `« Ce qui me passionne dans votre projet, c'est votre ambition d'impact et votre exigence de qualité opérationnelle. »`
    },
    {
      timing: "00:26 - 00:30",
      stage: "Call to Action",
      script: `« Je serais ravi d'échanger avec vous de vive voix ou sur WhatsApp dès cette semaine. Merci ! »`
    }
  ];

  const fullText = scriptParts.map(s => s.script.replace(/[«»]/g, '').trim()).join(' ');

  return {
    candidate_name: p.name,
    job_title: p.title,
    duration_target: "30 secondes chrono",
    word_count: fullText.split(/\s+/).length,
    script_breakdown: scriptParts,
    full_script_text: fullText,
    recording_tips: [
      "📱 Filmez en format vertical (9:16) ou horizontal bien cadré à hauteur des yeux.",
      "💡 Placez-vous face à une fenêtre (lumière naturelle) : évitez le contre-jour.",
      "👔 Tenue professionnelle : chemise repassée ou tenue de ville soignée.",
      "🗣️ Souriez dès la première seconde et parlez avec enthousiasme et énergie.",
      "🔇 Enregistrez dans un endroit calme sans bruits de circulation ni ventilateur bruyant."
    ]
  };
}

module.exports = {
  generate30SecVideoScript
};
