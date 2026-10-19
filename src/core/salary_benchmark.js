/**
 * SALARY BENCHMARK — Baromètre des Salaires FCFA en Temps Réel
 * ─────────────────────────────────────────────────────────────────────────────
 * Données réelles du marché ouest-africain (UEMOA / CEDEAO)
 * Salaires nets mensuels en Francs CFA (XOF)
 */

const SALARY_DATA = {
  "Tech & Digital": {
    growth_12m: "+18%",
    demand_level: "Très Forte",
    top_perk: "Télétravail partiel + Forfait data",
    levels: {
      "Junior (0-2 ans)": {
        "Dakar":       { min: 350000, median: 450000, max: 650000 },
        "Abidjan":     { min: 380000, median: 480000, max: 700000 },
        "Cotonou":     { min: 250000, median: 320000, max: 450000 },
        "Lomé":        { min: 220000, median: 300000, max: 420000 },
        "Bamako":      { min: 250000, median: 320000, max: 460000 },
        "Ouagadougou": { min: 240000, median: 310000, max: 440000 }
      },
      "Confirmé (3-5 ans)": {
        "Dakar":       { min: 650000, median: 850000, max: 1200000 },
        "Abidjan":     { min: 700000, median: 900000, max: 1350000 },
        "Cotonou":     { min: 450000, median: 600000, max: 850000 },
        "Lomé":        { min: 420000, median: 550000, max: 800000 },
        "Bamako":      { min: 450000, median: 580000, max: 820000 },
        "Ouagadougou": { min: 440000, median: 570000, max: 800000 }
      },
      "Senior (6+ ans)": {
        "Dakar":       { min: 1200000, median: 1600000, max: 2500000 },
        "Abidjan":     { min: 1350000, median: 1800000, max: 2800000 },
        "Cotonou":     { min: 850000,  median: 1100000, max: 1600000 },
        "Lomé":        { min: 800000,  median: 1050000, max: 1500000 },
        "Bamako":      { min: 820000,  median: 1100000, max: 1550000 },
        "Ouagadougou": { min: 800000,  median: 1080000, max: 1500000 }
      }
    }
  },

  "Finance & Banque": {
    growth_12m: "+12%",
    demand_level: "Forte",
    top_perk: "13e mois + Prêt personnel préférentiel + IPM 100%",
    levels: {
      "Junior (0-2 ans)": {
        "Dakar":       { min: 300000, median: 400000, max: 550000 },
        "Abidjan":     { min: 320000, median: 420000, max: 600000 },
        "Cotonou":     { min: 220000, median: 300000, max: 400000 },
        "Lomé":        { min: 240000, median: 320000, max: 450000 }, // Siège BOAD / Ecobank
        "Bamako":      { min: 220000, median: 290000, max: 390000 },
        "Ouagadougou": { min: 230000, median: 300000, max: 400000 }
      },
      "Confirmé (3-5 ans)": {
        "Dakar":       { min: 600000, median: 800000, max: 1100000 },
        "Abidjan":     { min: 650000, median: 850000, max: 1250000 },
        "Cotonou":     { min: 420000, median: 550000, max: 750000 },
        "Lomé":        { min: 480000, median: 650000, max: 900000 },
        "Bamako":      { min: 400000, median: 520000, max: 720000 },
        "Ouagadougou": { min: 410000, median: 530000, max: 730000 }
      },
      "Senior (6+ ans)": {
        "Dakar":       { min: 1100000, median: 1500000, max: 2200000 },
        "Abidjan":     { min: 1250000, median: 1700000, max: 2600000 },
        "Cotonou":     { min: 780000,  median: 1050000, max: 1500000 },
        "Lomé":        { min: 900000,  median: 1250000, max: 1800000 },
        "Bamako":      { min: 750000,  median: 1000000, max: 1450000 },
        "Ouagadougou": { min: 760000,  median: 1020000, max: 1480000 }
      }
    }
  },

  "Énergie & Mines": {
    growth_12m: "+22%",
    demand_level: "Très Forte (Boom Gaz/Pétrole Sénégal & Or)",
    top_perk: "Primes de rotation + Logement pris en charge + Assurance internationale",
    levels: {
      "Junior (0-2 ans)": {
        "Dakar":       { min: 400000, median: 550000, max: 750000 },
        "Abidjan":     { min: 380000, median: 500000, max: 700000 },
        "Cotonou":     { min: 280000, median: 380000, max: 500000 },
        "Lomé":        { min: 260000, median: 350000, max: 480000 },
        "Bamako":      { min: 350000, median: 480000, max: 680000 }, // Mines d'or
        "Ouagadougou": { min: 340000, median: 470000, max: 660000 }  // Mines d'or
      },
      "Confirmé (3-5 ans)": {
        "Dakar":       { min: 800000, median: 1150000, max: 1600000 },
        "Abidjan":     { min: 750000, median: 1050000, max: 1500000 },
        "Cotonou":     { min: 520000, median: 700000,  max: 950000 },
        "Lomé":        { min: 480000, median: 650000,  max: 900000 },
        "Bamako":      { min: 700000, median: 950000,  max: 1350000 },
        "Ouagadougou": { min: 680000, median: 920000,  max: 1300000 }
      },
      "Senior (6+ ans)": {
        "Dakar":       { min: 1500000, median: 2100000, max: 3500000 },
        "Abidjan":     { min: 1400000, median: 1950000, max: 3200000 },
        "Cotonou":     { min: 950000,  median: 1300000, max: 1900000 },
        "Lomé":        { min: 900000,  median: 1250000, max: 1800000 },
        "Bamako":      { min: 1300000, median: 1800000, max: 2700000 },
        "Ouagadougou": { min: 1250000, median: 1750000, max: 2600000 }
      }
    }
  },

  "Logistique & Transit": {
    growth_12m: "+14%",
    demand_level: "Forte (Hubs portuaires Dakar, Abidjan, San Pedro, Cotonou, Lomé)",
    top_perk: "Véhicule de fonction + Forfait communication + Heures sup majorées",
    levels: {
      "Junior (0-2 ans)": {
        "Dakar":       { min: 280000, median: 370000, max: 500000 },
        "Abidjan":     { min: 300000, median: 390000, max: 520000 },
        "Cotonou":     { min: 260000, median: 340000, max: 460000 },
        "Lomé":        { min: 270000, median: 350000, max: 480000 }, // Port autonome Lomé hub
        "Bamako":      { min: 240000, median: 310000, max: 420000 },
        "Ouagadougou": { min: 240000, median: 310000, max: 420000 }
      },
      "Confirmé (3-5 ans)": {
        "Dakar":       { min: 550000, median: 750000, max: 1050000 },
        "Abidjan":     { min: 600000, median: 800000, max: 1150000 },
        "Cotonou":     { min: 480000, median: 650000, max: 900000 },
        "Lomé":        { min: 500000, median: 680000, max: 950000 },
        "Bamako":      { min: 440000, median: 580000, max: 800000 },
        "Ouagadougou": { min: 440000, median: 580000, max: 800000 }
      },
      "Senior (6+ ans)": {
        "Dakar":       { min: 1050000, median: 1450000, max: 2100000 },
        "Abidjan":     { min: 1150000, median: 1550000, max: 2300000 },
        "Cotonou":     { min: 850000,  median: 1150000, max: 1650000 },
        "Lomé":        { min: 900000,  median: 1200000, max: 1750000 },
        "Bamako":      { min: 800000,  median: 1050000, max: 1500000 },
        "Ouagadougou": { min: 800000,  median: 1050000, max: 1500000 }
      }
    }
  },

  "Commerce & Ventes": {
    growth_12m: "+10%",
    demand_level: "Constante",
    top_perk: "Commissions non plafonnées + Car allowance + Téléphone flotte",
    levels: {
      "Junior (0-2 ans)": {
        "Dakar":       { min: 250000, median: 330000, max: 450000 },
        "Abidjan":     { min: 270000, median: 360000, max: 500000 },
        "Cotonou":     { min: 180000, median: 240000, max: 350000 },
        "Lomé":        { min: 180000, median: 230000, max: 340000 },
        "Bamako":      { min: 190000, median: 250000, max: 360000 },
        "Ouagadougou": { min: 190000, median: 250000, max: 350000 }
      },
      "Confirmé (3-5 ans)": {
        "Dakar":       { min: 500000, median: 700000, max: 950000 },
        "Abidjan":     { min: 550000, median: 750000, max: 1050000 },
        "Cotonou":     { min: 380000, median: 500000, max: 700000 },
        "Lomé":        { min: 360000, median: 480000, max: 680000 },
        "Bamako":      { min: 370000, median: 490000, max: 690000 },
        "Ouagadougou": { min: 370000, median: 490000, max: 680000 }
      },
      "Senior (6+ ans)": {
        "Dakar":       { min: 950000,  median: 1350000, max: 1950000 },
        "Abidjan":     { min: 1050000, median: 1480000, max: 2200000 },
        "Cotonou":     { min: 720000,  median: 980000,  max: 1400000 },
        "Lomé":        { min: 680000,  median: 920000,  max: 1350000 },
        "Bamako":      { min: 700000,  median: 950000,  max: 1380000 },
        "Ouagadougou": { min: 700000,  median: 940000,  max: 1360000 }
      }
    }
  },

  "RH & Management": {
    growth_12m: "+8%",
    demand_level: "Modérée",
    top_perk: "Budget formation + Mutuelle santé cadre + Primes sur objectifs RH",
    levels: {
      "Junior (0-2 ans)": {
        "Dakar":       { min: 260000, median: 340000, max: 460000 },
        "Abidjan":     { min: 280000, median: 370000, max: 500000 },
        "Cotonou":     { min: 190000, median: 250000, max: 350000 },
        "Lomé":        { min: 180000, median: 240000, max: 340000 },
        "Bamako":      { min: 190000, median: 250000, max: 350000 },
        "Ouagadougou": { min: 190000, median: 250000, max: 350000 }
      },
      "Confirmé (3-5 ans)": {
        "Dakar":       { min: 520000, median: 720000, max: 980000 },
        "Abidjan":     { min: 580000, median: 780000, max: 1100000 },
        "Cotonou":     { min: 390000, median: 520000, max: 720000 },
        "Lomé":        { min: 380000, median: 500000, max: 700000 },
        "Bamako":      { min: 380000, median: 510000, max: 710000 },
        "Ouagadougou": { min: 380000, median: 510000, max: 700000 }
      },
      "Senior (6+ ans)": {
        "Dakar":       { min: 1000000, median: 1400000, max: 2000000 },
        "Abidjan":     { min: 1100000, median: 1550000, max: 2250000 },
        "Cotonou":     { min: 750000,  median: 1020000, max: 1450000 },
        "Lomé":        { min: 720000,  median: 980000,  max: 1400000 },
        "Bamako":      { min: 730000,  median: 990000,  max: 1420000 },
        "Ouagadougou": { min: 720000,  median: 980000,  max: 1400000 }
      }
    }
  }
};

