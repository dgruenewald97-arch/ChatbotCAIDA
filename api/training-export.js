"use strict";

const { get, list } = require("@vercel/blob");
const { sendJson } = require("../lib/caida-http");
const { bearerToken, safeEqual } = require("../lib/caida-training");

async function streamText(stream, maxBytes = 12_000) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) throw new Error("blob too large");
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks).toString("utf8");
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET" });
  const secret = process.env.CAIDA_TRAINING_ADMIN_TOKEN;
  if (!secret || !safeEqual(bearerToken(req), secret)) return sendJson(res, 401, { error: "Unauthorized" }, { "WWW-Authenticate": "Bearer" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return sendJson(res, 503, { error: "Training storage unavailable" });

  try {
    const url = new URL(req.url, `https://${req.headers.host || "caida.invalid"}`);
    const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit")) || 250));
    const cursor = url.searchParams.get("cursor") || undefined;
    const page = await list({ prefix: "training/sessions/", cursor, limit });
    const records = [];
    for (let index = 0; index < page.blobs.length; index += 8) {
      const batch = page.blobs.slice(index, index + 8);
      const values = await Promise.all(batch.map(async blob => {
        const result = await get(blob.pathname, { access: "private", useCache: false });
        if (!result || result.statusCode !== 200 || !result.stream) return null;
        return JSON.parse(await streamText(result.stream));
      }));
      records.push(...values.filter(Boolean));
    }
    records.sort((a, b) => String(a.receivedAt).localeCompare(String(b.receivedAt)) || Number(a.sequence) - Number(b.sequence));
    if (url.searchParams.get("format") === "jsonl") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="caida-training-${new Date().toISOString().slice(0, 10)}.jsonl"`);
      res.setHeader("Cache-Control", "no-store");
      res.end(records.map(record => JSON.stringify(record)).join("\n") + (records.length ? "\n" : ""));
      return;
    }
    return sendJson(res, 200, { records, count: records.length, hasMore: page.hasMore, cursor: page.cursor || null });
  } catch (error) {
    console.error("training-export failed", error?.name || "Error");
    return sendJson(res, 503, { error: "Trainingsexport konnte nicht erstellt werden." });
  }
};
