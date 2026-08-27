"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { AI_INSTRUCTIONS: SHARED_AI_INSTRUCTIONS } = require("./lib/caida-ai");

const HOST = "127.0.0.1";
const PORT = Number(process.env.CAIDA_PORT || 4177);
const ROOT = __dirname;
const inbox = [];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2"
};

let aiProvider = process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "none";
let aiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
let aiModel = process.env.CAIDA_AI_MODEL || (aiProvider === "openai" ? "gpt-5-mini" : "gemini-3.1-flash-lite");
let lastAIError = null;
let aiConfiguredAt = aiKey ? new Date().toISOString() : null;
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
- Reiner Text ohne Markdown, Überschriftenzeichen oder Fettdruck-Sternchen.
- Verwende Modellnamen und konkrete Gründe. Vermeide vage Aussagen wie „könnte gut passen“ ohne Begründung.
- Eine Probefahrt oder Kontaktdaten nur anbieten, wenn dies aus dem Gespräch logisch folgt – niemals automatisch.
</sprache-und-format>

<wahrheit-und-grenzen>
- Nutze unaufdringlich den mitgesendeten Gesprächskontext. Wiederhole ihn nicht vollständig.
- Die Liste unter <gepruefte-daten> ist die vollständige Faktenbasis. Alles, was dort nicht steht, gilt als ungeprüft – auch wenn du glaubst, es aus Vorwissen zu kennen.
- Erfinde niemals Preise, Ausstattungen, Reichweiten, Garantien, Zuverlässigkeitsaussagen, Plattform- oder Werksbeziehungen, Händler, Lieferzeiten oder Verfügbarkeiten.
- Behaupte bei Vergleichen mit Renault oder anderen Marken keine Fakten über deren Modelle. Ordne nur die belegte Mitsubishi-Seite ein und sage offen, welche Wettbewerberdaten fehlen.
- Reicht die Datenbasis nicht für eine konkrete Tatsachenbehauptung, benenne exakt, was ungeprüft ist. Berate trotzdem auf Basis der vorhandenen Fakten weiter.
- Leite aus Modellname, Fahrzeugklasse oder Preis niemals ungeprüfte Größen-, Platz-, Komfort- oder Qualitätsunterschiede ab.
- Ein fairer Haken muss ebenfalls von der geprüften Datenbasis gedeckt sein. Fehlt dafür ein Fakt, sage ausdrücklich, dass dieser Punkt mit den vorliegenden Daten nicht belastbar vergleichbar ist.
- „Zuhause nicht laden“ bedeutet nicht automatisch „nirgendwo laden“. Frage bei Bedarf, ob zuverlässiges Laden bei der Arbeit oder öffentlich möglich ist.
- Händlerwahl, Angebot und Probefahrt werden von kontrollierten Widgets übernommen. Nenne dafür keine Händler und behaupte nie, etwas gesucht, gebucht, angefragt oder übermittelt zu haben.
- Bleibe im Chat. Sinnvolle nächste Schritte sind Beratung, Modellvergleich, Anzeige geprüfter Daten, Händlerwahl im Chat oder Vorbereitung einer Probefahrt im Chat.
</wahrheit-und-grenzen>

<beispiele>
Nutzer: „Welcher Mitsubishi ist der beste?“
CAIDA: „Als vernünftige Allround-Empfehlung würde ich zuerst den GRANDIS prüfen: mehr Familienreserve als der ASX, aber weniger komplex als der OUTLANDER. Wenn Stadt und Preis dominieren, ist der ASX schlüssiger. Entscheidend für eine klare Empfehlung: Fahren Sie überwiegend Stadt, Familie oder Langstrecke?“

Nutzer: „GRANDIS oder OUTLANDER für Familie?“
CAIDA: „Für den normalen Familienalltag gewinnt der GRANDIS: effizienter Hybrid ohne Ladepflicht und der günstigere Einstieg. Der OUTLANDER ist die stärkere Wahl, wenn Sie regelmäßig laden und 4WD wirklich nutzen. Ohne verlässliches Laden würde ich den Aufpreis und die zusätzliche Technik nicht empfehlen.“