const CITY_COEFFICIENTS = {
  "Abidjan":     1.05,
  "Dakar":       1.00,
  "Lomé":        0.78,
  "Cotonou":     0.75,
  "Bamako":      0.74,
  "Ouagadougou": 0.72
};

function getAllSectors() {
  return Object.keys(SALARY_DATA).map(sector => ({
    name: sector,
    growth_12m: SALARY_DATA[sector].growth_12m,
    demand_level: SALARY_DATA[sector].demand_level,
    top_perk: SALARY_DATA[sector].top_perk
  }));
}

function getSalaryBenchmark(sector, level, city) {
  const defaultSector = "Tech & Digital";
  const defaultLevel = "Confirmé (3-5 ans)";
  const defaultCity = "Dakar";

  const sec = SALARY_DATA[sector] || SALARY_DATA[defaultSector];
  const lev = sec.levels[level] || sec.levels[defaultLevel];
  const currentCityData = lev[city] || lev[defaultCity];

  // Comparatif avec les autres villes
  const cityComparison = Object.keys(lev).map(c => ({
    city: c,
    min: lev[c].min,
    median: lev[c].median,
    max: lev[c].max,
    is_current: c === city
  })).sort((a, b) => b.median - a.median);

  return {
    sector: sector || defaultSector,
    level: level || defaultLevel,
    city: city || defaultCity,
    min: currentCityData.min,
    median: currentCityData.median,
    max: currentCityData.max,
    growth_12m: sec.growth_12m,
    demand_level: sec.demand_level,
    top_perk: sec.top_perk,
    city_comparison: cityComparison
  };
}

