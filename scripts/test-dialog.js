"use strict";

const assert = require("node:assert/strict");
const { accessoryLabel, extractModelYear, hasAccessoryIntent, hasDealerIntent, hasNegatedTrialIntent } = require("../lib/caida-dialog");

assert.equal(hasAccessoryIntent("Ich suche nach einer Frontlippe für meinen Outlander"), true);
assert.equal(accessoryLabel("Ich suche nach einer Frontlippe"), "Frontlippe");
assert.equal(hasAccessoryIntent("Wo finde ich Ersatzteile?"), true);
assert.equal(hasAccessoryIntent("Ich brauche Teile"), true);
assert.equal(hasAccessoryIntent("Welche Vorteile hat der ASX?"), false);
assert.equal(hasDealerIntent("Bei welchem Händler finde ich das?"), true);
assert.equal(hasNegatedTrialIntent("Nein, keine Probefahrt"), true);
assert.equal(hasNegatedTrialIntent("Die Probefahrt bitte stoppen"), true);
assert.equal(hasNegatedTrialIntent("Ich möchte eine Probefahrt"), false);
assert.equal(extractModelYear("Erstzulassung 2024"), "2024");
assert.equal(extractModelYear("Modelljahr 2050"), "");

console.log("CAIDA dialog-routing tests passed.");
