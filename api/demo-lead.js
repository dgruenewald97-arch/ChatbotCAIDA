"use strict";

const { hasAllowedOrigin, readJson, sendJson, takeRateLimit } = require("../lib/caida-http");

function clean(value, name, limit) {
  return String(value?.[name] || "").trim().slice(0, limit);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
  if (!hasAllowedOrigin(req)) return sendJson(res, 403, { error: "Origin not allowed" });
  const rate = takeRateLimit(req, 8, 60_000);
  if (!rate.allowed) return sendJson(res, 429, { error: "Zu viele Demo-Anfragen." }, { "Retry-After": String(rate.retryAfter) });

  try {
    const payload = await readJson(req, 12_000);
    const model = clean(payload, "model", 50);
    const postcode = clean(payload, "postcode", 5).replace(/\D/g, "");
    const name = clean(payload, "name", 120);
    const contact = clean(payload, "contact", 160);
    if (!model || !/^\d{5}$/.test(postcode) || !name || !contact) return sendJson(res, 400, { error: "Bitte alle Felder ausfüllen." });
    return sendJson(res, 201, {
      id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      receivedAt: new Date().toISOString(),
      localOnly: true,
      persisted: false
    });
  } catch {
    return sendJson(res, 400, { error: "Ungültige Demo-Anfrage." });
  }
};
