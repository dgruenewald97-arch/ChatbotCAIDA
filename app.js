"use strict";

const DATA_STAND = "25.08.2026";
const STATIC_HOSTED = /(^|\.)github\.io$/i.test(location.hostname) || new URLSearchParams(location.search).has("static");

const MODELS = {
  asx: {
    id: "asx", name: "ASX", label: "Kompakter SUV", image: "assets/asx.webp",
    price: "22.390 €", drive: "Benzin, Mildhybrid oder Hybrid",
    efficiency: "Hybrid: 4,3–4,4 l/100 km", co2: "CO₂-Klasse C (Hybrid)",
    source: "https://www.mitsubishi-motors.de/asx",
    reasons: ["Kompakte Abmessungen für Stadt und Alltag", "Drei unterschiedliche Antriebsoptionen", "Günstigster Einstieg der regulär verfügbaren SUV-Modelle"],
    tradeoff: "Wenn regelmäßig viel Gepäck oder fünf Personen mitfahren, bietet der Grandis mehr Reserven."
  },
  grandis: {
    id: "grandis", name: "GRANDIS", label: "Familien-SUV", image: "assets/grandis.webp",
    price: "26.390 €", drive: "Mildhybrid oder Hybrid",
    efficiency: "Hybrid: 4,3–4,4 l/100 km", co2: "CO₂-Klasse C (Hybrid)",
    source: "https://www.mitsubishi-motors.de/grandis",
    reasons: ["Auf einen aktiven Familienalltag ausgerichtet", "Effizienter Hybrid ohne Ladeplanung", "Mehr Raum, ohne direkt in die große SUV-Klasse zu wechseln"],
    tradeoff: "Wer regelmäßig elektrisch fahren, extern laden und Allrad nutzen möchte, sollte den Outlander mitprüfen."
  },
  eclipse: {
    id: "eclipse", name: "ECLIPSE CROSS", label: "Elektro-SUV", image: "assets/eclipse-cross.webp",
    price: "43.990 €", drive: "Vollelektrisch",
    efficiency: "16,7–17,1 kWh/100 km", co2: "CO₂-Klasse A",
    source: "https://www.mitsubishi-motors.de/eclipse-cross",
    reasons: ["Vollelektrischer Antrieb ohne lokale CO₂-Emissionen", "Mit 87-kWh-Batterie bis zu 627 km WLTP-Reichweite", "Für Alltag und längere Strecken konzipiert"],
    tradeoff: "Der größte Vorteil entsteht, wenn regelmäßiges Laden zuhause, bei der Arbeit oder zuverlässig öffentlich möglich ist."
  },
  outlander: {
    id: "outlander", name: "OUTLANDER", label: "Plug-in-Hybrid SUV", image: "assets/outlander-diamant.webp",
    price: "39.990 €", drive: "Plug-in Hybrid · 4WD",
    efficiency: "16–19,1 kWh + 2,6–2,7 l/100 km", co2: "CO₂-Klasse B gewichtet",
    source: "https://www.mitsubishi-motors.de/outlander-plug-in-hybrid",
    reasons: ["Elektrisches Fahren im Alltag plus Langstrecken-Flexibilität", "Super All Wheel Control und 4WD", "225 kW Systemleistung in der Diamant-Variante"],
    tradeoff: "Ein Plug-in Hybrid ist besonders sinnvoll, wenn die Batterie im Alltag konsequent geladen wird."
  },
  colt: {
    id: "colt", name: "COLT", label: "Kleinwagen · Auslaufmodell", image: "assets/asx.webp",
    price: "19.690 €*", drive: "Benzin oder Hybrid",
    efficiency: "Hybrid: 4,2–4,3 l/100 km", co2: "CO₂-Klasse C (Hybrid)",
    source: "https://www.mitsubishi-motors.de/colt",
    reasons: ["Kompaktes Format", "Effiziente Hybrid-Variante", "Tages- und Kurzzulassungen können noch verfügbar sein"],
    tradeoff: "Der COLT ist als regulär konfigurierbarer Neuwagen nicht mehr verfügbar. CAIDA empfiehlt deshalb den Händlerkontakt für Restbestände."
  }
};

const VERIFIED_DEALERS = {
  "61169": [
    { name: "Autohaus Lisson OHG", distance: "8,8 km", type: "Verkauf und Service" },
    { name: "Autohaus Rolf Bender e. K.", distance: "11,5 km", type: "Verkauf und Service" },
    { name: "Auto-Rödling GmbH", distance: "16,4 km", type: "Verkauf und Service" }
  ]
};

const SCENARIOS = [
  { id: "family", title: "Familienberatung", note: "Grandis vs. Outlander" },
  { id: "electric", title: "Elektro-Umstieg", note: "Eclipse Cross & Laden" },
  { id: "compact", title: "Kompakter SUV", note: "ASX & Budget" },
  { id: "outlander", title: "Outlander Interesse", note: "PHEV, 4WD & Alltag" },
  { id: "compare", title: "Modellvergleich", note: "Grandis vs. Outlander" },
  { id: "service", title: "Besitzer-Service", note: "Garantie, Service & Hilfe" }
];

const QUESTIONS = {
  use: {
    text: "Wofür wird das Auto die meiste Zeit gebraucht?",
    choices: [
      ["Stadt & Pendeln", "city"], ["Gemischter Alltag", "mixed"],
      ["Familie & Freizeit", "family"], ["Viel Langstrecke", "long"]
    ]
  },
  people: {
    text: "Wer fährt meistens mit – und wie viel Platz sollte entspannt verfügbar sein?",
    choices: [["1–2 Personen", "small"], ["3–4 Personen", "medium"], ["5 Personen / viel Gepäck", "large"]]
  },
  drive: {
    text: "Wie offen sind Sie für elektrisches Fahren?",
    choices: [["Vollelektrisch", "electric"], ["Hybrid ohne Laden", "hybrid"], ["Plug-in Hybrid", "phev"], ["Noch völlig offen", "open"]]
  },
  charging: {
    text: "Könnten Sie im Alltag regelmäßig laden? Das ist wichtiger als eine theoretische Reichweitenzahl.",
    choices: [["Zuhause", "home"], ["Bei der Arbeit", "work"], ["Öffentlich", "public"], ["Noch unklar", "unclear"]]
  },
  budget: {
    text: "Soll ich eher auf den Gesamtpreis oder eine passende Monatsrate achten?",
    choices: [["Gesamtpreis", "total"], ["Monatsrate", "monthly"], ["Erst das passende Auto", "fit"]]
  }
};

const els = {
  conversation: document.querySelector("#conversation"),
  composer: document.querySelector("#composer"),
  input: document.querySelector("#message-input"),
  template: document.querySelector("#message-template"),
  voiceButton: document.querySelector("#voice-button"),
  voiceDialog: document.querySelector("#voice-dialog"),
  conceptPanel: document.querySelector("#concept-panel"),
  scenarioList: document.querySelector("#scenario-list"),
  inbox: document.querySelector("#demo-inbox"),
  inboxCount: document.querySelector("#inbox-count"),
  heroCar: document.querySelector("#hero-car"),
  heroModel: document.querySelector("#hero-model"),
  heroModelLabel: document.querySelector("#hero-model-label"),
  shell: document.querySelector(".caida-shell"),
  launcher: document.querySelector(".chat-launcher"),
  aiStatus: document.querySelector("#ai-status"),
  privacyText: document.querySelector("#privacy-note span"),
  contextStrip: document.querySelector("#context-strip"),
  contextTags: document.querySelector("#context-tags"),
  contextClear: document.querySelector("#context-clear")
};

let state = freshState();
let localInbox = [];
let recognition = null;
let voiceConsent = null;
let aiConnection = { enabled: false, provider: "none", model: null, lastError: null };

const CONTEXT_LABELS = {
  use: { city: "Stadt & Pendeln", mixed: "Gemischter Alltag", family: "Familie", long: "Langstrecke" },
  people: { small: "1–2 Personen", medium: "3–4 Personen", large: "5 Personen / Gepäck" },
  drive: { electric: "Elektro", hybrid: "Hybrid", phev: "Plug-in Hybrid", open: "Antrieb offen" },
  charging: { home: "Laden zuhause", work: "Laden bei Arbeit", public: "Öffentlich laden", unclear: "Laden unklar" },
  budget: { total: "Gesamtpreis", monthly: "Monatsrate", fit: "Passung zuerst" }
};

function freshState() {
  return {
    flow: "start", answers: {}, asked: [], compare: [], recommended: null,
    alternative: null, lastQuestion: null, aiMessages: [],
    transaction: { kind: null, model: null, postcode: null, dealer: null, time: null, offerType: null, preference: null, name: null, contact: null }
  };
}

function editDistance(a, b) {
  const left = String(a || ""), right = String(b || "");
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[right.length];
}

function hasNearWord(text, candidates, maxDistance = 2) {
  const words = String(text).toLowerCase().match(/[a-zäöüß0-9-]+/g) || [];
  return words.some(word => candidates.some(candidate => {
    if (Math.abs(word.length - candidate.length) > maxDistance) return false;
    if (word[0] !== candidate[0]) return false;
    return editDistance(word, candidate) <= maxDistance;
  }));
}

