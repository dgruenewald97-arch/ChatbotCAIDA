"use strict";

const { sendJson } = require("../lib/caida-http");
const { CONSENT_VERSION, RETENTION_DAYS } = require("../lib/caida-training");

module.exports = function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET" });
  return sendJson(res, 200, {
    available: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    consentVersion: CONSENT_VERSION,
    retentionDays: RETENTION_DAYS,
    defaultEnabled: false
  });
};
