"use strict";

const crypto = require("node:crypto");
const { del, list, put } = require("@vercel/blob");
const { hasAllowedOrigin, readJson, sendJson, takeRateLimit } = require("../lib/caida-http");
const { CONSENT_VERSION, normalizeTrainingEvent, storageSessionId } = require("../lib/caida-training");

async function deleteSession(payload) {
  if (payload?.consentVersion !== CONSENT_VERSION) return null;
  const session = storageSessionId(payload.sessionId, payload.deletionKey);
  if (!session) return null;
  let cursor;
  let deleted = 0;
  do {
    const page = await list({ prefix: `training/sessions/${session}/`, cursor, limit: 100 });
    if (page.blobs.length) {
      await del(page.blobs.map(blob => blob.url));
      deleted += page.blobs.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return { session, deleted };
}

module.exports = async function handler(req, res) {
  if (!["POST", "DELETE"].includes(req.method)) return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "POST, DELETE" });
  if (!hasAllowedOrigin(req)) return sendJson(res, 403, { error: "Origin not allowed" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return sendJson(res, 503, { error: "Training storage unavailable" });
  const rate = takeRateLimit(req, req.method === "DELETE" ? 8 : 80, 60_000);
  if (!rate.allowed) return sendJson(res, 429, { error: "Zu viele Anfragen." }, { "Retry-After": String(rate.retryAfter) });

  try {
    const payload = await readJson(req, 12_000);
    if (req.method === "DELETE") {
      const result = await deleteSession(payload);
      if (!result) return sendJson(res, 400, { error: "Ungültige Sitzung." });
      return sendJson(res, 200, { deleted: true, records: result.deleted });
    }

    const record = normalizeTrainingEvent(payload);
    if (!record) return sendJson(res, 400, { error: "Ungültiges oder nicht eingewilligtes Trainingsereignis." });
    const id = crypto.randomUUID();
    record.id = id;
    const timestamp = Date.now();
    await put(`training/sessions/${record.session}/${String(record.sequence).padStart(7, "0")}-${timestamp}-${id}.json`, JSON.stringify(record), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json"
    });
    return sendJson(res, 202, { stored: true, id });
  } catch (error) {
    console.error("training-event failed", error?.name || "Error");
    return sendJson(res, 503, { error: "Trainingsereignis konnte nicht gespeichert werden." });
  }
};
