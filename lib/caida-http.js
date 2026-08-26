"use strict";

const rateBuckets = new Map();

function sendJson(res, status, value, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [name, headerValue] of Object.entries(extraHeaders)) res.setHeader(name, headerValue);
  res.end(JSON.stringify(value));
}

async function readJson(req, maxBytes = 30_000) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body) > maxBytes) throw new Error("payload too large");
    return JSON.parse(req.body);
  }
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBytes) throw new Error("payload too large");
  }
  return JSON.parse(body || "{}");
}

function clientId(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function takeRateLimit(req, limit = 12, windowMs = 60_000) {
  const now = Date.now();
  const id = clientId(req);
  const current = rateBuckets.get(id);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(id, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: Math.ceil(windowMs / 1000) };
  }
  current.count += 1;
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  };
}

function hasAllowedOrigin(req) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return true;
  try {
    const requestOrigin = new URL(origin);
    const sameHost = requestOrigin.host === String(req.headers.host || "") && (requestOrigin.protocol === "https:" || requestOrigin.hostname === "localhost");
    const configured = String(process.env.CAIDA_ALLOWED_ORIGIN || "").split(",").map(value => value.trim()).filter(Boolean);
    return sameHost || configured.includes(requestOrigin.origin);
  } catch {
    return false;
  }
}

module.exports = { hasAllowedOrigin, readJson, sendJson, takeRateLimit };
