"use strict";

const assert = require("node:assert/strict");

function responseMock() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name.toLowerCase()] = String(value); },
    end(value = "") { this.body = String(value); }
  };
}

function request(method, body = {}, headers = {}) {
  return {
    method,
    body,
    headers: { host: "caida.example", origin: "https://caida.example", ...headers },
    socket: { remoteAddress: "127.0.0.1" }
  };
}

async function run() {
  delete process.env.GEMINI_API_KEY;

  const statusHandler = require("../api/ai-status");
  const statusResponse = responseMock();
  await statusHandler(request("GET"), statusResponse);
  const status = JSON.parse(statusResponse.body);
  assert.equal(statusResponse.statusCode, 200);
  assert.equal(status.managed, true);
  assert.equal(status.enabled, false);

  const chatHandler = require("../api/ai-chat");
  const chatResponse = responseMock();
  await chatHandler(request("POST", { question: "Welches Modell passt?" }), chatResponse);
  assert.equal(chatResponse.statusCode, 503);

  const foreignResponse = responseMock();
  await chatHandler(request("POST", { question: "Test" }, { origin: "https://example.org" }), foreignResponse);
  assert.equal(foreignResponse.statusCode, 403);

  const leadHandler = require("../api/demo-lead");
  const leadResponse = responseMock();
  await leadHandler(request("POST", { model: "ASX", postcode: "61169", name: "Demo", contact: "demo@example.test" }), leadResponse);
  const lead = JSON.parse(leadResponse.body);
  assert.equal(leadResponse.statusCode, 201);
  assert.equal(lead.persisted, false);
  assert.match(lead.id, /^DEMO-/);

  console.log("CAIDA API smoke tests passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