function hasTrialIntent(text) {
  return /probe\s*fahren|test\s*fahrt|test\s*fahren/.test(text) || hasNearWord(text, ["probefahrt", "probefahren"], 2);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function updateContextStrip() {
  const tags = Object.entries(state.answers)
    .filter(([key, value]) => CONTEXT_LABELS[key]?.[value])
    .map(([key, value]) => CONTEXT_LABELS[key][value]);
  if (state.recommended && MODELS[state.recommended]) tags.push(`Tendenz: ${MODELS[state.recommended].name}`);
  els.contextTags.innerHTML = tags.slice(0, 4).map(label => `<span class="context-tag">${escapeHtml(label)}</span>`).join("");
  els.contextStrip.hidden = tags.length === 0;
}

function scrollConversation() {
  requestAnimationFrame(() => { els.conversation.scrollTop = els.conversation.scrollHeight; });
}

function createBubble(text) {
  const bubble = document.createElement("div");
  bubble.className = "message__bubble";
  const paragraphs = String(text).split(/\n{2,}/);
  paragraphs.forEach(part => {
    const p = document.createElement("p");
    p.textContent = part;
    bubble.appendChild(p);
  });
  return bubble;
}

function addMessage(role, text, options = {}) {
  const node = els.template.content.firstElementChild.cloneNode(true);
  node.classList.toggle("message--user", role === "user");
  node.setAttribute("aria-label", role === "user" ? "Sie" : "CAIDA");
  const body = node.querySelector(".message__body");
  if (text) body.appendChild(createBubble(text));
  if (options.html) body.insertAdjacentHTML("beforeend", options.html);
  if (options.hint) {
    const hint = document.createElement("span");
    hint.className = "message__hint";
    hint.textContent = options.hint;
    body.appendChild(hint);
  }
  els.conversation.appendChild(node);
  bindDynamicActions(node);
  scrollConversation();
  return node;
}

function addTyping() {
  const node = els.template.content.firstElementChild.cloneNode(true);
  node.dataset.typing = "true";
  node.querySelector(".message__body").innerHTML = '<div class="message__bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
  els.conversation.appendChild(node);
  scrollConversation();
  return node;
}

async function assistantReply(text, options = {}, delay = null) {
  const typing = addTyping();
  const humanDelay = delay ?? Math.min(960, 300 + String(text).length * 3.4);
  await new Promise(resolve => setTimeout(resolve, humanDelay));
  typing.remove();
  return addMessage("assistant", text, options);
}

function buttonHtml(label, action, value = "", primary = false, note = "") {
  return `<button type="button" class="choice-button${primary ? " choice-button--primary" : ""}" data-action="${action}" data-value="${escapeHtml(value)}">${escapeHtml(label)}${note ? `<small>${escapeHtml(note)}</small>` : ""}</button>`;
}

function choicesHtml(items, action = "answer", stacked = false) {
  return `<div class="choice-grid${stacked ? " choice-grid--stack" : ""}" role="group" aria-label="Antwortmöglichkeiten">${items.map((item, i) => buttonHtml(item[0], action, item[1], i === 0 && action !== "answer", item[2] || "")).join("")}</div>`;
}

function promptRailHtml(items) {
  return `<div class="prompt-rail" role="group" aria-label="Mögliche nächste Fragen">${items.map(item => buttonHtml(item[0], "prompt", item[1])).join("")}</div>`;
}

function greetingHtml() {
  return promptRailHtml([
    ["Familienauto finden", "Wir suchen ein Auto für unsere Familie."],
    ["Antrieb verstehen", "Welcher Antrieb passt zu meinem Alltag?"],
    ["Modelle vergleichen", "Vergleiche Grandis und Outlander ehrlich."]
  ]);
}

function introHint() {
  if (STATIC_HOSTED) return `Online-Demo · sichere lokale Beratung · Datenstand ${DATA_STAND}`;
  if (!aiConnection.enabled) return `Beratungsmodus · Gemini für freie Fragen verbinden · Datenstand ${DATA_STAND}`;
  const provider = aiConnection.provider === "gemini" ? "Gemini" : "OpenAI";
  return `${provider} aktiv · freie Beratung · Datenstand ${DATA_STAND}`;
}

function refreshIntroHint() {
  const hint = els.conversation.querySelector("[data-intro-message] .message__hint");
  if (hint) hint.textContent = introHint();
}

function worldHtml() {
  return `<section class="world-card" aria-label="Mitsubishi Themenwelt">
    <div class="world-card__head"><span>ALLES IM CHAT</span><h3>Wobei darf CAIDA helfen?</h3></div>
    <div class="world-card__grid">
      ${buttonHtml("Passendes Modell", "advisor-open", "", true, "Alltag gemeinsam sortieren")}
      ${buttonHtml("Modelle & Antriebe", "world-models", "", false, "Verstehen oder vergleichen")}
      ${buttonHtml("Elektro & Laden", "start", "electric", false, "Passt das zu meinem Alltag?")}
      ${buttonHtml("Kosten & Angebote", "world-costs", "", false, "Geprüfte Preise einordnen")}
      ${buttonHtml("Probefahrt & Händler", "world-trial", "", false, "Im Chat vorbereiten")}
      ${buttonHtml("Service & Garantie", "start", "service", false, "Für Mitsubishi Fahrer")}
    </div>
  </section>`;
}

function aiSetupHtml() {
  return `<form class="ai-setup-card" data-ai-chat-form>
    <h3>Gemini mit CAIDA verbinden</h3>
    <p>Damit werden freie Fragen wirklich von Gemini beantwortet. CAIDA verwendet weiterhin nur den geprüften Mitsubishi-Kontext.</p>
    <input type="hidden" name="provider" value="gemini">
    <input type="hidden" name="model" value="auto">
    <label for="chat-gemini-key">Gemini API-Key</label>
    <input id="chat-gemini-key" name="key" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="AQ… oder AIza…" required>
    <button class="button button--primary" type="submit">Gemini sicher verbinden</button>
    <div class="ai-setup-card__status" data-ai-chat-status role="status">Noch nicht verbunden.</div>
    <div class="ai-setup-card__secure">🔒 Nur im Arbeitsspeicher dieses lokalen Servers. Der Key erscheint nie im Chatverlauf.</div>
  </form>`;
}

async function showAISetup() {
  if (STATIC_HOSTED) {
    return assistantReply("Diese öffentliche GitHub-Pages-Demo läuft bewusst ohne API-Key im Browser. Die Beratung und alle Widgets funktionieren lokal; für freie Gemini-Antworten starten Sie den Node-Server oder binden später einen sicheren Backend-Proxy an.", { hint: "Kein API-Key im öffentlichen Frontend" });
  }
  if (aiConnection.enabled) return assistantReply(`Gemini ist bereits aktiv. CAIDA beantwortet freie Fragen mit ${aiConnection.model} und behält den sichtbaren Gesprächskontext im Blick.`);
  if (aiConnection.managed) return assistantReply("Das öffentliche Vercel-Backend ist bereit, aber das Gemini-Secret wurde dort noch nicht hinterlegt. Ein Key wird niemals im Chat oder Browser eingegeben.", { hint: "Serverseitige Vercel-Konfiguration erforderlich" });
  const reason = aiConnection.lastError ? `Die letzte Verbindung scheiterte: ${aiConnection.lastError}` : "Die KI ist noch nicht verbunden.";
  return assistantReply(reason, { html: aiSetupHtml() }, 180);
}

async function openAdvisorPrompt() {
  state.flow = "advisor";
  return assistantReply("Erzählen Sie mir einfach, was Ihnen beim Auto wichtig ist – ein Satz reicht. Ich merke mir den relevanten Kontext und hake nur nach, wenn es die Empfehlung wirklich verändert.", {
    html: choicesHtml([
      ["Familie, Platz, Alltag", "Wir sind eine Familie und brauchen entspannt Platz im Alltag."],
      ["Stadt und Pendeln", "Ich fahre vor allem in der Stadt und pendle regelmäßig."],
      ["Elektro verstehen", "Ich überlege elektrisch zu fahren, bin aber noch unsicher."],
      ["Einfach frei schreiben", "", "Keine Vorgaben"]
    ], "context-sample")
  });
}

function resetConversation(scenario = null) {
  state = freshState();
  els.conversation.replaceChildren();
  updateContextStrip();
  updateHero("grandis");
  const intro = addMessage("assistant", "Hallo, ich bin CAIDA.\n\nFragen Sie mich einfach zu Modellen, Antrieben, Alltag, Kosten oder Service. Ich gebe Ihnen eine klare Tendenz, nenne den Haken und frage nur nach, wenn es die Empfehlung wirklich verändert.", { html: greetingHtml(), hint: introHint() });
  intro.dataset.introMessage = "true";
  if (scenario) setTimeout(() => launchScenario(scenario), 280);
}

function parseInput(raw) {
  const text = raw.toLowerCase();
  const words = text.match(/[a-zäöüß0-9-]+/g) || [];
  const modelAliases = { asx: ["asx", "ax"], grandis: ["grandis"], eclipse: ["eclipse"], outlander: ["outlander"], colt: ["colt"] };
  const models = Object.entries(modelAliases).filter(([, aliases]) => aliases.some(alias => words.some(word => word === alias || (alias.length > 3 && editDistance(word, alias) <= 1)))).map(([id]) => id);
  const parsed = { models };
  if (/famil|kind|kinder|kinderwagen|gepäck|platz|urlaub/.test(text)) parsed.use = "family";
  else if (/stadt|city|parken|pendel|kompakt/.test(text)) parsed.use = "city";
  else if (/autobahn|langstrecke|weite strecke|vielfahrer/.test(text)) parsed.use = "long";
  else if (/alltag|gemischt|alles/.test(text)) parsed.use = "mixed";
  if (/fünf|5 personen|große familie|viel gepäck/.test(text)) parsed.people = "large";
  else if (/vier|4 personen|drei|3 personen/.test(text)) parsed.people = "medium";
  else if (/allein|zu zweit|2 personen/.test(text)) parsed.people = "small";
  if (/vollelektr|elektroauto|bev|stromer/.test(text)) parsed.drive = "electric";
  else if (/plug.?in|phev/.test(text)) parsed.drive = "phev";
  else if (/hybrid/.test(text)) parsed.drive = "hybrid";
  if (/zuhause laden|wallbox|garage|stellplatz/.test(text)) parsed.charging = "home";
  if (/günstig|preiswert|budget|gesamtpreis/.test(text)) parsed.budget = "total";
  if (/rate|monat/.test(text)) parsed.budget = "monthly";
  return parsed;
}

function mergeParsed(parsed) {
  ["use", "people", "drive", "charging", "budget"].forEach(key => {
    if (parsed[key] && !state.answers[key]) state.answers[key] = parsed[key];
  });
  updateContextStrip();
}

async function handleUserText(raw) {
  const text = raw.trim();
  if (!text) return;
  addMessage("user", text);
  const lower = text.toLowerCase();
  const competitorMention = /renault|captur|peugeot|citro[eë]n|vw|volkswagen|toyota|hyundai|kia|skoda|wettbewerb|andere marke/.test(lower);
  const parsed = parseInput(text);
  if (parsed.models.length === 1) state.answers.interest = parsed.models[0];
  mergeParsed(parsed);

  if (/neu starten|zurücksetzen|reset/.test(lower)) return resetConversation();
  if (state.flow === "dealer") {
    const postcode = text.match(/\b\d{5}\b/)?.[0];
    if (postcode) return showDealers(postcode);
    return assistantReply("Ich brauche nur die fünfstellige Postleitzahl – zum Beispiel 61169.");
  }
  if (state.flow === "trial-select") {
    const postcode = text.match(/\b\d{5}\b/)?.[0];
    if (postcode) return showDealers(postcode);
    if (parsed.models.length) return openTrial(parsed.models[0]);
    return assistantReply("Nennen Sie einfach ein Modell oder eine fünfstellige Postleitzahl. Ich bleibe hier im Chat.", { html: modelChoiceHtml("trial-model") });
  }
  if (state.flow === "offer-select") {
    if (parsed.models.length) return openOffer(parsed.models[0]);
    return assistantReply("Nennen Sie einfach das Mitsubishi Modell für das Angebotsprofil.", { html: modelChoiceHtml("offer-model") });
  }
  if (competitorMention && /besser|vergleich|vergleichen|unterschied|welcher|welches/.test(lower)) {
    return answerCompetitorSafely(text, parsed.models[0] || state.recommended || state.answers.interest);
  }
  if (hasTrialIntent(lower)) {
    const modelId = parsed.models[0] || state.recommended || state.answers.interest;
    if (modelId && MODELS[modelId]) return openTrial(modelId);
    state.flow = "trial-select";
    return assistantReply("Welches Modell möchten Sie probefahren? Danach wählen Sie Händler, Wunschzeit und Kontaktdaten Schritt für Schritt im Chat.", { html: modelChoiceHtml("trial-model") });
  }
  if (/angebot|finanzier|leasing|kaufpreis|kaufen/.test(lower)) {
    const modelId = parsed.models[0] || state.recommended || state.answers.interest;
    return openOffer(modelId);
  }
  if (/händler|autohaus|mitsubishi.partner|partner (finden|suchen)/.test(lower)) {
    const postcode = text.match(/\b\d{5}\b/)?.[0] || "";
    return showDealers(postcode);
  }
  if (/service|wartung|garantie|panne|coc|ersatzteil|zubehör|werkstatt/.test(lower)) return startService(text);
  if ((/vergleich|vergleichen|unterschied/.test(lower) && !competitorMention) || parsed.models.length >= 2) {
    state.flow = "compare";
    state.compare = [...new Set([...state.compare, ...parsed.models])];
    return continueCompare();
  }
  if (parsed.models.length === 1 && /\?|hat |kann |gibt es|wie (viel|hoch|weit)|welche|reichweite|verbrauch|ausstattung|technologie|laden|preis|kost|antrieb|passt/.test(lower) && !competitorMention) {
    return answerVerifiedModelQuestion(text, parsed.models[0]);
  }
  if (state.flow === "compare") {
    state.compare = [...new Set([...state.compare, ...parsed.models])];
    if (!parsed.models.length) return assistantReply("Nennen Sie mir einfach zwei Modelle – zum Beispiel „Grandis und Outlander“.", { html: modelChoiceHtml("compare-model") });
    return continueCompare();
  }
  if (competitorMention) return answerCompetitorSafely(text, parsed.models[0] || state.recommended || state.answers.interest);
  if (aiConnection.enabled) return askConnectedAI(text, parsed.models[0] || state.recommended);
  if (state.recommended) return answerFollowUp(text);
  if (parsed.models.length === 1 && !Object.keys(state.answers).length) {
    const model = MODELS[parsed.models[0]];
    state.answers.interest = model.id;
    state.flow = "advisor";
    await assistantReply(`Der ${model.name} ist eine klare Spur. Ich prüfe lieber kurz, ob er wirklich zu Ihrem Alltag passt – nicht nur, ob er Ihnen gefällt.`);
    return askNextQuestion();
  }
  if (/elektro|laden|reichweite|strom/.test(lower) && parsed.drive !== "hybrid") {
    state.flow = "advisor";
    if (!state.answers.drive) state.answers.drive = "electric";
    await assistantReply("Gern. Entscheidend ist nicht nur Reichweite, sondern ob elektrisches Fahren in Ihrem Alltag bequem funktioniert.");
    return askNextQuestion();
  }
  if (/^(hallo|hi|hey|guten (morgen|tag|abend))[!.?\s]*$/i.test(text)) {
    return assistantReply("Hallo! Was möchten Sie gerade herausfinden? Schreiben Sie einfach los – ein Modellname oder ein Satz zu Ihrem Alltag reicht.", { html: greetingHtml() });
  }
  if (!Object.keys(state.answers).length && !parsed.models.length) {
    return answerLocallyWithoutAI(text);
  }
  state.flow = "advisor";
  return askNextQuestion(true);
}

async function handleAction(action, value, source) {
  if (action === "prompt") {
    if (value === "__connect__") return showAISetup();
    return handleUserText(value);
  }
  if (action === "advisor-open") {
    addMessage("user", source.textContent.trim());
    return openAdvisorPrompt();
  }
  if (action === "world") {
    addMessage("user", "Zeig mir, wobei du helfen kannst");
    return assistantReply("Gern. Sie müssen keinen festen Ablauf kennen – wählen Sie ein Thema oder schreiben Sie direkt Ihre Frage.", { html: worldHtml() });
  }
  if (action === "world-models") {
    addMessage("user", source.textContent.trim());
    return assistantReply("Welches Modell interessiert Sie? Danach können Sie frei fragen – ich bleibe bei belegten Daten.", { html: modelChoiceHtml("ask-model") });
  }
  if (action === "world-costs") {
    addMessage("user", "Kosten und Angebote einordnen");
    return assistantReply("Ich kann offizielle Ab-Preise vergleichen und erklären, welche Antriebswahl zum Budget passt. Konkrete Monatsraten nenne ich nur mit einem aktuellen Angebot.", { html: choicesHtml([["Günstigster Einstieg", "Was ist aktuell der günstigste Einstieg?"], ["Modelle preislich vergleichen", "Vergleiche die Modelle preislich."], ["Gesamtpreis oder Rate?", "Sollte ich eher auf Gesamtpreis oder Monatsrate achten?"]], "context-sample") });
  }
  if (action === "world-trial") {
    addMessage("user", "Probefahrt und Händler");
    state.flow = "trial-select";
    return assistantReply("Das bereiten wir hier gemeinsam vor. Nennen Sie zuerst Ihr Wunschmodell oder Ihre fünfstellige Postleitzahl – ich führe Sie dann im Chat weiter.", { html: modelChoiceHtml("trial-model") });
  }
  if (action === "context-sample") {
    if (!value) return els.input.focus();
    return handleUserText(value);
  }
  if (action === "connect-ai") return showAISetup();
  if (action === "start") {
    if (value === "compare") return startCompare();
    if (value === "service") return startService();
    state.flow = "advisor";
    if (value === "electric") state.answers.drive = "electric";
    addMessage("user", source.textContent.trim());
    if (value === "electric") await assistantReply("Sehr gern. Ich ordne erst Ihren Alltag ein – dann kann ich Reichweite und Laden sinnvoll bewerten.");
    updateContextStrip();
    return value === "advisor" ? openAdvisorPrompt() : askNextQuestion();
  }
  if (action === "answer") {
    addMessage("user", source.textContent.trim());
    if (state.lastQuestion) state.answers[state.lastQuestion] = value;
    updateContextStrip();
    return askNextQuestion();
  }
  if (action === "ask-model") {
    addMessage("user", MODELS[value].name);
    state.answers.interest = value;
    updateHero(value);
    return assistantReply(`Alles klar – ${MODELS[value].name}. Was möchten Sie wissen? Sie können ganz normal fragen.`, { html: choicesHtml([["Passt er zu meinem Alltag?", `Passt der ${MODELS[value].name} zu meinem Alltag?`], ["Preis & Antrieb", `Was kosten und können die Antriebe des ${MODELS[value].name}?`], ["Mit anderem Modell vergleichen", "" ]], "context-sample") });
  }
  if (action === "trial-model") return openTrial(value);
  if (action === "offer-model") return openOffer(value);
  if (action === "compare-model") {
    addMessage("user", MODELS[value].name);
    if (!state.compare.includes(value)) state.compare.push(value);
    return continueCompare();
  }
  if (action === "trial") return openTrial(value || state.recommended);
  if (action === "offer") return openOffer(value || state.recommended);
  if (action === "compare-recommendations") {
    state.flow = "compare";
    state.compare = [state.recommended, state.alternative];
    return renderComparison(state.compare[0], state.compare[1]);
  }
  if (action === "show-alternative") return renderRecommendation(state.alternative, state.recommended, false);
  if (action === "source") return assistantReply("Hier bleiben wir im Gespräch. Das sind die Daten aus der geprüften Mitsubishi-Quelle:", { html: sourceCardHtml(value) });
  if (action === "service-topic") return serviceTopic(value, source.textContent.trim());
  if (action === "dealer-search") return showDealers(value);
}

async function askNextQuestion(withAcknowledgement = false) {
  const order = ["use", "drive"];
  if (["electric", "phev"].includes(state.answers.drive)) order.push("charging");
  const next = order.find(key => !state.answers[key]);
  if (!next) return makeRecommendation();
  state.lastQuestion = next;
  state.asked.push(next);
  const q = QUESTIONS[next];
  let prefix = "";
  if (withAcknowledgement && Object.keys(state.answers).length) prefix = "Damit kann ich die Auswahl schon eingrenzen. ";
  if (state.asked.length >= 2) prefix = "Meine Tendenz steht fast. Eine Sache kann sie noch verändern: ";
  return assistantReply(prefix + q.text, { html: choicesHtml(q.choices) });
}

function answerLocallyWithoutAI(text) {
  const lower = text.toLowerCase();
  const connect = ["Gemini verbinden", "__connect__"];
  if (/was kannst du|wobei hilfst|was machst du/.test(lower)) {
    return assistantReply("Ich kann Mitsubishi Modelle passend zu Ihrem Alltag einordnen, Antriebe und geprüfte Preise erklären, Modelle ehrlich vergleichen sowie Händler- oder Probefahrt-Schritte im Chat vorbereiten. Ohne Gemini arbeite ich mit der geprüften Demo-Datenbasis; mit Gemini beantworte ich auch frei formulierte Rückfragen.", { html: promptRailHtml([["Modell finden", "Welcher Mitsubishi passt zu meinem Alltag?"], ["Modelle vergleichen", "Vergleiche Grandis und Outlander ehrlich."], connect]) });
  }
  if (/beste|welcher mitsubishi|welches (auto|modell)|empfehl/.test(lower)) {
    state.flow = "advisor";
    state.lastQuestion = "use";
    if (!state.asked.includes("use")) state.asked.push("use");
    return assistantReply("Als vernünftige Allround-Empfehlung würde ich zuerst den GRANDIS prüfen: mehr Familienreserve als der ASX, aber weniger komplex als der OUTLANDER. Wenn Stadt und Preis dominieren, ist der ASX schlüssiger; für konsequent elektrisches Fahren der ECLIPSE CROSS. Was prägt Ihren Alltag am stärksten?", { html: choicesHtml(QUESTIONS.use.choices) });
  }
  if (/günstig|billig|preiswert|einstieg|budget/.test(lower)) {
    return assistantReply("Der ASX ist mit aktuell ab 22.390 € der günstigste reguläre SUV-Einstieg in dieser Datenbasis. Er ist besonders schlüssig für Stadt und gemischten Alltag. Wenn regelmäßig Familie und viel Gepäck mitfahren, würde ich den GRANDIS ab 26.390 € gegenrechnen – der Mehrpreis kauft vor allem Raumreserve.", { html: promptRailHtml([["ASX oder GRANDIS?", "Vergleiche ASX und Grandis für meinen Alltag."], ["Antrieb klären", "Welcher Antrieb passt zu meinem Alltag?"], connect]) });
  }
  state.flow = "advisor";
  state.lastQuestion = "use";
  if (!state.asked.includes("use")) state.asked.push("use");
  return assistantReply("Ich kann das sinnvoll eingrenzen, möchte aber nicht raten. Der Punkt, der die Mitsubishi-Auswahl am stärksten verändert, ist Ihr tatsächlicher Alltag: eher kompakt in der Stadt, Familie und Freizeit oder viel Langstrecke?", { html: choicesHtml(QUESTIONS.use.choices), hint: "Geprüfte lokale Beratung · Gemini für freie Detailfragen verfügbar" });
}

function answerVerifiedModelQuestion(text, id) {
  const m = MODELS[id];
  const lower = text.toLowerCase();
  if (/preis|kost|günstig|budget/.test(lower)) return assistantReply(`Der geprüfte Aktions-Ab-Preis des ${m.name} liegt bei ${m.price}, zuzüglich Überführungskosten. ${m.tradeoff}`, { html: promptRailHtml([["Passt er zu mir?", `Passt der ${m.name} zu meinem Alltag?`], ["Ehrlich vergleichen", `Mit welchem Mitsubishi sollte ich den ${m.name} vergleichen?`]]) });
  if (/reichweite/.test(lower) && id === "eclipse") return assistantReply("Mitsubishi nennt für den ECLIPSE CROSS mit 87-kWh-Batterie bis zu 627 km WLTP-Reichweite. Das ist ein Prüfstandswert; Wetter, Tempo und Klimatisierung beeinflussen die reale Reichweite. Entscheidend für die Empfehlung ist deshalb: Können Sie zuhause oder bei der Arbeit regelmäßig laden?");
  if (/verbrauch|effizienz|co2|emission/.test(lower)) return assistantReply(`Für den ${m.name} sind ${m.efficiency} und ${m.co2} ausgewiesen. Das sind offizielle Vergleichswerte; der reale Verbrauch hängt unter anderem von Fahrweise, Wetter, Verkehr und Ausstattung ab.`);
  if (/antrieb|hybrid|elektro|laden|motor/.test(lower)) return assistantReply(`Der ${m.name} wird in dieser Datenbasis mit ${m.drive} geführt. ${m.tradeoff}`, { html: promptRailHtml([["Passt zu meinem Alltag?", `Passt der ${m.name} zu meinem Alltag?`], ["Alternative zeigen", `Welche Alternative zum ${m.name} sollte ich prüfen?`]]) });
  if (/allrad|4wd/.test(lower) && id === "outlander") return assistantReply("Ja. Der OUTLANDER ist in der geprüften Datenbasis als Plug-in Hybrid mit 4WD geführt. Der Nutzen ist vor allem dann stimmig, wenn Sie den Allradantrieb wirklich brauchen und die Batterie im Alltag regelmäßig laden können.");
  if (/leistung|ps|kw/.test(lower) && id === "outlander") return assistantReply("Für die OUTLANDER Diamant-Variante sind 225 kW Systemleistung belegt. Eine pauschale Leistungsangabe für jede Ausstattung würde ich daraus nicht ableiten.");
  if (/passt|geeignet|richtig für|alltag/.test(lower)) {
    state.flow = "advisor";
    state.answers.interest = id;
    state.lastQuestion = "use";
    if (!state.asked.includes("use")) state.asked.push("use");
    const fitReason = {
      asx: "Sie einen kompakten SUV für Stadt und gemischten Alltag suchen",
      grandis: "Sie einen effizienten Familien-SUV ohne Ladepflicht suchen",
      eclipse: "Sie konsequent elektrisch fahren und zuverlässig laden können",
      outlander: "Sie Plug-in Hybrid, Langstrecken-Flexibilität und 4WD wirklich nutzen",
      colt: "Sie gezielt einen kompakten Restbestand suchen"
    }[id];
    return assistantReply(`Der ${m.name} ist besonders schlüssig, wenn ${fitReason}. Der ehrliche Gegencheck: ${m.tradeoff} Wofür wird das Auto hauptsächlich gebraucht?`, { html: choicesHtml(QUESTIONS.use.choices) });
  }
  if (/sicher belegt|modelldaten|überblick|was ist/.test(lower)) return assistantReply(`Zum ${m.name} sind in dieser Demo sicher belegt: ${m.label}, Einstieg ab ${m.price}, ${m.drive}, ${m.efficiency} und ${m.co2}. ${m.tradeoff}`);
  if (/\?|hat |kann |gibt es|ausstattung|technologie|sitz|kofferraum|maß|breit|lang|hoch/.test(lower)) {
    return assistantReply(`Dieses Detail ist in der aktuell geprüften Demo-Datenbasis zum ${m.name} nicht enthalten. Sicher belegt sind der Einstiegspreis von ${m.price}, der Antrieb ${m.drive} und ${m.efficiency}. Für die konkrete Detailfrage würde CAIDA im Produkt die aktuelle offizielle Modelldatenquelle abrufen – hier erfinde ich keine Antwort.`, { html: promptRailHtml([["Geprüfte Basis zeigen", `Was ist zum ${m.name} sicher belegt?`], ["Alltagspassung prüfen", `Passt der ${m.name} zu meinem Alltag?`]]) });
  }
  state.flow = "advisor";
  state.lastQuestion = "use";
  if (!state.asked.includes("use")) state.asked.push("use");
  return assistantReply(`Der ${m.name} ist als ${m.label.toLowerCase()} positioniert und startet geprüft bei ${m.price}. Der stärkste Grund: ${m.reasons[0].toLowerCase()}. Der ehrliche Haken: ${m.tradeoff} Wofür würden Sie ihn hauptsächlich nutzen?`, { html: choicesHtml(QUESTIONS.use.choices) });
}

function answerCompetitorSafely(text, id) {
  if (!id || !MODELS[id]) {
    return assistantReply("Einen fairen Markenvergleich mache ich nur mit belegten Daten auf beiden Seiten. Welches Mitsubishi Modell soll ich einordnen? Die offiziellen Daten des Wettbewerbers können Sie anschließend einfach hier einfügen.", { html: modelChoiceHtml("ask-model") });
  }
  const m = MODELS[id];
  return assistantReply(`Zum ${m.name} kann ich sicher belegen: Einstieg ab ${m.price}, ${m.drive} und ${m.efficiency}. Für den genannten Wettbewerber liegen mir im Prototyp keine geprüften Daten vor. Deshalb behaupte ich weder einen Sieger noch Details zu Garantie, Technik oder Infotainment. Wenn Sie die offiziellen Wettbewerberdaten hier einfügen, vergleiche ich beide sauber.`, { html: sourceCardHtml(id), hint: "Keine ungeprüften Wettbewerberdaten verwendet" });
}

function scoreModels() {
  const scores = { asx: 1, grandis: 1, eclipse: 1, outlander: 1 };
  const a = state.answers;
  if (a.use === "city") { scores.asx += 5; scores.eclipse += 2; }
  if (a.use === "mixed") { scores.asx += 2; scores.grandis += 3; scores.outlander += 1; }
  if (a.use === "family") { scores.grandis += 6; scores.outlander += 4; }
  if (a.use === "long") { scores.eclipse += 3; scores.outlander += 4; scores.grandis += 1; }
  if (a.people === "small") { scores.asx += 4; scores.eclipse += 2; }
  if (a.people === "medium") { scores.asx += 2; scores.grandis += 4; scores.eclipse += 2; }
  if (a.people === "large") { scores.grandis += 5; scores.outlander += 5; }
  if (a.drive === "electric") scores.eclipse += 10;
  if (a.drive === "hybrid") { scores.grandis += 6; scores.asx += 5; }
  if (a.drive === "phev") scores.outlander += 10;
  if (a.charging === "home" || a.charging === "work") { scores.eclipse += 3; scores.outlander += 2; }
  if (a.charging === "unclear") { scores.grandis += 2; scores.asx += 2; }
  if (a.budget === "total") { scores.asx += 4; scores.grandis += 2; }
  if (a.interest && scores[a.interest] !== undefined) scores[a.interest] += 3;
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

async function makeRecommendation() {
  const ranking = scoreModels();
  state.recommended = ranking[0];
  state.alternative = ranking.find(id => id !== state.recommended);
  if (state.recommended === "grandis" && state.answers.use === "family") state.alternative = "outlander";
  updateContextStrip();
  const lead = recommendationLead(state.recommended);
  await assistantReply(lead);
  return renderRecommendation(state.recommended, state.alternative, true);
}

function recommendationLead(id) {
  const model = MODELS[id];
  if (id === "grandis") return `Meine klare Empfehlung ist der ${model.name}. Er trifft Ihren Alltag besser als ein unnötig großes oder komplexes Modell.`;
  if (id === "eclipse") return `Für Ihr Profil ist der vollelektrische ${model.name} die stimmigste Wahl – vorausgesetzt, die Ladesituation passt so, wie Sie sie beschrieben haben.`;
  if (id === "outlander") return `Der ${model.name} passt am besten: elektrisch im Alltag, flexibel auf Strecke und mit dem zusätzlichen Rückhalt des Allradantriebs.`;
  return `Der ${model.name} ist für Ihr Profil die vernünftigste und zugleich vielseitige Wahl.`;
}

function recommendationHtml(id, alternative, primary) {
  const m = MODELS[id];
  const alt = MODELS[alternative];
  return `<section class="recommendation" aria-label="CAIDA Empfehlung ${m.name}">
    <div class="recommendation__visual">
      <span class="recommendation__badge">${primary ? "CAIDAS EMPFEHLUNG" : "STARKE ALTERNATIVE"}</span>
      <img src="${m.image}" alt="Mitsubishi ${m.name}">
    </div>
    <div class="recommendation__content">
      <div class="recommendation__top">
        <div><h3>${m.name}</h3><p>${m.label}</p></div>
        <div class="recommendation__price"><strong>ab ${m.price}</strong><span>Aktionspreis · Stand ${DATA_STAND}</span></div>
      </div>
      <ul class="reason-list">${m.reasons.map(reason => `<li>${reason}</li>`).join("")}</ul>
      <div class="tradeoff"><strong>Fairer Hinweis:</strong> ${m.tradeoff}</div>
      <div class="spec-row">
        <div class="spec"><span>Antrieb</span><strong>${m.drive}</strong></div>
        <div class="spec"><span>Verbrauch</span><strong>${m.efficiency}</strong></div>
      </div>
      <div class="card-actions">
        <button class="button button--primary" type="button" data-action="trial" data-value="${id}">Probefahrt vorbereiten</button>
        <button class="button button--secondary" type="button" data-action="offer" data-value="${id}">Angebotsprofil</button>
        ${primary ? `<button class="button button--secondary" type="button" data-action="compare-recommendations">Mit ${alt.name} vergleichen</button>` : `<button class="button button--secondary" type="button" data-action="source" data-value="${id}">Geprüfte Modelldaten</button>`}
      </div>
    </div>
  </section>`;
}

function renderRecommendation(id, alternative, primary) {
  updateHero(id);
  return assistantReply("", { html: recommendationHtml(id, alternative, primary), hint: "Preise zzgl. Überführungskosten. Abbildungen können Ausstattungsdetails zeigen." }, 260);
}

function updateHero(id) {
  const m = MODELS[id];
  if (!m || !els.heroCar) return;
  els.heroCar.classList.add("is-changing");
  setTimeout(() => {
    els.heroCar.src = m.image;
    els.heroModel.textContent = m.name;
    if (els.heroModelLabel) els.heroModelLabel.textContent = m.name;
    els.heroCar.classList.remove("is-changing");
  }, 240);
}

function modelChoiceHtml(action) {
  const items = ["asx", "grandis", "eclipse", "outlander"].map(id => [MODELS[id].name, id, MODELS[id].label]);
  return choicesHtml(items, action, true);
}

async function startCompare() {
  state.flow = "compare";
  addMessage("user", "Modelle vergleichen");
  return assistantReply("Welche Modelle möchten Sie gegenüberstellen? Sie können auch einfach beide Namen schreiben.", { html: modelChoiceHtml("compare-model") });
}

async function continueCompare() {
  if (state.compare.length >= 2) return renderComparison(state.compare[0], state.compare[1]);
  const first = state.compare[0];
  const text = first ? `Gut, ${MODELS[first].name} ist gesetzt. Welches Modell soll daneben?` : "Welche beiden Modelle möchten Sie vergleichen?";
  return assistantReply(text, { html: modelChoiceHtml("compare-model") });
}

function compareHtml(aId, bId) {
  const a = MODELS[aId], b = MODELS[bId];
  return `<section class="compare-card" aria-label="Vergleich ${a.name} und ${b.name}">
    <div class="compare-card__head"><span></span>
      <div class="compare-card__model"><img src="${a.image}" alt=""><strong>${a.name}</strong></div>
      <div class="compare-card__model"><img src="${b.image}" alt=""><strong>${b.name}</strong></div>
    </div>
    ${compareRow("Charakter", a.label, b.label)}
    ${compareRow("Antrieb", a.drive, b.drive)}
    ${compareRow("Ab-Preis", a.price, b.price)}
    ${compareRow("Verbrauch", a.efficiency, b.efficiency)}
    ${compareRow("CAIDA sieht", conciseFit(aId), conciseFit(bId))}
  </section>
  <div class="quick-actions">
    ${buttonHtml(`Probefahrt ${a.name}`, "trial", aId, true)}
    ${buttonHtml(`Probefahrt ${b.name}`, "trial", bId)}
  </div>`;
}

function compareRow(label, a, b) {
  return `<div class="compare-row"><span>${label}</span><strong>${a}</strong><strong>${b}</strong></div>`;
}

function conciseFit(id) {
  return {
    asx: "Kompakter, vielseitiger Einstieg",
    grandis: "Effizienter Familienalltag",
    eclipse: "Konsequent elektrisch",
    outlander: "PHEV, Leistung und Allrad",
    colt: "Restbestände / Kurz-Zulassung"
  }[id];
}

async function renderComparison(aId, bId) {
  state.compare = [aId, bId];
  const a = MODELS[aId], b = MODELS[bId];
  let verdict = `Der ${a.name} ist die bessere Wahl, wenn ${conciseFit(aId).toLowerCase()} zählt. Der ${b.name} gewinnt, wenn ${conciseFit(bId).toLowerCase()} wichtiger ist.`;
  if ([aId, bId].includes("grandis") && [aId, bId].includes("outlander")) verdict = "Der Grandis ist der ruhigere, effizientere Familien-Allrounder ohne Ladepflicht. Der Outlander lohnt sich, wenn Sie regelmäßig laden, mehr Leistung und 4WD wirklich nutzen.";
  await assistantReply(verdict);
  updateHero(aId);
  return assistantReply("", { html: compareHtml(aId, bId), hint: `Belegte deutsche Modelldaten · Stand ${DATA_STAND}` }, 240);
}

async function startService(original = "") {
  state.flow = "service";
  if (!original) addMessage("user", "Ich fahre bereits Mitsubishi");
  const topics = [["Wartung & Service", "maintenance"], ["Garantie", "warranty"], ["Panne", "breakdown"], ["Zubehör & Teile", "accessories"], ["Dokumente / CoC", "documents"]];
  return assistantReply("Gern. Ich bleibe bei offiziellen Informationen und führe Sie bei fahrzeugbezogenen Problemen direkt zum passenden Mitsubishi-Weg.", { html: choicesHtml(topics, "service-topic") });
}

async function serviceTopic(topic, label) {
  addMessage("user", label);
  const content = {
    maintenance: ["Für Wartung und Reparatur ist der Mitsubishi-Partner der richtige Weg. CAIDA kann im Produkt Fahrzeug, Kilometerstand und Wunschtermin aufnehmen und die Übergabe vorbereiten.", "https://www.mitsubishi-motors.de/service-garantien/service"],
    warranty: ["Mitsubishi veröffentlicht die geltenden Garantieinformationen zentral. Für eine verbindliche Prüfung braucht der Partner Fahrzeugdaten und Erstzulassung – CAIDA würde diese getrennt vom KI-Dialog erfassen.", "https://www.mitsubishi-motors.de/service-garantien/garantien"],
    breakdown: ["Bei einer akuten Panne sollte CAIDA nicht diagnostizieren. Sie führt unmittelbar zur Mitsubishi Assistance beziehungsweise zum zuständigen Partner.", "https://www.mitsubishi-motors.de/service-garantien/service"],
    accessories: ["Originalzubehör und Verfügbarkeit hängen vom Modell und teilweise vom Modelljahr ab. CAIDA kann das Fahrzeug einordnen und anschließend nur passende offizielle Angebote zeigen.", "https://www.mitsubishi-motors.de/zubehoer"],
    documents: ["Bei CoC- oder Zulassungsdokumenten führt CAIDA in einen strukturierten Kontaktweg. Sie erfindet keine Aussage zu Gebühren oder Bearbeitungszeit.", "https://www.mitsubishi-motors.de/kontakt"]
  }[topic];
  return assistantReply(content[0], { html: `<div class="quick-actions">${buttonHtml("Händler finden", "dealer-search", "", true)}${buttonHtml("Eigene Frage", "focus-input")}</div>` });
}

function sourceCardHtml(id) {
  const m = MODELS[id];
  if (!m) return "";
  return `<section class="source-card" aria-label="Geprüfte Daten ${m.name}">
    <div><span>OFFIZIELLE DATEN · ${DATA_STAND}</span><h3>${m.name}</h3><p>${m.label}</p></div>
    <dl><div><dt>Preis</dt><dd>ab ${m.price}</dd></div><div><dt>Antrieb</dt><dd>${m.drive}</dd></div><div><dt>Verbrauch</dt><dd>${m.efficiency}</dd></div><div><dt>CO₂</dt><dd>${m.co2}</dd></div></dl>
    <small>Quelle: Mitsubishi Motors Deutschland · im Prototyp geprüft und lokal dargestellt</small>
  </section>`;
}

function nextPromptHtml(question, modelId) {
  const text = question.toLowerCase();
  if (/vergleich|unterschied/.test(text)) return promptRailHtml([
    ["Was passt besser zu mir?", "Welches der Modelle passt besser zu meinem Alltag – und warum?"],
    ["Probefahrt vorbereiten", "Wie würde ich eine sinnvolle Probefahrt vorbereiten?"]
  ]);
  if (/elektro|laden|reichweite|strom/.test(text)) return promptRailHtml([
    ["Laden im Alltag", "Was müsste ich über das Laden im Alltag noch wissen?"],
    ["Passendes Modell", "Welches Mitsubishi Modell passt dazu am besten?"]
  ]);
  if (/famil|kind|platz|gepäck/.test(text)) return promptRailHtml([
    ["Grandis oder Outlander?", "Vergleiche Grandis und Outlander für unseren Familienalltag."],
    ["Antrieb klären", "Welcher Antrieb wäre für uns sinnvoll?"]
  ]);
  if (modelId && MODELS[modelId]) return promptRailHtml([
    ["Passt er zu mir?", `Passt der ${MODELS[modelId].name} zu meinem Alltag?`],
    ["Ehrlicher Vergleich", `Mit welchem Mitsubishi sollte ich den ${MODELS[modelId].name} vergleichen?`]
  ]);
  return promptRailHtml([
    ["Modell finden", "Welcher Mitsubishi passt zu meinem Alltag?"],
    ["Antriebe vergleichen", "Erkläre mir die Mitsubishi Antriebe einfach."]
  ]);
}

async function askConnectedAI(question, modelId = state.recommended) {
  if (!aiConnection.enabled) return modelId && MODELS[modelId] ? answerVerifiedModelQuestion(question, modelId) : answerLocallyWithoutAI(question);
  const fallback = () => assistantReply("Gemini ist gerade nicht erreichbar. Ich bleibe bei der geprüften Mitsubishi-Datenbasis, statt etwas zu erfinden.", { html: promptRailHtml([["Erneut versuchen", question], ["Verbindung prüfen", "__connect__"]]) });
  const typing = addTyping();
  try {
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, modelId, context: { answers: state.answers, recommended: state.recommended }, messages: state.aiMessages.slice(-6) })
    });
    const data = await response.json();
    if (!response.ok) { typing.remove(); return fallback(); }
    if (!data.answer) { typing.remove(); return fallback(); }
    state.aiMessages.push({ role: "user", content: question }, { role: "assistant", content: data.answer });
    typing.remove();
    return addMessage("assistant", data.answer, { html: nextPromptHtml(question, modelId), hint: `Gemini · ${data.model} · geprüfter Mitsubishi-Kontext` });
  } catch (error) {
    typing.remove();
    return fallback();
  }
}

