# CAIDA feinschleifen

Dieser Leitfaden beschreibt den kürzesten sicheren Weg, CAIDA zu erweitern.

## 1. Einen neuen Intent ergänzen

1. Beispielsätze und realistische Tippfehler sammeln.
2. In `handleUserText()` den neuen Intent **vor** dem freien KI-Zweig platzieren, wenn er Händler, Lead, Preis, Termin, Service oder Datenschutz betrifft.
3. Bekannte Werte in `state.answers` oder `state.transaction` speichern.
4. Einen klaren Fallback formulieren, falls Daten oder Backend fehlen.
5. Mindestens einen positiven und einen negativen Testdialog prüfen.

Für zentrale einzelne Wörter kann `hasNearWord()` verwendet werden. Die erlaubte Edit-Distanz sollte normalerweise höchstens `1`, bei langen eindeutigen Wörtern höchstens `2` sein.

## 2. Modell- oder Händlerdaten aktualisieren

- Modelle: Objekt `MODELS` am Anfang von `app.js` und `<gepruefte-daten>` in `server.js` synchron ändern.
- Händlerdemo: `VERIFIED_DEALERS` in `app.js`.
- Datenstand: `DATA_STAND` und Dokumentation aktualisieren.
- Jede Zahl gegen die offizielle Quelle prüfen.

Nie stillschweigend neue Ausstattungs-, Garantie- oder Verfügbarkeitsangaben hinzufügen.

## 3. Die KI-Antworten verbessern

Die Systemanweisung liegt als `AI_INSTRUCTIONS` in `server.js`.

Änderungen sollten anhand eines kleinen festen Testsets bewertet werden:

- beste Modellwahl ohne Kontext;
- ASX versus Renault mit fehlenden Wettbewerberdaten;
- unbekanntes Ausstattungsdetail;
- Familienprofil GRANDIS versus OUTLANDER;
- Wunsch nach Händler oder Probefahrt.

Transaktionale Intents gehören nicht in den Prompt allein. Sie müssen zusätzlich deterministisch im Client geroutet werden.

## 4. Ein Widget erweitern

Widgets werden als HTML-Funktionen in `app.js` erzeugt. Interaktionen erhalten `data-action`; dynamische Formulare werden in `bindDynamicActions()` gebunden.

Bei jedem neuen Schritt:

- Fortschritt sichtbar halten;
- vorherige Karten sperren;
- bekannte Angaben übernehmen;
- keine feste Höhe für variable Texte verwenden;
- mindestens 44 × 44 CSS-Pixel für Ziele vorsehen;
- Abschluss vor dem lokalen Speichern zusammenfassen.

## 5. Gesprächstexte kürzen

Sicherheitshinweise einmal dort zeigen, wo sie eine Entscheidung beeinflussen. Nicht nach jedem Schritt wiederholen. Eine gute mobile Nachricht bleibt meistens unter etwa 90 Wörtern.

## 6. QA-Matrix

### Dialoge

- `hallo würde gerne einen asx probefharen`
- `finde ein autohaus in der nähe`
- Wechsel Händler → Angebot ohne erneute Modell-/PLZ-/Partnerfrage
- Wechsel Angebot → Probefahrt mit übernommenem Kontext
- unbekannte PLZ
- unbekannte Ausstattung
- Wettbewerbervergleich ohne Wettbewerberdaten

### Viewports

- 390 × 844;
- 360 × 740;
- 768 × 1024;
- 1280 × 720;
- 1440 × 900.

### Technische Checks

```bash
npm run check
```

Zusätzlich prüfen: Browserkonsole, horizontaler Overflow, Tastaturbedienung, wiederholte Klicks, Reset, reduzierte Bewegung und statischer Modus über `?static=1`.

## 7. Stop-Regeln

Nicht weiter mit Einzelpatches arbeiten, wenn:

- derselbe Intent zum zweiten Mal falsch geroutet wird;
- Modell-, PLZ- oder Händlerzustand an mehreren Stellen separat geschrieben wird;
- CSS und JavaScript dieselbe Animation besitzen;
- ein Widget drei unterschiedliche Responsive-Sonderregeln benötigt;
- produktive Daten ohne automatisierbare Quelle wachsen.

Dann zuerst Zustand, Komponenten- oder Datenarchitektur vereinheitlichen.

