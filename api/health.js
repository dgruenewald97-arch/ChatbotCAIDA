"use strict";

const { selectedGeminiModel } = require("../lib/caida-ai");
const { sendJson } = require("../lib/caida-http");

module.exports = function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET" });
  return sendJson(res, 200, {
    ok: true,
    mode: "vercel-demo",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: selectedGeminiModel()
  });
};