async function loadAIStatus() {
  if (STATIC_HOSTED) {
    aiConnection = { enabled: false, provider: "none", model: null, lastError: null, staticHosted: true };
    els.aiStatus.textContent = "Online-Demo · ohne KI-Backend";
    els.aiStatus.setAttribute("aria-label", "Hinweis zur öffentlichen Online-Demo");
    els.privacyText.textContent = "Online-Demo · Formulardaten bleiben im Browser";
    const stateLabel = document.querySelector("#ai-config-state");
    if (stateLabel) stateLabel.textContent = "lokal verfügbar";
    refreshIntroHint();
    return;
  }
  try {
    const response = await fetch("/api/ai-status");
    if (!response.ok) throw new Error("AI status unavailable");
    const data = await response.json();
    aiConnection = data;
    const providerName = data.provider === "gemini" ? "Gemini" : data.provider === "openai" ? "OpenAI" : "";
    els.aiStatus.textContent = data.enabled ? `${providerName} aktiv · ${data.model}` : data.managed ? "Vercel-Demo · Gemini fehlt" : "Demo-Modus · KI verbinden";
    els.aiStatus.setAttribute("aria-label", data.enabled ? `${providerName} ist aktiv` : data.managed ? "Gemini ist serverseitig noch nicht konfiguriert" : "Gemini mit CAIDA verbinden");
    els.privacyText.textContent = data.enabled
      ? `${providerName} aktiv · Fragen werden an ${providerName} übertragen`
      : data.managed ? "Online-Demo · keine KI-Übertragung" : "Lokaler Prototyp · keine Übertragung";
    const stateLabel = document.querySelector("#ai-config-state");
    if (stateLabel) stateLabel.textContent = data.enabled ? `${providerName} · ${data.model}` : "nicht aktiv";
    const configForm = document.querySelector("#ai-config-form");
    const configCopy = document.querySelector("#ai-config-copy");
    const configMessage = document.querySelector("#ai-config-message");
    if (data.managed && configForm) {
      configForm.hidden = true;
      if (configCopy) configCopy.textContent = "Öffentliche Demo: Der Gemini-Key liegt ausschließlich als verschlüsseltes Vercel-Secret vor und wird nie an den Browser übertragen.";
      if (configMessage) configMessage.textContent = data.enabled ? "Serverseitige Gemini-Verbindung aktiv." : "Vercel-Backend bereit · Gemini-Secret fehlt noch.";
    }
    refreshIntroHint();
  } catch {
    aiConnection = { enabled: false, provider: "none", model: null, lastError: "Lokaler KI-Status nicht erreichbar." };
    els.aiStatus.textContent = "Demo-Modus · KI verbinden";
    els.privacyText.textContent = "Lokaler Prototyp · keine Übertragung";
    refreshIntroHint();
  }
}

