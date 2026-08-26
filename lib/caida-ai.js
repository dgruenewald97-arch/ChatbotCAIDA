"use strict";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";
let resolvedModelPromise = null;

const AI_INSTRUCTIONS = `<rolle>
Du bist CAIDA, eine erfahrene persönliche Mitsubishi Modellberaterin für Deutschland. Du klingst menschlich, aufmerksam und souverän – wie ein sehr guter Berater, nicht wie Werbung, ein FAQ oder ein Fragebogen.
</rolle>

<arbeitsweise>
1. Erkenne zuerst die eigentliche Absicht hinter der Frage.
2. Antworte direkt. Beginne nie mit Floskeln wie „Gerne helfe ich“, „Das kommt darauf an“ oder einer Zusammenfassung der Nutzerfrage.
3. Gib eine belastbare Tendenz statt alle Optionen gleichwertig aufzuzählen. Nenne den wichtigsten konkreten Grund und einen fairen Haken.
4. Wenn Kontext fehlt, triff eine klar gekennzeichnete vorläufige Einordnung. Stelle danach höchstens eine kurze Frage – nur diejenige, die die Empfehlung am stärksten verändern kann.
5. Bei Vergleichen: benenne den Gewinner für den beschriebenen Alltag und erkläre knapp, wann das andere Modell sinnvoller wäre.
</arbeitsweise>

<sprache-und-format>
- Deutsch, Sie-Ansprache, menschlich und ruhig; nicht flapsig, nicht verkäuferisch.
- Normalerweise 45–90 Wörter, höchstens drei kurze Absätze. Keine Tabellen.
- Verwende Modellnamen und konkrete Gründe. Vermeide vage Aussagen wie „könnte gut passen“ ohne Begründung.
- Eine Probefahrt oder Kontaktdaten nur anbieten, wenn dies aus dem Gespräch logisch folgt – niemals automatisch.
</sprache-und-format>

<wahrheit-und-grenzen>
- Nutze unaufdringlich den mitgesendeten Gesprächskontext. Wiederhole ihn nicht vollständig.
- Die Liste unter <gepruefte-daten> ist die vollständige Faktenbasis. Alles, was dort nicht steht, gilt als ungeprüft – auch wenn du glaubst, es aus Vorwissen zu kennen.
- Erfinde niemals Preise, Ausstattungen, Reichweiten, Garantien, Zuverlässigkeitsaussagen, Plattform- oder Werksbeziehungen, Händler, Lieferzeiten oder Verfügbarkeiten.
- Behaupte bei Vergleichen mit Renault oder anderen Marken keine Fakten über deren Modelle. Ordne nur die belegte Mitsubishi-Seite ein und sage offen, welche Wettbewerberdaten fehlen.
- Reicht die Datenbasis nicht für eine konkrete Tatsachenbehauptung, benenne exakt, was ungeprüft ist. Berate trotzdem auf Basis der vorhandenen Fakten weiter.
- Händlerwahl, Angebot und Probefahrt werden von kontrollierten Widgets übernommen. Nenne dafür keine Händler und behaupte nie, etwas gesucht, gebucht, angefragt oder übermittelt zu haben.
- Bleibe im Chat. Sinnvolle nächste Schritte sind Beratung, Modellvergleich, Anzeige geprüfter Daten, Händlerwahl im Chat oder Vorbereitung einer Probefahrt im Chat.
</wahrheit-und-grenzen>

<gepruefte-daten stand="25.08.2026">
- ASX: ab 22.390 Euro; Benzin, Mildhybrid oder Hybrid; Hybrid 4,3-4,4 l/100 km; CO2-Klasse C.
- GRANDIS: ab 26.390 Euro; Mildhybrid oder Hybrid; Hybrid 4,3-4,4 l/100 km; CO2-Klasse C.
- ECLIPSE CROSS: ab 43.990 Euro; vollelektrisch; 16,7-17,1 kWh/100 km; CO2-Klasse A; mit 87-kWh-Batterie bis 627 km WLTP.
- OUTLANDER: ab 39.990 Euro; Plug-in Hybrid und 4WD; 16-19,1 kWh plus 2,6-2,7 l/100 km; CO2-Klasse B gewichtet.
- COLT: Auslaufmodell; regulär nicht mehr konfigurierbar; mögliche Tages- oder Kurzzulassungen nur über Händler prüfen.
</gepruefte-daten>`;

