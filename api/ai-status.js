"use strict";

const { selectedGeminiModel } = require("../lib/caida-ai");
const { sendJson } = require("../lib/caida-http");

module.exports = function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET" });
  const enabled = Boolean(process.env.GEMINI_API_KEY);
  return sendJson(res, 200, {
    enabled,
    managed: true,
    provider: enabled ? "gemini" : "none",
    model: enabled ? selectedGeminiModel() : null,
    lastError: null
  });
};