async function submitAIConfiguration(form, message, idleLabel = "KI im Chat verbinden") {
  if (STATIC_HOSTED) throw new Error("Auf GitHub Pages ist kein sicherer KI-Backend-Proxy verbunden.");
  const button = form.querySelector("button[type='submit']");
  const keyInput = form.querySelector("[name='key']");
  const data = Object.fromEntries(new FormData(form));
  button.disabled = true;
  button.textContent = "Key und Modell werden geprüft …";
  message.textContent = "Verbindung zu Google wird getestet.";
  try {
    const response = await fetch("/api/ai-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Verbindung fehlgeschlagen.");
    keyInput.value = "";
    const providerName = result.provider === "gemini" ? "Gemini" : "OpenAI";
    message.textContent = `${providerName} ist verbunden · ${result.model}`;
    await loadAIStatus();
    return result;
  } catch (error) {
    message.textContent = `Nicht verbunden: ${error.message}`;
    await loadAIStatus();
    throw error;
  } finally {
    button.disabled = false;
    button.textContent = idleLabel;
  }
}

function setupAIConfig() {
  const form = document.querySelector("#ai-config-form");
  const message = document.querySelector("#ai-config-message");
  if (!form) return;
  const provider = form.querySelector("#ai-provider");
  const model = form.querySelector("#ai-model");
  const key = form.querySelector("#ai-key");
  const keyLabel = form.querySelector("#ai-key-label");
  const providerDefaults = {
    gemini: { model: "gemini-2.5-flash-lite", label: "Gemini API-Key", placeholder: "AQ… oder AIza…" },
    openai: { model: "gpt-5-mini", label: "OpenAI API-Key", placeholder: "sk-…" }
  };
  if (STATIC_HOSTED) {
    form.querySelectorAll("input, select, button").forEach(item => { item.disabled = true; });
    message.textContent = "Die Online-Demo nutzt keinen API-Key im Browser. Lokal steht der Node-Gateway bereit.";
    return;
  }
  provider.addEventListener("change", () => {
    const selected = providerDefaults[provider.value];
    model.value = selected.model;
    keyLabel.textContent = selected.label;
    key.placeholder = selected.placeholder;
    message.textContent = "";
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await submitAIConfiguration(form, message);
    } catch {}
  });
}

