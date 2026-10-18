# Cahier des Charges : Assistant IA de Recherche d'Emploi & Candidature Sur-Mesure (Afrique de l'Ouest)
**Nom de projet (de travail) :** *SunuJob AI / IvoireJob Copilot (ai-job-search-africa)*  
**Zone géographique prioritaire :** Sénégal & Côte d'Ivoire (extension zone UEMOA)  
**Produit de référence :** *AI Job Search* (Mads Lorentzen)  
**Version :** 1.0  
**Date :** Octobre 2026  

---

## 1. Contexte & Analyse du Produit de Référence

Le produit de référence *AI Job Search*, développé par Mads Lorentzen, a rencontré un succès mondial (+51 000 étoiles sur GitHub) en introduisant une rupture par rapport aux outils d'envoi automatique massif (spam) :
1. **Un seul profil maître :** Rempli minutieusement une seule fois.
2. **Matching et scoring :** Notation de compatibilité personnalisée pour chaque offre.
3. **Double agent d'intelligence artificielle :**
   - **Agent Rédacteur :** Rédige un CV et une lettre de motivation sur-mesure pour chaque annonce.
   - **Agent Critique (Recruteur Exigeant) :** Relit, critique sévèrement et exige des corrections avant de valider la version finale.
4. **Préparation d'entretien :** Simulation de questions et coaching personnalisé.
5. **Human-in-the-Loop :** Aucune candidature n'est envoyée à l'aveugle sans validation humaine.

### Inadéquation du modèle scandinave avec l'Afrique de l'Ouest :
- **Barrière technique :** L'outil d'origine nécessite un terminal local (CLI) et Claude Code sur PC. En Afrique, 85 %+ des utilisateurs accèdent à internet via smartphone Android et WhatsApp.
- **Barrière financière :** L'original exige une carte bancaire internationale en dollars pour payer l'API Claude. En zone UEMOA, le standard est le **Mobile Money (Wave, Orange Money, MTN MoMo, Moov)** en FCFA (XOF).
- **Écosystème d'offres :** Les offres au Sénégal et en Côte d'Ivoire sont publiées sur des job boards locaux (EmploiDakar, Senjob, Emploi.ci, RMO) mais aussi massivement sur LinkedIn, Facebook, et dans des groupes WhatsApp.
- **Canaux de candidature :** La majorité des recruteurs locaux attendent un CV envoyé par email avec objet normé ou directement par WhatsApp avec une note de synthèse.

---

## 2. Spécifications Fonctionnelles

### 2.1 Gestion du Profil Candidat Maître
- Importation d'un CV existant (format PDF ou texte) avec extraction automatique.
- Formulaire structuré adapté aux référentiels de diplômes CAMES / ministères (BAC, BTS, Licence, Master, Ingénieur).
- Localisation fine (communes de Dakar : Plateau, Almadies, Mermoz, Guédiawaye, etc. ; communes d'Abidjan : Cocody, Plateau, Yopougon, Marcory, etc.).
- Prétentions salariales mensuelles en **FCFA net**.

### 2.2 Agrégation et Détection d'Offres
- Base d'offres intégrée pour Dakar et Abidjan.
- Outil d'import rapide d'offres libres (copier-coller de posts WhatsApp, Facebook, LinkedIn ou avis de recrutement scannés).
- Filtres avancés par pays, ville, type de contrat (CDI, CDD, Stage, Prestation) et télétravail/présentiel.

### 2.3 Moteur de Matching IA
- Calcul de compatibilité sémantique (0 à 100 %).
- Détection des points forts et des écarts de compétences à combler.

### 2.4 Système Multi-Agents de Candidature Sur-Mesure
- **Agent 1 (Rédacteur Sur-Mesure) :** Génère un CV et une lettre personnalisés reprenant les mots-clés de l'offre et valorisant les réalisations probantes.
- **Agent 2 (Recruteur Critique Ouest-Africain) :** Joue le rôle d'un DRH local exigeant. Analyse la crédibilité, le niveau de diplôme, la courtoisie professionnelle, supprime le remplissage et exige des corrections à l'Agent 1.
- Visualisation interactive du rapport de critique et de la note de qualité attribuée au dossier.

### 2.5 Expédition et Action en 1 Clic
- Générateur de CV au format PDF propre et sobre.
- **Action "Postuler par WhatsApp" :** Ouvre un message WhatsApp formaté avec pitch d'accroche et numéro du recruteur.
- **Action "Postuler par Email" :** Ouvre l'email avec objet normé, corps de lettre et coordonnées complètes.

### 2.6 Simulateur d'Entretien (Interview Coach)
- Génération de 10 questions probables (techniques, mises en situation et prétentions salariales).
- Suggestions de réponses à fort impact et simulations interactives.

### 2.7 Paiements & Modèle Économique Mobile Money
- 2 candidatures gratuites en modèle Freemium.
- Packs de candidatures en FCFA :
  - Pack 3 candidatures : 1 000 FCFA (~1,50 €)
  - Pack 10 candidatures + Coaching entretien : 2 500 FCFA (~3,80 €)
  - Pass Illimité 30 jours : 5 000 FCFA (~7,60 €)
- Intégration Wave, Orange Money et MTN MoMo.
