(function exposeCaidaFacts(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CAIDA_FACTS = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCaidaFacts() {
  "use strict";

  const DATA_STAND = "27.08.2026";
  const COMMON_OFFER_TERMS = "Unverbindlich empfohlener Aktionspreis ab Importlager und solange der Vorrat reicht, zuzüglich Überführungskosten; Metallic- und weitere Sonderlackierungen können Aufpreis kosten.";

  const MODELS = {
    asx: {
      id: "asx",
      name: "ASX",
      label: "Kompakter SUV",
      price: "22.390 €",
      drive: "Benzin, Mildhybrid oder Hybrid",
      efficiency: "Hybrid: 4,3–4,4 l/100 km",
      co2: "CO₂-Klasse C (Hybrid)",
      promotion: { listPrice: "25.390 €", discount: "3.000 €", variant: "ASX Diamant 1.2 Turbo 84 kW (115 PS) 6-Gang" },
      verifiedFacts: [
        "Hybrid: 116 kW (158 PS) Systemleistung, 4,4 l/100 km und CO₂-Klasse C je nach Variante",
        "4,23 m lang, knapp 1,80 m breit und 1,57 m hoch",
        "Google built-in und MI-PILOT bis 160 km/h sind ausstattungsabhängig erhältlich"
      ],
      source: "https://www.mitsubishi-motors.de/asx",
      sources: ["https://www.mitsubishi-motors.de/asx/antriebe", "https://www.mitsubishi-motors.de/asx/design"]
    },
    grandis: {
      id: "grandis",
      name: "GRANDIS",
      label: "Familien-SUV",
      price: "26.390 €",
      drive: "Mildhybrid oder Vollhybrid",
      efficiency: "Hybrid: 4,3–4,4 l/100 km",
      co2: "CO₂-Klasse C (Hybrid)",
      promotion: { listPrice: "29.390 €", discount: "3.000 €", variant: "GRANDIS Mildhybrid Diamant 1.3 Turbo 104 kW (140 PS) 6-Gang" },
      verifiedFacts: [
        "Als Familienauto mit großzügigem Innenraum positioniert",
        "Der Vollhybrid erlaubt laut Mitsubishi rein elektrisches Fahren; eine elektrische Reichweite ist nicht angegeben",
        "Mildhybrid: 5,9–6,1 l/100 km und CO₂-Klasse D–E; Hybrid: 4,3–4,4 l/100 km und CO₂-Klasse C"
      ],
      source: "https://www.mitsubishi-motors.de/grandis",
      sources: ["https://www.mitsubishi-motors.de/grandis/varianten-preise"]
    },
    eclipse: {
      id: "eclipse",
      name: "ECLIPSE CROSS",
      label: "Elektro-SUV",
      price: "43.990 €",
      drive: "Vollelektrisch",
      efficiency: "16,7–17,1 kWh/100 km",
      co2: "CO₂-Klasse A",
      promotion: { listPrice: "47.990 €", discount: "4.000 €", variant: "ECLIPSE CROSS Diamant PLUS 87 kWh (11 kW) Automatik" },
      verifiedFacts: [
        "87-kWh-Langstreckenbatterie mit bis zu 627 km elektrischer WLTP-Reichweite",
        "160 kW (218 PS) und 300 Nm",
        "11 kW AC serienmäßig, 22 kW AC optional und bis zu 150 kW DC"
      ],
      source: "https://www.mitsubishi-motors.de/eclipse-cross",
      sources: ["https://www.mitsubishi-motors.de/eclipse-cross/technik"]
    },
    outlander: {
      id: "outlander",
      name: "OUTLANDER",
      label: "Plug-in-Hybrid SUV",
      price: "39.990 €",
      drive: "Plug-in Hybrid · 4WD",
      efficiency: "16–19,1 kWh + 2,6–2,7 l/100 km",
      co2: "CO₂-Klasse B gewichtet",
      promotion: { listPrice: "49.990 €", discount: "10.000 €", variant: "OUTLANDER Plug-in Hybrid Diamant 2.4 Benziner 100 kW (136 PS) 4WD" },
      verifiedFacts: [
        "22,7-kWh-Fahrbatterie, bis zu 85 km elektrische WLTP-Reichweite und bis zu 834 km Gesamtreichweite mit voller Batterie und Tankfüllung",
        "225 kW (306 PS) Systemleistung und serienmäßiger Allradantrieb",
        "Ca. 10 Stunden an separat abgesicherter 230-V-/10-A-Haushaltssteckdose, ca. 6,5 Stunden bei 230 V/16 A und ca. 32 Minuten Schnellladung bis 80 Prozent",
        "5 Sitzplätze und bis zu 495 Liter Kofferraumvolumen hinter der zweiten Sitzreihe"
      ],
      source: "https://www.mitsubishi-motors.de/outlander-plug-in-hybrid",
      sources: ["https://www.mitsubishi-motors.de/outlander-plug-in-hybrid/technik"]
    },
    colt: {
      id: "colt",
      name: "COLT",
      label: "Kleinwagen · Auslaufmodell",
      price: "19.690 €*",
      drive: "Benzin oder Hybrid",
      efficiency: "Hybrid: 4,2–4,3 l/100 km",
      co2: "CO₂-Klasse C (Hybrid)",
      promotion: null,
      verifiedFacts: ["Regulär nicht mehr als Neuwagen konfigurierbar; mögliche Tages- oder Kurzzulassungen nur über Händler prüfen"],
      source: "https://www.mitsubishi-motors.de/colt",
      sources: []
    }
  };

  return { COMMON_OFFER_TERMS, DATA_STAND, MODELS };
});