async function answerFollowUp(text) {
  const id = state.recommended;
  const m = MODELS[id];
  const lower = text.toLowerCase();
  if (/preis|kost|rate/.test(lower)) return assistantReply(`Der aktuell ausgewiesene Aktions-Ab-Preis des ${m.name} liegt bei ${m.price}, zuzüglich Überführungskosten. Eine Monatsrate nenne ich nur mit einem konkreten, aktuellen Angebot.`, { html: `<div class="quick-actions">${buttonHtml("Probefahrt vorbereiten", "trial", id, true)}${buttonHtml("Quelle öffnen", "source", id)}</div>` });
  if (/nachteil|dagegen|haken|aber/.test(lower)) return assistantReply(m.tradeoff);
  if (/verbrauch|effizienz|co2/.test(lower)) return assistantReply(`Offiziell ausgewiesen: ${m.efficiency}; ${m.co2}. Reale Werte hängen unter anderem von Fahrweise, Wetter, Verkehr und Ausstattung ab.`);
  if (/reichweite/.test(lower) && id === "eclipse") return assistantReply("Mitsubishi nennt für den Eclipse Cross mit 87-kWh-Batterie bis zu 627 km WLTP-Reichweite. Die reale Reichweite hängt unter anderem von Wetter, Geschwindigkeit und Klimatisierung ab.");
  if (/probefahrt|fahren|testen/.test(lower)) return openTrial(id);
  if (/vergleich|alternative/.test(lower)) {
    state.flow = "compare"; state.compare = [id, state.alternative];
    return renderComparison(id, state.alternative);
  }
  return aiConnection.enabled ? askConnectedAI(text, id) : answerVerifiedModelQuestion(text, id);
}

