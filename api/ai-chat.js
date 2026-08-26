"use strict";

const { generateGeminiAnswer } = require("../lib/caida-ai");
const { hasAllowedOrigin, readJson, sendJson, takeRateLimit } = require("../lib/caida-http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
  if (!hasAllowedOrigin(req)) return sendJson(res, 403, { error: "Origin not allowed" });

  const rate = takeRateLimit(req, 12, 60_000);
  res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
  if (!rate.allowed) return sendJson(res, 429, { error: "Zu viele Anfragen. Bitte kurz warten." }, { "Retry-After": String(rate.retryAfter) });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return sendJson(res, 503, { error: "Gemini ist für diese Demo noch nicht konfiguriert.", enabled: false });

  try {
    const payload = await readJson(req);
    const question = String(payload?.question || "").trim().slice(0, 1200);
    if (!question) return sendJson(res, 400, { error: "Frage fehlt." });
    const context = { modelId: payload?.modelId || null, profile: payload?.context || {} };
    const messages = Array.isArray(payload?.messages) ? payload.messages.slice(-6) : [];
    const { response, result, answer, model } = await generateGeminiAnswer({ key, question, messages, context });
    if (!response.ok) {
      const code = String(result?.error?.status || "UPSTREAM_ERROR");
      return sendJson(res, 502, { error: "Gemini konnte gerade nicht antworten.", code });
    }
    if (!answer) return sendJson(res, 502, { error: "Gemini hat keine Antwort geliefert." });
    return sendJson(res, 200, { answer, provider: "gemini", model });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return sendJson(res, timedOut ? 504 : 400, { error: timedOut ? "Gemini braucht gerade zu lange." : "Die Anfrage konnte nicht verarbeitet werden." });
  }
};
