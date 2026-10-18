# AI Job Search Africa (SunuJob AI / IvoireJob Copilot) 🌍⚡

> **L'assistant de candidature et de recherche d'emploi propulsé par l'IA, adapté aux réalités du marché de l'Afrique de l'Ouest (Sénégal & Côte d'Ivoire).**  
> *Inspiré du projet open-source mondial « AI Job Search » créé par Mads Lorentzen.*

---

## 🌟 Pourquoi ce projet ?

Le projet original **AI Job Search** a rencontré un succès planétaire (+51 000 étoiles sur GitHub) en introduisant un principe novateur : **au lieu de spammer les recruteurs avec des candidatures automatiques, l'IA agit comme un binôme d'excellence qui rédige un CV et une lettre sur-mesure pour chaque annonce, puis fait relire le tout par un agent critique exigeant.**

Cependant, le modèle d'origine était inadapté au contexte ouest-africain :
1. **Accès technique :** Il s'exécutait en ligne de commande (CLI) sur PC. En Afrique de l'Ouest, plus de 80 % des démarches se font sur **smartphone** et **WhatsApp**.
2. **Paiement :** Il exigeait une clé API facturée en dollars par carte de crédit internationale.
3. **Marché local :** Les offres pour Dakar et Abidjan nécessitent la prise en compte des spécificités locales (diplômes CAMES, SYSCOHADA, grilles de salaires en FCFA net, communication WhatsApp, etc.).

**AI Job Search Africa** résout ces verrous majeurs.

---

## 🚀 Fonctionnalités Clés

* **Profil Candidat Maître Unique :** Le candidat renseigne son parcours, ses réalisations chiffrées et ses compétences une seule fois.
* **Moteur d'Adéquation & Matching (0 à 100 %) :** Analyse sémantique instantanée entre le profil et l'offre d'emploi (détection des forces et des compétences à valoriser).
* **Architecture Multi-Agents (Le cœur de l'innovation) :**
  * **Agent 1 (Rédacteur ATS Sur-Mesure) :** Rédige un CV et une lettre de motivation personnalisés et percutants.
  * **Agent 2 (Le Recruteur Critique Ouest-Africain) :** Joue le rôle d'un DRH exigeant à Dakar ou Abidjan. Il audite le premier jet, attribue une note d'exigence sur 10, pointe les lacunes et exige des corrections à l'Agent 1 avant la validation finale.
* **Actions Human-in-the-Loop en 1 Clic :**
  * 💬 **Postuler par WhatsApp :** Ouvre directement WhatsApp avec le recruteur et un message d'accroche professionnel prérempli.
  * 📧 **Postuler par Email :** Ouvre votre boîte mail avec objet normé, corps de lettre et coordonnées complètes.
  * 🖨️ **Export PDF / Impression propre.**
* **Coach d'Entretien IA :** Génère 5 à 10 questions d'entretien spécifiques à l'offre (questions techniques, mise en situation sous pression, négociation salariale en FCFA net) avec conseils stratégiques et modèles de réponse.
* **Intégration Mobile Money en FCFA (XOF) :**
  * Modèle Freemium (2 candidatures gratuites).
  * Recharges accessibles par **Wave, Orange Money (Sénégal & CI) et MTN MoMo** (ex. 1 000 FCFA pour 3 candidatures sur-mesure).
* **Import d'Offres Libres :** Vous trouvez une offre sur un groupe WhatsApp ou Facebook ? Collez le texte brut et laissez l'IA calibrer votre dossier.

---

## 🛠️ Installation & Démarrage Local

### Prérequis
* **Node.js** (v18 ou version supérieure)
* **npm** ou **yarn**

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration des variables d'environnement (optionnel)
```bash
cp .env.example .env
```
*(L'application intègre un moteur intelligent local procédural qui fonctionne immédiatement sans clé API externe requise).*

### 3. Lancer l'application
```bash
npm start
```
Ouvrez ensuite votre navigateur sur : **[http://localhost:3000](http://localhost:3000)**

---

## 📁 Architecture du Code

```text
ai-job-search-africa/
├── CAHIER_DES_CHARGES.md       # Spécifications détaillées (fonctionnelles & techniques)
├── README.md                   # Documentation générale du projet
├── package.json                # Dépendances Node.js / Express
├── server.js                   # Serveur API REST Express
├── src/
│   ├── core/
│   │   ├── profile.js          # Gestion du profil candidat maître & parsing
│   │   ├── job_aggregator.js   # Moteur d'agrégation d'offres SN & CI
│   │   ├── matching.js         # Moteur de scoring de compatibilité
│   │   ├── dual_agent.js       # Pipeline Multi-Agents (Agent 1 + Agent 2 Critique)
│   │   ├── interview_coach.js  # Coach & simulateur d'entretien d'embauche
│   │   └── payments.js         # Gestion des crédits & passerelles Mobile Money
│   └── data/
│       ├── default_jobs.json   # Base d'offres réalistes (Dakar, Abidjan, Thiès...)
│       └── sample_profiles.json# Profils types (Dev Dakar, Logisticienne Abidjan...)
└── public/
    ├── index.html              # Interface utilisateur responsive & mobile-first
    ├── style.css               # Design system inspiré des applications ouest-africaines
    ├── app.js                  # Logique interactive frontend & gestion des flux
    ├── manifest.json           # Manifest PWA (installable sur mobile)
    └── sw.js                   # Service Worker pour le cache hors-ligne
```

---

## 🌐 Déploiement & Git

Pour pousser sur GitHub sur le compte `@mamadouelimanewane` :
```bash
# 1. Créer le dépôt sur GitHub : https://github.com/new (nom: ai-job-search-africa)
# 2. Pousser les sources :
git push -u origin main
```

---

## 📜 Licence & Crédits
* **Auteur :** Mama Diop / Équipe SunuJob AI
* **Inspiration :** *AI Job Search* par Mads Lorentzen (MIT License).
* **Licence :** MIT