function flowProgressHtml(current, labels) {
  return `<ol class="flow-progress" style="--flow-count:${labels.length}" aria-label="Fortschritt">${labels.map((label, index) => `<li class="${index + 1 < current ? "is-done" : index + 1 === current ? "is-current" : ""}"><span>${index + 1 < current ? "✓" : index + 1}</span><small>${escapeHtml(label)}</small></li>`).join("")}</ol>`;
}

function modelMiniHtml(id) {
  const m = MODELS[id];
  return `<div class="flow-model"><img src="${m.image}" alt=""><div><small>Ausgewähltes Modell</small><strong>${m.name}</strong><span>ab ${m.price} · ${m.drive}</span></div></div>`;
}

function trialHtml(id) {
  return `<form class="lead-form flow-card" data-trial-postcode-form>
    ${flowProgressHtml(1, ["Region", "Partner", "Wunschzeit", "Prüfen"])}
    ${modelMiniHtml(id)}
    <h3>Wo möchten Sie probefahren?</h3>
    <p>Die Postleitzahl bestimmt, welche verifizierten Partner im Chat angezeigt werden.</p>
    <div class="field-grid field-grid--single"><div class="field"><label for="trial-postcode-${id}">Postleitzahl</label><input id="trial-postcode-${id}" name="postcode" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}" maxlength="5" placeholder="z. B. 61169" required></div></div>
    <button class="button button--primary" type="submit">Partner anzeigen</button>
  </form>`;
}

async function openTrial(id) {
  if (!id || !MODELS[id]) {
    state.flow = "trial-select";
    return assistantReply("Welches Modell möchten Sie probefahren?", { html: modelChoiceHtml("trial-model") });
  }
  const previous = state.transaction || {};
  const postcode = previous.postcode || null;
  const dealer = previous.dealer || null;
  state.recommended = id;
  state.answers.interest = id;
  state.flow = "transaction";
  state.transaction = { kind: "trial", model: id, postcode, dealer, time: null, offerType: null, preference: null, name: null, contact: null };
  updateHero(id);
  if (postcode && dealer) {
    return assistantReply(`Ich übernehme ${postcode} und ${dealer} aus dem bisherigen Gespräch. Sie wählen nur noch Wunschzeit und Kontakt.`, { html: trialSlotHtml() });
  }
  return assistantReply("Wir machen das in vier klaren Schritten. Zuerst brauche ich nur die Region.", { html: trialHtml(id) });
}

function dealerChoicesHtml(postcode, dealers, action, current = 2, labels = ["Region", "Partner", "Wunschzeit", "Prüfen"]) {
  if (!dealers) {
    return `<section class="lead-form flow-card">${flowProgressHtml(current, labels)}<h3>Keine verifizierten Demodaten für ${escapeHtml(postcode)}</h3><p>CAIDA zeigt bewusst keine erfundenen Händler. Für den klickbaren Prototyp ist aktuell nur 61169 verifiziert.</p><div class="quick-actions">${buttonHtml("Mit Demo-PLZ 61169 testen", action === "trial-dealer" ? "trial-demo-postcode" : "offer-demo-postcode", "61169", true)}${buttonHtml("Andere PLZ eingeben", "dealer-search", "")}</div></section>`;
  }
  const modelId = state.transaction.model || state.answers.interest;
  const availability = action === "trial-dealer" && MODELS[modelId]
    ? `<div class="availability-note"><strong>${MODELS[modelId].name} Verfügbarkeit:</strong> wird mit der Anfrage vom Partner bestätigt – im Prototyp nicht als Bestand behauptet.</div>`
    : "";
  return `<section class="lead-form flow-card">${flowProgressHtml(current, labels)}<div class="flow-kicker">VERIFIZIERTE PARTNER · ${escapeHtml(postcode)}</div><h3>Welcher Partner passt?</h3><p>Entfernungen und Namen stammen aus dem geprüften Demo-Datensatz vom ${DATA_STAND}.</p>${availability}<div class="dealer-list">${dealers.map((d, i) => `<button type="button" class="dealer-option${i === 0 ? " is-nearest" : ""}" data-action="${action}" data-value="${escapeHtml(d.name)}"><span class="dealer-option__index">0${i + 1}</span><span><strong>${escapeHtml(d.name)}</strong><small>${d.type}</small></span><b>${d.distance}</b></button>`).join("")}</div></section>`;
}

async function submitTrialPostcode(form) {
  const postcode = String(new FormData(form).get("postcode") || "");
  state.transaction.postcode = postcode;
  addMessage("user", `PLZ ${postcode}`);
  return assistantReply("Hier sind ausschließlich die Partner, die im Prototyp verifiziert sind.", { html: dealerChoicesHtml(postcode, VERIFIED_DEALERS[postcode], "trial-dealer") }, 180);
}

async function selectTrialDealer(name) {
  state.flow = "transaction";
  state.transaction.dealer = name;
  addMessage("user", name);
  return assistantReply("Partner vorgemerkt. Jetzt reicht ein Wunschzeitraum; den exakten Termin müsste der Partner bestätigen.", { html: trialSlotHtml() });
}

function trialSlotHtml() {
  return `<section class="lead-form flow-card">${flowProgressHtml(3, ["Region", "Partner", "Wunschzeit", "Prüfen"])}<h3>Wann passt es grundsätzlich?</h3><p>Das ist ein Wunschzeitraum, keine behauptete Live-Verfügbarkeit.</p><div class="slot-grid">${buttonHtml("Werktags vormittags", "trial-slot", "Werktags vormittags", true)}${buttonHtml("Werktags nachmittags", "trial-slot", "Werktags nachmittags")}${buttonHtml("Samstag", "trial-slot", "Samstag")}${buttonHtml("Flexibel", "trial-slot", "Flexibel")}</div></section>`;
}

function trialContactHtml() {
  const t = state.transaction;
  return `<form class="lead-form flow-card" data-trial-contact-form>${flowProgressHtml(4, ["Region", "Partner", "Wunschzeit", "Prüfen"])}<h3>Wer darf kontaktiert werden?</h3><p>Die Daten bleiben in dieser Demo auf dem lokalen Rechner.</p><div class="field-grid"><div class="field"><label for="trial-name">Name</label><input id="trial-name" name="name" autocomplete="name" placeholder="Max Mustermann" required></div><div class="field"><label for="trial-contact">E-Mail oder Telefon</label><input id="trial-contact" name="contact" autocomplete="email" placeholder="max@beispiel.de" required></div></div><div class="demo-disclaimer"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg><span>Lokaler Concept Prototype. Keine Übertragung an ${escapeHtml(t.dealer)} oder Mitsubishi.</span></div><button class="button button--primary" type="submit">Angaben prüfen</button></form>`;
}

async function selectTrialSlot(value) {
  state.transaction.time = value;
  addMessage("user", value);
  return assistantReply("Fast fertig. Vor dem lokalen Speichern sehen Sie noch einmal die vollständige Zusammenfassung.", { html: trialContactHtml() });
}

async function reviewTrial(form) {
  const data = Object.fromEntries(new FormData(form));
  state.transaction.name = String(data.name || "");
  state.transaction.contact = String(data.contact || "");
  const t = state.transaction;
  const m = MODELS[t.model];
  addMessage("user", "Kontaktdaten eingetragen");
  return assistantReply("Bitte prüfen Sie die Demo-Anfrage. Erst der rote Button legt sie lokal ab.", { html: `<section class="lead-form flow-card review-card">${flowProgressHtml(4, ["Region", "Partner", "Wunschzeit", "Prüfen"])}<div class="flow-kicker">ZUSAMMENFASSUNG</div><h3>${m.name} Probefahrt</h3><dl><div><dt>Partner</dt><dd>${escapeHtml(t.dealer)}</dd></div><div><dt>Region</dt><dd>${escapeHtml(t.postcode)}</dd></div><div><dt>Wunschzeit</dt><dd>${escapeHtml(t.time)}</dd></div><div><dt>Kontakt</dt><dd>${escapeHtml(t.name)} · ${escapeHtml(t.contact)}</dd></div></dl><div class="demo-disclaimer"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg><span>Der Button simuliert die Übermittlung ausschließlich in die lokale Demo-Inbox.</span></div><button class="button button--primary" type="button" data-action="confirm-trial">Demo-Anfrage lokal speichern</button></section>` });
}