Nutzer: „Ist der ASX besser als der Renault Captur?“
CAIDA: „Zum ASX kann ich den Einstieg ab 22.390 Euro sowie Benzin-, Mildhybrid- und Hybridantrieb sicher einordnen. Für einen fairen Sieger fehlen mir hier geprüfte Captur-Daten; Aussagen zu Garantie, Infotainment oder gemeinsamer Technik wären Spekulation. Wenn Sie mir die offiziellen Captur-Daten nennen, vergleiche ich beide sauber nach Preis, Antrieb und Alltag.“
</beispiele>

<gepruefte-daten stand="25.08.2026">
- ASX: ab 22.390 Euro; Benzin, Mildhybrid oder Hybrid; Hybrid 4,3-4,4 l/100 km; CO2-Klasse C.
- GRANDIS: ab 26.390 Euro; Mildhybrid oder Hybrid; Hybrid 4,3-4,4 l/100 km; CO2-Klasse C.
- ECLIPSE CROSS: ab 43.990 Euro; vollelektrisch; 16,7-17,1 kWh/100 km; CO2-Klasse A; mit 87-kWh-Batterie bis 627 km WLTP.
- OUTLANDER: ab 39.990 Euro; Plug-in Hybrid und 4WD; 16-19,1 kWh plus 2,6-2,7 l/100 km; CO2-Klasse B gewichtet.
- COLT: Auslaufmodell; regulär nicht mehr konfigurierbar; mögliche Tages- oder Kurzzulassungen nur über Händler prüfen.
</gepruefte-daten>

<erlaubte-beratungsableitungen>
- Preisvergleiche sind ausschließlich anhand der genannten Ab-Preise erlaubt.
- ASX und GRANDIS werden in der Datenbasis mit Benzin-, Mildhybrid- oder Hybridvarianten geführt; diese Varianten benötigen keine externe Plug-in-Ladung. Behaupte nichts über einen elektrischen Fahrmodus innerhalb des Hybrids.
- ECLIPSE CROSS ist das einzige hier als vollelektrisch belegte Modell. Seine Stärke setzt eine zuverlässige Lademöglichkeit voraus.
- OUTLANDER ist das einzige hier als Plug-in Hybrid und mit 4WD belegte Modell. Sein elektrischer Alltagsnutzen setzt regelmäßiges externes Laden voraus.
- Zulässiger Gegencheck ASX: kein vollelektrischer Antrieb in der geprüften ASX-Datenbasis; Raummaße sind ungeprüft.
- Zulässiger Gegencheck GRANDIS: kein Plug-in- oder vollelektrischer Antrieb in der geprüften GRANDIS-Datenbasis; Raummaße sind ungeprüft.
- Zulässiger Gegencheck ECLIPSE CROSS: zuverlässiges Laden nötig und höherer belegter Einstiegspreis als ASX, GRANDIS und OUTLANDER.
- Zulässiger Gegencheck OUTLANDER: regelmäßiges Laden nötig und höherer belegter Einstiegspreis als ASX und GRANDIS.
- Nicht belegt und deshalb niemals als Fakt nennen: Innenraumgröße, Kofferraum, Komfort, Materialqualität, Zuverlässigkeit, Ladegeschwindigkeit, Lieferzeit oder Wiederverkaufswert.
</erlaubte-beratungsableitungen>`;

function sendJson(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 50_000) reject(new Error("payload too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function cleanLead(value) {
  const take = (name, limit = 160) => String(value?.[name] || "").trim().slice(0, limit);
  return {
    model: take("model", 50),
    postcode: take("postcode", 5).replace(/\D/g, ""),
    time: take("time", 40),
    name: take("name", 120),
    contact: take("contact", 160)
  };
}

function providerLabel(provider) {
  return provider === "gemini" ? "Gemini" : provider === "openai" ? "OpenAI" : "KI";
}

function isPlausibleSecret(value) {
  return typeof value === "string" && value.length >= 20 && value.length <= 512 && !/[\s\x00-\x1f\x7f]/.test(value);
}

function friendlyGeminiError(result) {
  const detail = String(result?.error?.message || "Gemini-Key wurde von Google nicht akzeptiert.");
  if (/invalid authentication credentials|api key not valid|access_token_type_unsupported|unauthenticated/i.test(detail)) {
    return "Google hat diesen Gemini-Key nicht akzeptiert. Bitte den vollständigen AQ- oder AIza-Key aus Google AI Studio kopieren.";
  }
  if (/permission|forbidden|restricted|not enabled/i.test(detail)) {
    return "Der Key ist gültig, hat aber keinen Zugriff auf die Gemini API. Bitte die Projekt- oder API-Beschränkung in Google AI Studio prüfen.";
  }
  return detail.slice(0, 180);
}

async function verifyOpenAIConfiguration(key, model) {
  const response = await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(model)}`, { headers: { "Authorization": `Bearer ${key}` } });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const detail = String(result?.error?.message || "Key oder Modell wurde nicht akzeptiert.").slice(0, 180);
    throw new Error(detail);
  }
  return model;
}

