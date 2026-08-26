"use strict";

const assert = require("node:assert/strict");
const { CONSENT_VERSION, normalizeTrainingEvent, redactText, storageSessionId } = require("../lib/caida-training");

const sessionId = "52fcac84-20f2-4ad2-978c-cbf8b4c3a992";
const deletionKey = "dcf06046-865d-4675-9676-113f9543af0c";
const session = storageSessionId(sessionId, deletionKey);

assert.match(session, /^[a-f0-9]{40}$/);
assert.equal(session, storageSessionId(sessionId, deletionKey));
assert.notEqual(session, storageSessionId(sessionId, "f37e0d1b-8a46-43ce-a396-2eb88fb97099"));

const redacted = redactText("Ich heiße Max Mustermann, Mail max@example.de, Telefon +49 171 1234567, Musterstraße 12, 61169.");
assert.doesNotMatch(redacted, /Max|Mustermann|max@example|1234567|Musterstraße|61169/);
assert.match(redacted, /\[NAME\]/);
assert.match(redacted, /\[EMAIL\]/);
assert.match(redacted, /\[TELEFON\]/);
assert.match(redacted, /\[ADRESSE\]/);
assert.match(redacted, /\[PLZ\]/);

const base = {
  consent: true,
  consentVersion: CONSENT_VERSION,
  sessionId,
  deletionKey,
  sequence: 4,
  type: "message",
  role: "user",
  text: "Meine Mail ist max@example.de",
  source: "user"
};
const record = normalizeTrainingEvent(base);
assert.equal(record.session, session);
assert.equal(record.text, "Meine Mail ist [EMAIL]");
assert.equal(record.role, "user");
assert.equal(normalizeTrainingEvent({ ...base, consent: false }), null);
assert.equal(normalizeTrainingEvent({ ...base, consentVersion: "old" }), null);
assert.equal(normalizeTrainingEvent({ ...base, sessionId: "guessable" }), null);

const consent = normalizeTrainingEvent({ ...base, type: "consent", text: "ignored" });
assert.equal(consent.type, "consent");
assert.equal("text" in consent, false);

console.log("CAIDA training-data tests passed.");