async function storeLocalTransaction(kind) {
  const t = state.transaction;
  const m = MODELS[t.model];
  const payload = { model: m.name, postcode: t.postcode, time: kind === "trial" ? t.time : `Angebot · ${t.offerType} · ${t.preference}`, name: t.name, contact: t.contact };
  let result;
  try {
    if (STATIC_HOSTED) throw new Error("static demo");
    const response = await fetch("/api/demo-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error("local endpoint unavailable");
    result = await response.json();
  } catch {
    result = { id: `LOCAL-${Date.now().toString().slice(-5)}`, receivedAt: new Date().toISOString(), localOnly: true };
  }
  localInbox.unshift({ ...payload, ...result });
  renderInbox();
  return result;
}

async function confirmTrial() {
  const result = await storeLocalTransaction("trial");
  return assistantReply("Die Probefahrt wurde nicht an einen Händler gesendet. Sie ist nur für die Präsentation lokal gespeichert.", { html: `<section class="success-card local-success"><div class="success-card__icon">✓</div><div class="flow-kicker">LOKALE DEMO-INBOX</div><h3>Probefahrt vorbereitet</h3><p>Referenz ${escapeHtml(result.id)} · Ein echtes Produkt würde jetzt die Einwilligung protokollieren und die Anfrage an den gewählten Partner übergeben.</p><div class="quick-actions">${buttonHtml("Angebot ergänzen", "offer", state.transaction.model, true)}${buttonHtml("Weiter fragen", "focus-input")}</div></section>` });
}

function dealerSearchHtml() {
  return `<form class="lead-form flow-card" data-dealer-search-form><div class="flow-kicker">HÄNDLERSUCHE IM CHAT</div><h3>Welche Region?</h3><p>CAIDA zeigt nur verifizierte Partnerdaten und erfindet keine Standorte.</p><div class="field-grid field-grid--single"><div class="field"><label for="dealer-postcode">Postleitzahl</label><input id="dealer-postcode" name="postcode" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="z. B. 61169" required></div></div><button class="button button--primary" type="submit">Verifizierte Partner anzeigen</button></form>`;
}

function dealerHtml(postcode, dealers) {
  if (!dealers) return `<section class="lead-form flow-card"><div class="flow-kicker">HÄNDLERSUCHE</div><h3>Für ${escapeHtml(postcode)} fehlen verifizierte Demodaten</h3><p>CAIDA zeigt deshalb keine erfundenen Namen. Im klickbaren Prototyp ist 61169 hinterlegt.</p><div class="quick-actions">${buttonHtml("Demo-PLZ 61169", "dealer-search", "61169", true)}${buttonHtml("Andere PLZ", "dealer-search", "")}</div></section>`;
  return dealerChoicesHtml(postcode, dealers, "dealer-pick", 1, ["Partner auswählen"]);
}

async function showDealers(postcode = "") {
  state.flow = "dealer";
  if (!postcode) return assistantReply("Ich starte die kontrollierte Händlersuche. Dafür brauche ich nur die Postleitzahl.", { html: dealerSearchHtml() });
  state.transaction.postcode = postcode;
  return assistantReply("", { html: dealerHtml(postcode, VERIFIED_DEALERS[postcode]) }, 180);
}

async function submitDealerSearch(form) {
  const postcode = String(new FormData(form).get("postcode") || "");
  addMessage("user", `PLZ ${postcode}`);
  return showDealers(postcode);
}

async function pickDealer(name) {
  state.flow = "start";
  state.transaction.dealer = name;
  addMessage("user", name);
  return assistantReply("Der Partner ist ausgewählt. Was möchten Sie dort vorbereiten? Noch wurde nichts übertragen.", { html: `<div class="quick-actions">${buttonHtml("Probefahrt planen", "trial-with-dealer", name, true)}${buttonHtml("Angebotsprofil", "offer-with-dealer", name)}${buttonHtml("Weiter fragen", "focus-input")}</div>` });
}

function offerTypeHtml(id) {
  return `<section class="lead-form flow-card">${flowProgressHtml(1, ["Modell", "Wunsch", "Partner", "Prüfen"])}${modelMiniHtml(id)}<h3>Welche Art Angebot interessiert Sie?</h3><p>CAIDA berechnet keine Fantasierate, sondern sammelt zuerst die Anforderungen für ein echtes Händlerangebot.</p><div class="choice-grid choice-grid--stack">${buttonHtml("Kauf", "offer-type", "Kauf", true, "Gesamtpreis im Fokus")}${buttonHtml("Finanzierung", "offer-type", "Finanzierung", false, "Monatsbudget einordnen")}${buttonHtml("Leasing", "offer-type", "Leasing", false, "Laufzeit und Kilometer")}</div></section>`;
}

async function openOffer(id) {
  if (!id || !MODELS[id]) {
    state.flow = "offer-select";
    return assistantReply("Für welches Modell soll ich ein Angebotsprofil vorbereiten?", { html: modelChoiceHtml("offer-model") });
  }
  const previous = state.transaction || {};
  state.transaction = { kind: "offer", model: id, postcode: previous.postcode || null, dealer: previous.dealer || null, time: null, offerType: null, preference: null, name: null, contact: null };
  state.flow = "transaction";
  state.recommended = id;
  state.answers.interest = id;
  updateHero(id);
  const contextNote = state.transaction.dealer ? ` ${state.transaction.dealer} und PLZ ${state.transaction.postcode} bleiben übernommen.` : "";
  return assistantReply(`Wir bauen ein belastbares Angebotsprofil; konkrete Konditionen müsste der Partner liefern.${contextNote}`, { html: offerTypeHtml(id) });
}

async function selectOfferType(value) {
  state.transaction.offerType = value;
  addMessage("user", value);
  const hasPartner = Boolean(state.transaction.postcode && state.transaction.dealer);
  const postcodeField = hasPartner ? "" : `<div class="field"><label for="offer-postcode">Postleitzahl</label><input id="offer-postcode" name="postcode" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="z. B. 61169" required></div>`;
  const buttonLabel = hasPartner ? "Mit übernommenem Partner weiter" : "Partner für Angebot wählen";
  return assistantReply("Welcher Rahmen ist Ihnen am wichtigsten?", { html: `<form class="lead-form flow-card" data-offer-details-form>${flowProgressHtml(2, ["Modell", "Wunsch", "Partner", "Prüfen"])}<h3>${escapeHtml(value)} einordnen</h3>${hasPartner ? `<div class="context-carry"><strong>Übernommen</strong><span>${escapeHtml(state.transaction.dealer)} · ${escapeHtml(state.transaction.postcode)}</span></div>` : ""}<div class="field-grid${hasPartner ? " field-grid--single" : ""}"><div class="field"><label for="offer-preference">Wichtigster Rahmen</label><select id="offer-preference" name="preference"><option>Gesamtpreis möglichst niedrig</option><option>Monatsbudget im Fokus</option><option>Flexible Laufzeit</option><option>Inzahlungnahme mitprüfen</option></select></div>${postcodeField}</div><button class="button button--primary" type="submit">${buttonLabel}</button></form>` });
}

async function reviewOfferDetails(form) {
  const data = Object.fromEntries(new FormData(form));
  state.transaction.preference = String(data.preference || "");
  if (data.postcode) state.transaction.postcode = String(data.postcode);
  addMessage("user", state.transaction.dealer ? state.transaction.preference : `${state.transaction.preference} · PLZ ${state.transaction.postcode}`);
  if (state.transaction.dealer) {
    return assistantReply("Modell, Region und Partner bleiben erhalten. Es fehlen nur noch Kontakt und Prüfung.", { html: offerContactHtml() });
  }
  return assistantReply("Jetzt wählen Sie den Partner, der das echte Angebot erstellen würde.", { html: dealerChoicesHtml(state.transaction.postcode, VERIFIED_DEALERS[state.transaction.postcode], "offer-dealer", 3, ["Modell", "Wunsch", "Partner", "Prüfen"]) });
}

async function selectOfferDealer(name) {
  state.transaction.dealer = name;
  addMessage("user", name);
  return assistantReply("Partner steht. Es fehlen nur noch Kontakt und Prüfung.", { html: offerContactHtml() });
}

function offerContactHtml() {
  return `<form class="lead-form flow-card" data-offer-contact-form>${flowProgressHtml(4, ["Modell", "Wunsch", "Partner", "Prüfen"])}<h3>Kontaktdaten für die Prüfung</h3><div class="field-grid"><div class="field"><label for="offer-name">Name</label><input id="offer-name" name="name" autocomplete="name" placeholder="Max Mustermann" required></div><div class="field"><label for="offer-contact">E-Mail oder Telefon</label><input id="offer-contact" name="contact" autocomplete="email" placeholder="max@beispiel.de" required></div></div><div class="demo-disclaimer"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg><span>Die öffentliche Demo sendet diese Angaben an niemanden.</span></div><button class="button button--primary" type="submit">Angebotsprofil prüfen</button></form>`;
}

async function reviewOfferContact(form) {
  const data = Object.fromEntries(new FormData(form));
  state.transaction.name = String(data.name || "");
  state.transaction.contact = String(data.contact || "");
  const t = state.transaction;
  const m = MODELS[t.model];
  addMessage("user", "Kontaktdaten eingetragen");
  return assistantReply("Das ist noch kein Angebot, sondern die saubere Anforderungsbasis dafür.", { html: `<section class="lead-form flow-card review-card">${flowProgressHtml(4, ["Modell", "Wunsch", "Partner", "Prüfen"])}<div class="flow-kicker">ANGEBOTSPROFIL</div><h3>${m.name} · ${escapeHtml(t.offerType)}</h3><dl><div><dt>Geprüfter Einstieg</dt><dd>ab ${m.price} zzgl. Überführung</dd></div><div><dt>Priorität</dt><dd>${escapeHtml(t.preference)}</dd></div><div><dt>Partner</dt><dd>${escapeHtml(t.dealer)}</dd></div><div><dt>Kontakt</dt><dd>${escapeHtml(t.name)} · ${escapeHtml(t.contact)}</dd></div></dl><div class="demo-disclaimer"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg><span>Keine Monatsrate oder Verfügbarkeit erfunden. Der Button speichert nur die Demo-Zusammenfassung lokal.</span></div><button class="button button--primary" type="button" data-action="confirm-offer">Angebotsprofil lokal speichern</button></section>` });
}

async function confirmOffer() {
  const result = await storeLocalTransaction("offer");
  return assistantReply("Das Angebotsprofil wurde nicht an Mitsubishi oder den Händler gesendet. Es liegt nur in der lokalen Demo-Inbox.", { html: `<section class="success-card local-success"><div class="success-card__icon">✓</div><div class="flow-kicker">LOKALE DEMO-INBOX</div><h3>Angebotsprofil vorbereitet</h3><p>Referenz ${escapeHtml(result.id)} · Ein echtes Angebot müsste der ausgewählte Partner mit aktuellen Konditionen erstellen.</p><div class="quick-actions">${buttonHtml("Probefahrt ergänzen", "trial", state.transaction.model, true)}${buttonHtml("Weiter fragen", "focus-input")}</div></section>` });
}

function renderInbox() {
  els.inboxCount.textContent = String(localInbox.length);
  els.inbox.innerHTML = localInbox.length ? localInbox.map(item => `<div class="inbox-item"><strong>${escapeHtml(item.model)}</strong><br>${escapeHtml(item.postcode)} · ${escapeHtml(item.time)}<br>${escapeHtml(item.name)} · ${escapeHtml(item.contact)}<br><small>${escapeHtml(item.id)}</small></div>`).join("") : "<p>Noch keine lokale Anfrage.</p>";
}

function launchScenario(id) {
  closeConcept();
  openChat(false);
  resetConversation();
  setTimeout(async () => {
    if (id === "family") return handleUserText("Wir sind eine Familie mit zwei Kindern und suchen viel Platz, aber kein unnötig großes Auto.");
    if (id === "electric") return handleUserText("Ich pendle täglich und überlege, ob ein Elektroauto für mich sinnvoll ist.");
    if (id === "compact") return handleUserText("Ich suche einen kompakten SUV und möchte beim Gesamtpreis vernünftig bleiben.");
    if (id === "outlander") return handleUserText("Der Outlander gefällt mir. Passt ein Plug-in Hybrid wirklich zu meinem Alltag?");
    if (id === "compare") return handleUserText("Vergleiche bitte Grandis und Outlander ehrlich miteinander.");
    if (id === "service") return startService();
  }, 260);
}

function bindDynamicActions(root) {
  root.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", async () => {
      const { action, value } = button.dataset;
      const actionSurface = button.closest(".flow-card") || button.closest(".choice-grid, .prompt-rail");
      if (actionSurface && action !== "focus-input") {
        actionSurface.classList.add("is-complete");
        actionSurface.querySelectorAll("button").forEach(item => { item.disabled = true; });
      }
      if (action === "dealer-pick") return pickDealer(value);
      if (action === "trial-dealer") return selectTrialDealer(value);
      if (action === "trial-slot") return selectTrialSlot(value);
      if (action === "confirm-trial") return confirmTrial();
      if (action === "trial-demo-postcode") {
        state.transaction.postcode = value;
        addMessage("user", `Demo-PLZ ${value}`);
        return assistantReply("Mit dem verifizierten Demo-Datensatz geht der Flow weiter.", { html: dealerChoicesHtml(value, VERIFIED_DEALERS[value], "trial-dealer") });
      }
      if (action === "offer-type") return selectOfferType(value);
      if (action === "offer-dealer") return selectOfferDealer(value);
      if (action === "confirm-offer") return confirmOffer();
      if (action === "offer-demo-postcode") {
        state.transaction.postcode = value;
        addMessage("user", `Demo-PLZ ${value}`);
        return assistantReply("Mit dem verifizierten Demo-Datensatz geht der Angebotsflow weiter.", { html: dealerChoicesHtml(value, VERIFIED_DEALERS[value], "offer-dealer", 3, ["Modell", "Wunsch", "Partner", "Prüfen"]) });
      }
      if (action === "trial-with-dealer") {
        const modelId = state.recommended || state.answers.interest;
        if (!modelId) return assistantReply("Welches Modell möchten Sie dort probefahren?", { html: modelChoiceHtml("trial-model") });
        const postcode = state.transaction.postcode;
        state.recommended = modelId;
        state.transaction = { kind: "trial", model: modelId, postcode, dealer: value, time: null, offerType: null, preference: null, name: null, contact: null };
        return selectTrialDealer(value);
      }
      if (action === "offer-with-dealer") {
        const modelId = state.recommended || state.answers.interest;
        if (!modelId) return assistantReply("Für welches Modell soll der Partner ein Angebot vorbereiten?", { html: modelChoiceHtml("offer-model") });
        const postcode = state.transaction.postcode;
        state.recommended = modelId;
        state.transaction = { kind: "offer", model: modelId, postcode, dealer: value, time: null, offerType: null, preference: null, name: null, contact: null };
        return assistantReply("Der Partner ist vorgemerkt. Jetzt legen wir fest, welche Angebotsart Sie benötigen.", { html: offerTypeHtml(modelId) });
      }
      if (action === "focus-input") return els.input.focus();
      if (action === "show-alternative") return renderRecommendation(state.alternative, state.recommended, false);
      button.closest(".choice-grid, .prompt-rail")?.querySelectorAll("button").forEach(b => { b.disabled = true; });
      await handleAction(action, value, button);
    });
  });
  const lockSubmittedForm = form => {
    form.classList.add("is-complete");
    form.querySelectorAll("input, select, button").forEach(item => { item.disabled = true; });
  };
  root.querySelectorAll("[data-trial-postcode-form]").forEach(form => form.addEventListener("submit", event => { event.preventDefault(); const task = submitTrialPostcode(form); lockSubmittedForm(form); return task; }));
  root.querySelectorAll("[data-trial-contact-form]").forEach(form => form.addEventListener("submit", event => { event.preventDefault(); const task = reviewTrial(form); lockSubmittedForm(form); return task; }));
  root.querySelectorAll("[data-dealer-search-form]").forEach(form => form.addEventListener("submit", event => { event.preventDefault(); const task = submitDealerSearch(form); lockSubmittedForm(form); return task; }));
  root.querySelectorAll("[data-offer-details-form]").forEach(form => form.addEventListener("submit", event => { event.preventDefault(); const task = reviewOfferDetails(form); lockSubmittedForm(form); return task; }));
  root.querySelectorAll("[data-offer-contact-form]").forEach(form => form.addEventListener("submit", event => { event.preventDefault(); const task = reviewOfferContact(form); lockSubmittedForm(form); return task; }));
  root.querySelectorAll("[data-ai-chat-form]").forEach(form => form.addEventListener("submit", async event => {
    event.preventDefault();
    const status = form.querySelector("[data-ai-chat-status]");
    try {
      const result = await submitAIConfiguration(form, status, "Gemini sicher verbinden");
      form.outerHTML = `<section class="success-card"><div class="success-card__icon">✓</div><h3>Gemini ist verbunden</h3><p>${escapeHtml(result.model)} beantwortet jetzt freie Fragen. Der Key bleibt unsichtbar im Arbeitsspeicher.</p></section>`;
      await assistantReply("Perfekt. Ab jetzt können Sie ganz normal schreiben – ich antworte mit Gemini und bleibe im geprüften Mitsubishi-Kontext.");
    } catch {}
  }));
}