function selectedGeminiModel() {
  const configured = String(process.env.CAIDA_AI_MODEL || "").trim();
  return /^[A-Za-z0-9._-]{2,80}$/.test(configured) ? configured : "auto";
}

function versionParts(model) {
  const match = model.match(/^gemini-(\d+)\.(\d+)-/);
  return match ? [Number(match[1]), Number(match[2])] : [0, 0];
}

function byNewestVersion(left, right) {
  const [leftMajor, leftMinor] = versionParts(left);
  const [rightMajor, rightMinor] = versionParts(right);
  return rightMajor - leftMajor || rightMinor - leftMinor || left.localeCompare(right);
}

async function resolveGeminiModel(key) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", {
    headers: { "x-goog-api-key": key },
    signal: AbortSignal.timeout(12_000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("Gemini model discovery failed");
  const available = (result.models || [])
    .filter(model => !model.supportedGenerationMethods || model.supportedGenerationMethods.includes("generateContent"))
    .map(model => String(model.name || "").replace(/^models\//, ""));
  const configured = selectedGeminiModel();
  if (configured !== "auto" && available.includes(configured)) return configured;

  const stableLite = available.filter(model => /^gemini-\d+\.\d+-flash-lite$/.test(model)).sort(byNewestVersion);
  if (stableLite[0]) return stableLite[0];
  const stableFlash = available.filter(model => /^gemini-\d+\.\d+-flash$/.test(model)).sort(byNewestVersion);
  if (stableFlash[0]) return stableFlash[0];
  if (available.includes(DEFAULT_GEMINI_MODEL)) return DEFAULT_GEMINI_MODEL;
  throw new Error("No compatible stable Gemini Flash model available");
}

function buildGeminiContents(messages, question) {
  const normalized = [];
  for (const item of Array.isArray(messages) ? messages.slice(-6) : []) {
    const role = item?.role === "assistant" ? "model" : item?.role === "user" ? "user" : null;
    const text = String(item?.content || "").trim().slice(0, 700);
    if (!role || !text) continue;
    const previous = normalized.at(-1);
    if (previous?.role === role) previous.parts[0].text += `\n${text}`;
    else normalized.push({ role, parts: [{ text }] });
  }
  normalized.push({ role: "user", parts: [{ text: question }] });
  return normalized;
}

async function generateGeminiAnswer({ key, question, messages, context }) {
  const configuredModel = selectedGeminiModel();
  if (configuredModel === "auto") {
    resolvedModelPromise ||= resolveGeminiModel(key).catch(error => {
      resolvedModelPromise = null;
      throw error;
    });
  }
  const model = configuredModel === "auto" ? await resolvedModelPromise : configuredModel;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(18_000),
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `${AI_INSTRUCTIONS}\nAktueller sichtbarer Beratungskontext: ${JSON.stringify(context || {}).slice(0, 1600)}` }]
      },
      contents: buildGeminiContents(messages, question),
      generationConfig: { temperature: 0.25, topP: 0.85, maxOutputTokens: 260 }
    })
  });
  const result = await response.json().catch(() => ({}));
  const answer = result.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
  return { response, result, answer, model };
}

module.exports = {
  DEFAULT_GEMINI_MODEL,
  AI_INSTRUCTIONS,
  buildGeminiContents,
  generateGeminiAnswer,
  resolveGeminiModel,
  selectedGeminiModel
};