async function resolveGeminiModel(key, requestedModel = "auto") {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", { headers: { "x-goog-api-key": key } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(friendlyGeminiError(result));
  const available = new Set((result.models || [])
    .filter(model => !model.supportedGenerationMethods || model.supportedGenerationMethods.includes("generateContent"))
    .map(model => String(model.name || "").replace(/^models\//, "")));
  const stableLite = [...available].filter(model => /^gemini-\d+\.\d+-flash-lite$/.test(model)).sort().reverse();
  const stableFlash = [...available].filter(model => /^gemini-\d+\.\d+-flash$/.test(model)).sort().reverse();
  const resolved = requestedModel && requestedModel !== "auto" && available.has(requestedModel)
    ? requestedModel
    : stableLite[0] || stableFlash[0];
  if (!resolved) throw new Error("Der Key ist gültig, aber kein kompatibles Flash-Lite-Modell ist für dieses Projekt freigeschaltet.");
  return resolved;
}

async function requestOpenAI(input) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Authorization": `Bearer ${aiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: aiModel, instructions: SHARED_AI_INSTRUCTIONS, input, max_output_tokens: 700, store: false })
  });
  const result = await response.json();
  const answer = result.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text?.trim();
  return { response, result, answer };
}

function buildGeminiContents(messages, question) {
  const normalized = [];
  for (const item of Array.isArray(messages) ? messages.slice(-8) : []) {
    const role = item?.role === "assistant" ? "model" : item?.role === "user" ? "user" : null;
    const text = String(item?.content || "").trim().slice(0, 900);
    if (!role || !text) continue;
    const previous = normalized.at(-1);
    if (previous?.role === role) previous.parts[0].text += `\n${text}`;
    else normalized.push({ role, parts: [{ text }] });
  }
  normalized.push({ role: "user", parts: [{ text: question }] });
  return normalized;
}