function renderScenarios() {
  els.scenarioList.innerHTML = SCENARIOS.map((s, i) => `<button type="button" class="scenario-button" data-scenario="${s.id}"><span class="scenario-button__num">0${i + 1}</span><span><strong>${s.title}</strong><small>${s.note}</small></span></button>`).join("");
  els.scenarioList.querySelectorAll("[data-scenario]").forEach(button => button.addEventListener("click", () => launchScenario(button.dataset.scenario)));
}

function openConcept() {
  els.conceptPanel.classList.add("is-open");
  els.conceptPanel.setAttribute("aria-hidden", "false");
  document.querySelector(".concept-trigger").setAttribute("aria-expanded", "true");
}
function closeConcept() {
  els.conceptPanel.classList.remove("is-open");
  els.conceptPanel.setAttribute("aria-hidden", "true");
  document.querySelector(".concept-trigger").setAttribute("aria-expanded", "false");
}

function openChat(focus = true) {
  document.body.classList.add("chat-open");
  els.shell.dataset.open = "true";
  els.shell.setAttribute("aria-hidden", "false");
  els.launcher.setAttribute("aria-expanded", "true");
  els.shell.classList.remove("is-entering");
  requestAnimationFrame(() => els.shell.classList.add("is-entering"));
  setTimeout(() => els.shell.classList.remove("is-entering"), 700);
  if (focus) setTimeout(() => els.input.focus(), 260);
}

function closeChat() {
  els.shell.classList.remove("is-entering");
  document.body.classList.remove("chat-open");
  els.shell.dataset.open = "false";
  els.shell.setAttribute("aria-hidden", "true");
  els.launcher.setAttribute("aria-expanded", "false");
  els.launcher.classList.remove("is-inviting");
  els.launcher.focus();
}

function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    els.voiceButton.addEventListener("click", () => assistantReply("Spracherkennung wird von diesem Browser nicht unterstützt. Sie können ohne Einschränkung weiterschreiben."));
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "de-DE";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.onstart = () => { els.voiceButton.classList.add("is-listening"); els.input.placeholder = "CAIDA hört zu …"; };
  recognition.onresult = event => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
    els.input.value = transcript;
    resizeInput();
    if (event.results[event.results.length - 1].isFinal) {
      els.voiceButton.classList.remove("is-listening");
      els.input.placeholder = "Suchen Sie schon ein Modell – oder darf ich mitdenken?";
    }
  };
  recognition.onerror = () => { els.voiceButton.classList.remove("is-listening"); els.input.placeholder = "Spracherkennung nicht verfügbar – bitte schreiben."; };
  recognition.onend = () => { els.voiceButton.classList.remove("is-listening"); };
  els.voiceButton.addEventListener("click", () => {
    if (els.voiceButton.classList.contains("is-listening")) return recognition.stop();
    if (!voiceConsent) return els.voiceDialog.showModal();
    startRecognition(voiceConsent);
  });
  els.voiceDialog.addEventListener("close", () => {
    const choice = els.voiceDialog.returnValue;
    if (choice === "cancel" || !choice) return;
    voiceConsent = choice;
    startRecognition(choice);
  });
}

async function startRecognition(mode) {
  try {
    if ("processLocally" in recognition) recognition.processLocally = mode === "local";
    else if (mode === "local") {
      await assistantReply("Dieser Browser unterstützt keine garantierte lokale Erkennung. Ich aktiviere ohne Ihre Zustimmung keinen externen Sprachdienst.");
      voiceConsent = null;
      return;
    }
    recognition.start();
  } catch {
    await assistantReply("Die Spracheingabe konnte nicht gestartet werden. Texteingabe bleibt vollständig verfügbar.");
  }
}

function resizeInput() {
  els.input.style.height = "auto";
  els.input.style.height = `${Math.min(els.input.scrollHeight, 120)}px`;
}

els.composer.addEventListener("submit", event => {
  event.preventDefault();
  const text = els.input.value;
  els.input.value = "";
  resizeInput();
  const sendButton = els.composer.querySelector(".send-button");
  sendButton.classList.remove("is-sending");
  requestAnimationFrame(() => sendButton.classList.add("is-sending"));
  setTimeout(() => sendButton.classList.remove("is-sending"), 460);
  handleUserText(text);
});
els.input.addEventListener("input", resizeInput);
els.input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); els.composer.requestSubmit(); }
});
document.querySelectorAll("[data-reset]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); resetConversation(); }));
document.querySelector(".concept-trigger").addEventListener("click", openConcept);
document.querySelectorAll("[data-open-concept]").forEach(button => button.addEventListener("click", openConcept));
document.querySelectorAll("[data-close-concept]").forEach(button => button.addEventListener("click", closeConcept));
document.querySelectorAll("[data-open-chat]").forEach(button => button.addEventListener("click", () => openChat()));
document.querySelectorAll("[data-chat-prompt]").forEach(button => button.addEventListener("click", async () => {
  openChat(false);
  resetConversation();
  await new Promise(resolve => setTimeout(resolve, 180));
  handleUserText(button.dataset.chatPrompt);
}));
document.querySelectorAll("[data-close-chat]").forEach(button => button.addEventListener("click", closeChat));
document.querySelectorAll("[data-focus-input]").forEach(button => button.addEventListener("click", () => openChat()));
els.aiStatus.addEventListener("click", showAISetup);
els.contextClear.addEventListener("click", () => {
  state.answers = {};
  state.recommended = null;
  state.alternative = null;
  updateContextStrip();
  assistantReply("Verstanden. Ich habe den gemerkten Beratungskontext gelöscht – wir können ohne Neustart frei weiterschreiben.", {}, 180);
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (els.conceptPanel.getAttribute("aria-hidden") === "false") closeConcept();
  else if (els.shell.dataset.open === "true") closeChat();
});

renderScenarios();
renderInbox();
setupVoice();
setupAIConfig();
loadAIStatus();
resetConversation();
setTimeout(() => els.shell.classList.remove("is-entering"), 700);
