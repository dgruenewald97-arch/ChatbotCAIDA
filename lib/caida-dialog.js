(function exposeCaidaDialog(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CAIDA_DIALOG = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCaidaDialog() {
  "use strict";

  function hasAccessoryIntent(value) {
    return /\b(frontlippe|frontspoiler|heckspoiler|seitenschweller|ersatzteile?|teile|zubehör(?:teil)?|anbauteile?|nachrüst(?:en|ung|teil)?|felgen?|dachträger|fußmatten?)\b/i.test(String(value || ""));
  }

  function accessoryLabel(value) {
    const text = String(value || "").toLowerCase();
    const labels = [
      ["frontlippe", "Frontlippe"], ["frontspoiler", "Frontspoiler"], ["heckspoiler", "Heckspoiler"],
      ["seitenschweller", "Seitenschweller"], ["dachträger", "Dachträger"], ["fußmatte", "Fußmatten"],
      ["felge", "Felgen"], ["ersatzteil", "Ersatzteil"], ["zubehör", "Zubehör"], ["teil", "Teil"]
    ];
    return labels.find(([needle]) => text.includes(needle))?.[1] || "Zubehör / Teil";
  }

  function hasDealerIntent(value) {
    return /\b(händler|autohaus|mitsubishi[- ]?partner|partner)\b/i.test(String(value || ""));
  }

  function hasNegatedTrialIntent(value) {
    const text = String(value || "").toLowerCase();
    return /\b(?:nein|keine?|nicht|doch\s+nicht|abbrechen|stoppen)\b.{0,32}\b(?:probefahrt|probe\s*fahren|testfahrt)\b/.test(text)
      || /\b(?:probefahrt|probe\s*fahren|testfahrt)\b.{0,32}\b(?:nicht|abbrechen|stoppen)\b/.test(text);
  }

  function extractModelYear(value) {
    const match = String(value || "").match(/\b((?:19|20)\d{2})\b/);
    if (!match) return "";
    const year = Number(match[1]);
    const currentYear = new Date().getFullYear() + 1;
    return year >= 1980 && year <= currentYear ? match[1] : "";
  }

  return { accessoryLabel, extractModelYear, hasAccessoryIntent, hasDealerIntent, hasNegatedTrialIntent };
});