async function requestGemini(question, messages, context) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(aiModel)}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": aiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${SHARED_AI_INSTRUCTIONS}\nAktueller, vom Nutzer sichtbarer Beratungskontext: ${JSON.stringify(context || {}).slice(0, 1800)}` }] },
      contents: buildGeminiContents(messages, question),
      generationConfig: { temperature: 0.3, maxOutputTokens: 700 }
    })
  });
  const result = await response.json();
  const answer = result.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
  return { response, result, answer };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (url.pathname === "/api/health") return sendJson(res, 200, { ok: true, mode: "local-demo", inbox: inbox.length });
  if (url.pathname === "/api/ai-status" && req.method === "GET") return sendJson(res, 200, { enabled: Boolean(aiKey), provider: aiKey ? aiProvider : "none", model: aiKey ? aiModel : null, lastError: lastAIError, configuredAt: aiConfiguredAt });

  if (url.pathname === "/api/ai-config" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      const provider = String(payload?.provider || "gemini").trim().toLowerCase();
      const key = String(payload?.key || "").trim();
      const model = String(payload?.model || (provider === "openai" ? "gpt-5-mini" : "gemini-3.1-flash-lite")).trim();
      if (!/^(gemini|openai)$/.test(provider)) return sendJson(res, 400, { error: "Unbekannter KI-Anbieter." });
      const keyIsValid = provider === "gemini" ? isPlausibleSecret(key) : /^sk-[A-Za-z0-9_-]{20,}$/.test(key);
      if (!keyIsValid) return sendJson(res, 400, { error: `Der ${providerLabel(provider)} API-Key hat kein gültiges Format.` });
      if (!/^[A-Za-z0-9._-]{2,80}$/.test(model)) return sendJson(res, 400, { error: "Ungültiger Modellname." });
      const resolvedModel = provider === "gemini" ? await resolveGeminiModel(key, model) : await verifyOpenAIConfiguration(key, model);
      aiProvider = provider;
      aiKey = key;
      aiModel = resolvedModel;
      lastAIError = null;
      aiConfiguredAt = new Date().toISOString();
      return sendJson(res, 200, { enabled: true, provider: aiProvider, model: aiModel, memoryOnly: true });
    } catch (error) {
      lastAIError = String(error?.message || "KI-Konfiguration konnte nicht gelesen werden.").slice(0, 220);
      return sendJson(res, 400, { error: lastAIError });
    }
  }

  if (url.pathname === "/api/ai-chat" && req.method === "POST") {
    if (!aiKey) return sendJson(res, 503, { error: "AI provider not configured", enabled: false });
    try {
      const payload = JSON.parse(await readBody(req));
      const question = String(payload?.question || "").trim().slice(0, 1200);
      if (!question) return sendJson(res, 400, { error: "Frage fehlt." });
      const context = { modelId: payload?.modelId || null, profile: payload?.context || {} };
      const messages = Array.isArray(payload?.messages) ? payload.messages.slice(-8) : [];
      const input = `Profil: ${JSON.stringify(context).slice(0, 2400)}\n${messages.map(item => `${item.role === "assistant" ? "CAIDA" : "Nutzer"}: ${String(item.content || "").slice(0, 600)}`).join("\n")}\nNutzer: ${question}`;
      const { response: apiResponse, result, answer } = aiProvider === "gemini" ? await requestGemini(question, messages, context) : await requestOpenAI(input);
      if (!apiResponse.ok) return sendJson(res, 502, { error: `${providerLabel(aiProvider)} konnte gerade nicht antworten.`, detail: String(result?.error?.message || "unknown").slice(0, 180) });
      if (!answer) return sendJson(res, 502, { error: "AI response empty" });
      return sendJson(res, 200, { answer, provider: aiProvider, model: aiModel });
    } catch (error) {
      lastAIError = String(error?.message || "AI request failed").slice(0, 220);
      return sendJson(res, 502, { error: "AI request failed" });
    }
  }

  if (url.pathname === "/api/demo-lead" && req.method === "POST") {
    try {
      const lead = cleanLead(JSON.parse(await readBody(req)));
      if (!/^\d{5}$/.test(lead.postcode) || !lead.model || !lead.name || !lead.contact) return sendJson(res, 400, { error: "Bitte alle Felder ausfüllen." });
      const entry = { ...lead, id: `CAIDA-${String(inbox.length + 1).padStart(3, "0")}`, receivedAt: new Date().toISOString(), localOnly: true };
      inbox.unshift(entry);
      return sendJson(res, 201, entry);
    } catch {
      return sendJson(res, 400, { error: "Ungültige lokale Demo-Anfrage." });
    }
  }

  if (url.pathname === "/api/demo-leads" && req.method === "GET") return sendJson(res, 200, inbox);

  if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "Method not allowed" });

  const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const resolved = path.resolve(ROOT, requested);
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== path.join(ROOT, "index.html")) return sendJson(res, 403, { error: "Forbidden" });

  fs.stat(resolved, (error, stat) => {
    if (error || !stat.isFile()) return sendJson(res, 404, { error: "Not found" });
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(resolved).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(resolved).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  CAIDA Concept Prototype");
  console.log(`  http://${HOST}:${PORT}`);
  console.log("");
  console.log("  Demo-Anfragen bleiben nur im Arbeitsspeicher.");
  console.log(`  KI: ${aiKey ? `${providerLabel(aiProvider)} / ${aiModel}` : "nicht verbunden"}`);
  console.log("  Dieses Fenster zum Beenden schließen oder Strg+C drücken.");
});
