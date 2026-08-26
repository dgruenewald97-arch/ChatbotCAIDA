"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { get, list } = require("@vercel/blob");

async function streamText(stream, maxBytes = 12_000) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) throw new Error("Ein Trainingsobjekt ist unerwartet groß.");
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN fehlt. Zuerst `npx vercel env pull .env.local --environment development` ausführen.");
  const records = [];
  let cursor;
  do {
    const page = await list({ prefix: "training/sessions/", cursor, limit: 1000 });
    for (let index = 0; index < page.blobs.length; index += 8) {
      const batch = page.blobs.slice(index, index + 8);
      const values = await Promise.all(batch.map(async blob => {
        const result = await get(blob.pathname, { access: "private", useCache: false });
        if (!result || result.statusCode !== 200 || !result.stream) return null;
        return JSON.parse(await streamText(result.stream));
      }));
      records.push(...values.filter(Boolean));
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  records.sort((a, b) => String(a.receivedAt).localeCompare(String(b.receivedAt)) || Number(a.sequence) - Number(b.sequence));
  const requested = process.argv[2];
  const output = path.resolve(requested || path.join("exports", `caida-training-${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`));
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, records.map(record => JSON.stringify(record)).join("\n") + (records.length ? "\n" : ""), "utf8");
  console.log(`Exportiert: ${records.length} Ereignisse -> ${output}`);
}

main().catch(error => {
  console.error(`Trainingsexport fehlgeschlagen: ${error.message}`);
  process.exitCode = 1;
});
