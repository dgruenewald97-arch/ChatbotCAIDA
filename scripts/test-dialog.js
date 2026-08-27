"use strict";

const assert = require("node:assert/strict");
const {
  accessoryLabel,
  extractModelYear,
  hasAdvisoryIntent,
  hasAmbiguousAsxAlias,
  hasAccessoryIntent,
  hasDealerIntent,
  hasModelLocationIntent,
  hasNegatedTrialIntent,
  hasOfferLeadIntent,
  hasPromotionIntent,
  isBareCancellation,
  normalizeAdvisoryQuestion
} = require("../lib/caida-dialog");

assert.equal(hasAccessoryIntent("Ich suche nach einer Frontlippe für meinen Outlander"), true);
assert.equal(accessoryLabel("Ich suche nach einer Frontlippe"), "Frontlippe");
assert.equal(hasAccessoryIntent("Wo finde ich Ersatzteile?"), true);
assert.equal(hasAccessoryIntent("Wo finde ich Zubehöre für den Outlander, mein Heckflügel ist kaputt gegangen"), true);
assert.equal(accessoryLabel("Mein Heckflügel ist kaputt gegangen"), "Heckflügel");
assert.equal(hasAccessoryIntent("Ich brauche Teile"), true);
assert.equal(hasAccessoryIntent("Welche Vorteile hat der ASX?"), false);
assert.equal(hasDealerIntent("Bei welchem Händler finde ich das?"), true);
assert.equal(hasNegatedTrialIntent("Nein, keine Probefahrt"), true);
assert.equal(hasNegatedTrialIntent("Die Probefahrt bitte stoppen"), true);
assert.equal(hasNegatedTrialIntent("Ich möchte eine Probefahrt"), false);
assert.equal(extractModelYear("Erstzulassung 2024"), "2024");
assert.equal(extractModelYear("Modelljahr 2050"), "");
assert.equal(hasPromotionIntent("Gibt es eigentlich ein neues Outlander Angebot?"), true);
assert.equal(hasPromotionIntent("Ich meine Sonderaktionen oder so"), true);
assert.equal(hasPromotionIntent("Ich möchte ein persönliches Angebot anfordern"), false);
assert.equal(hasOfferLeadIntent("Ich möchte ein persönliches Angebot anfordern"), true);
assert.equal(hasOfferLeadIntent("Gibt es gerade Angebote?"), false);
assert.equal(hasOfferLeadIntent("Kann ich den Outlander leasen?"), false);
assert.equal(hasOfferLeadIntent("Ich möchte ein Leasingangebot vorbereiten"), true);
assert.equal(hasOfferLeadIntent("Warum sollte ich den Eclipse Cross kaufen?"), false);
assert.equal(hasAdvisoryIntent("Warum sollte ich den Eclipse Cross kaufen?"), true);
assert.equal(hasAdvisoryIntent("Nein, warum sollte ich ihn kaufen?"), true);
assert.equal(isBareCancellation("Nein"), true);
assert.equal(isBareCancellation("Nein, warum sollte ich ihn kaufen?"), false);
assert.equal(normalizeAdvisoryQuestion("Nein, warum sollte ich ihn kaufen?"), "warum sollte ich ihn kaufen?");
assert.equal(normalizeAdvisoryQuestion("Nein, ich kann nicht laden."), "Nein, ich kann nicht laden.");
assert.equal(hasAmbiguousAsxAlias("Warum sollte ich einen Sex kaufen?"), true);
assert.equal(hasModelLocationIntent("Wo finde ich denn den Outlander?"), true);
assert.equal(hasModelLocationIntent("Passt der Outlander zu mir?"), false);

console.log("CAIDA dialog-routing tests passed.");
