"use strict";

const { del, list } = require("@vercel/blob");
const { sendJson } = require("../lib/caida-http");
const { RETENTION_DAYS, bearerToken, safeEqual } = require("../lib/caida-training");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET" });
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(bearerToken(req), secret)) return sendJson(res, 401, { error: "Unauthorized" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return sendJson(res, 503, { error: "Training storage unavailable" });

  try {
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let cursor;
    let checked = 0;
    let deleted = 0;
    do {
      const page = await list({ prefix: "training/sessions/", cursor, limit: 1000 });
      checked += page.blobs.length;
      const expired = page.blobs.filter(blob => new Date(blob.uploadedAt).getTime() < cutoff);
      for (let index = 0; index < expired.length; index += 100) {
        const batch = expired.slice(index, index + 100);
        await del(batch.map(blob => blob.url));
        deleted += batch.length;
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return sendJson(res, 200, { ok: true, checked, deleted, retentionDays: RETENTION_DAYS });
  } catch (error) {
    console.error("training-retention failed", error?.name || "Error");
    return sendJson(res, 503, { error: "Löschlauf fehlgeschlagen." });
  }
};
