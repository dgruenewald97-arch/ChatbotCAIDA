"use strict";

const assert = require("node:assert/strict");
const { COMMON_OFFER_TERMS, DATA_STAND, MODELS } = require("../lib/caida-facts");

assert.equal(DATA_STAND, "27.08.2026");
assert.match(COMMON_OFFER_TERMS, /zuzüglich Überführungskosten/i);

for (const id of ["asx", "grandis", "eclipse", "outlander"]) {
  const model = MODELS[id];
  assert.ok(model, `${id} fehlt`);
  assert.match(model.source, /^https:\/\/www\.mitsubishi-motors\.de\//);
  assert.ok(model.verifiedFacts.length >= 2, `${id} braucht verifizierte Fakten`);
  assert.ok(model.promotion?.listPrice, `${id} braucht den Aktions-Snapshot`);
  assert.ok(model.promotion?.discount, `${id} braucht den Aktionsrabatt`);
}

assert.match(MODELS.eclipse.verifiedFacts.join(" "), /627 km/);
assert.match(MODELS.outlander.verifiedFacts.join(" "), /85 km/);

console.log("CAIDA verified-facts tests passed.");