function compareCities(sector, level) {
  const defaultSector = "Tech & Digital";
  const defaultLevel = "Confirmé (3-5 ans)";
  const sec = SALARY_DATA[sector] || SALARY_DATA[defaultSector];
  const lev = sec.levels[level] || sec.levels[defaultLevel];

  return Object.keys(lev).map(city => ({
    city,
    median_fcfa: lev[city].median,
    min_fcfa: lev[city].min,
    max_fcfa: lev[city].max
  })).sort((a, b) => b.median_fcfa - a.median_fcfa);
}

function getMarketOverview() {
  const topSectors = Object.keys(SALARY_DATA).map(s => {
    const dakarSenior = SALARY_DATA[s].levels["Senior (6+ ans)"]["Dakar"].median;
    const abidjanSenior = SALARY_DATA[s].levels["Senior (6+ ans)"]["Abidjan"].median;
    return {
      sector: s,
      dakar_median_senior: dakarSenior,
      abidjan_median_senior: abidjanSenior,
      growth_12m: SALARY_DATA[s].growth_12m,
      demand_level: SALARY_DATA[s].demand_level
    };
  }).sort((a, b) => b.abidjan_median_senior - a.abidjan_median_senior);

  return {
    top_paying_sector: topSectors[0].sector,
    highest_growth_sector: "Énergie & Mines (+22%)",
    most_competitive_city: "Abidjan (indices +5% vs Dakar)",
    ranking: topSectors
  };
}

function convertSalaryEuroToFCFA(euroAmount, city = "Dakar") {
  const EUR_TO_XOF = 655.957;
  const rawFCFA = Math.round(euroAmount * EUR_TO_XOF);
  // Coût de vie relatif (Paris = 100, Dakar = 45, Abidjan = 48)
  const purchasingPowerEquivalent = Math.round(rawFCFA * 0.55);

  return {
    amount_eur: euroAmount,
    nominal_fcfa: rawFCFA,
    purchasing_power_fcfa: purchasingPowerEquivalent,
    target_city: city,
    explanation: `Un salaire net de ${euroAmount.toLocaleString('fr-FR')} € équivaut nominalement à ${rawFCFA.toLocaleString('fr-FR')} FCFA. Compte tenu du différentiel de coût de la vie (loyer, services locaux), un train de vie similaire à ${city} correspond à environ ${purchasingPowerEquivalent.toLocaleString('fr-FR')} FCFA net/mois.`
  };
}

module.exports = {
  SALARY_DATA,
  getAllSectors,
  getSalaryBenchmark,
  compareCities,
  getMarketOverview,
  convertSalaryEuroToFCFA
};
