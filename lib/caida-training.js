"use strict";

const crypto = require("node:crypto");

const CONSENT_VERSION = "training-v1";
const RETENTION_DAYS = 30;
const SESSION_ID_PATTERN = /^[a-f0-9-]{20,80}$/i;
const DELETION_KEY_PATTERN = /^[a-f0-9-]{20,80}$/i;

function cleanString(value, limit = 2000) {
  return String(value ?? "").trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").slice(0, limit);
}

function redactText(value) {
  let text = cleanString(value);
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL]");
  text = text.replace(/https?:\/\/\S+/gi, "[LINK]");
  text = text.replace(/\b(?:ich hei(?:ß|ss)e|mein name ist)\s+[\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*){0,2}/giu, match => `${match.replace(/\s+[\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*){0,2}$/u, "")} [NAME]`);
  text = text.replace(/\b[\p{L}.'’-]+(?:straße|strasse|str\.|weg|allee|platz)\s+\d+[a-z]?\b/giu, "[ADRESSE]");
  text = text.replace(/(?<!\w)(?:\+?\d[\d\s()\/-]{5,}\d)(?!\w)/g, match => {
    const digits = match.replace(/\D/g, "");
    return digits.length >= 7 ? "[TELEFON]" : match;
  });
  text = text.replace(/\b\d{5}\b/g, "[PLZ]");
  return text;
}

function storageSessionId(sessionId, deletionKey) {
  if (!SESSION_ID_PATTERN.test(String(sessionId || "")) || !DELETION_KEY_PATTERN.test(String(deletionKey || ""))) return null;
  return crypto.createHash("sha256").update(`${sessionId}:${deletionKey}`).digest("hex").slice(0, 40);
}

function normalizeTrainingEvent(payload) {
  if (payload?.consent !== true || payload?.consentVersion !== CONSENT_VERSION) return null;
  const session = storageSessionId(payload.sessionId, payload.deletionKey);
  if (!session) return null;
  const type = payload.type === "consent" ? "consent" : "message";
  const sequence = Number(payload.sequence);
  if (!Number.isSafeInteger(sequence) || sequence < 0 || sequence > 1_000_000) return null;

  const record = {
    schemaVersion: 1,
    consentVersion: CONSENT_VERSION,
    type,
    session,
    sequence,
    receivedAt: new Date().toISOString(),
    clientTimestamp: cleanString(payload.clientTimestamp, 40),
    pageVersion: cleanString(payload.pageVersion, 80)
  };

  if (type === "consent") return record;
  const role = payload.role === "assistant" ? "assistant" : payload.role === "user" ? "user" : null;
  const text = redactText(payload.text);
  if (!role || !text) return null;
  record.role = role;
  record.text = text;
  record.source = ["user", "local", "gemini"].includes(payload.source) ? payload.source : role === "user" ? "user" : "local";
  record.model = cleanString(payload.model, 100);
  record.flow = cleanString(payload.flow, 60);
  record.vehicle = cleanString(payload.vehicle, 40);
  record.widget = cleanString(payload.widget, 60);
  return record;
}

function safeEqual(actual, expected) {
  const left = Buffer.from(String(actual || ""));
  const right = Buffer.from(String(expected || ""));
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right);
}

function bearerToken(req) {
  const match = String(req.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

module.exports = {
  CONSENT_VERSION,
  RETENTION_DAYS,
  bearerToken,
  normalizeTrainingEvent,
  redactText,
  safeEqual,
  storageSessionId
};
