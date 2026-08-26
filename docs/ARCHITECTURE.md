# Architektur

## Ziel

CAIDA kombiniert natürliche Beratung mit deterministischen Transaktionswegen. Die freie KI darf Formulierungen verbessern, aber keine geschäftskritische Aktion besitzen.

## Laufzeitkomponenten

### `index.html`

Enthält Landingpage, Chat-Shell, Composer, interne Präsentationssteuerung und wiederverwendbare Nachrichtenvorlage. Alle Widgets werden im Chatverlauf erzeugt.

### `styles.css`

Mobile-First Styles für Landingpage, Chat, Karten, Formulare, Stepper und Motion. Ab `760px` erscheint der Chat als Desktop-Widget; darunter als vollflächiger Assistent. `prefers-reduced-motion` wird respektiert.

### `app.js`

Besitzt vier Verantwortungsbereiche:

1. verifizierte Modell- und Händlerdaten;
2. Gesprächszustand in `state`;
3. Intent-Routing in `handleUserText()`;
4. Rendering und Interaktion der Chat-Widgets.

Der Zustand trennt Beratung und Transaktion:

```js
state.answers       // Nutzung, Antrieb, Laden, Budget, Modellinteresse
state.aiMessages    // gekürzte Mehrturn-Historie für den lokalen KI-Gateway
state.transaction   // Modell, PLZ, Händler, Wunschzeit, Angebotsart, Kontakt
```

`state.transaction` bleibt beim Wechsel zwischen Händler, Probefahrt und Angebot erhalten. Dadurch fragt CAIDA bekannte Angaben nicht erneut ab.

### `server.js`

Der dependency-freie Node-Server:

- liefert statische Dateien aus;
- hält die lokale Demo-Inbox im Arbeitsspeicher;
- validiert einen optionalen Gemini- oder OpenAI-Key;
- sendet freie Fragen mit Systemanweisung und gekürztem Kontext an den Anbieter;
- gibt den API-Key niemals an den Browser zurück.

### `api/` und `lib/`

Die Vercel-Version läuft unter derselben Origin wie das Frontend:

- `api/ai-status.js` meldet ausschließlich Verbindungsstatus und Modellname;
- `api/ai-chat.js` validiert Origin, Payload und ein weiches IP-Rate-Limit;
- `api/demo-lead.js` bestätigt nur eine Demo-Referenz und persistiert keine Kontaktdaten;
- `api/training-event.js` speichert nach Einwilligung redigierte Nachrichten im privaten Blob Store;
- `api/training-export.js` stellt einen Bearer-geschützten JSON-/JSONL-Export bereit;
- `api/training-retention.js` löscht per täglichem Cron Daten nach 30 Tagen.
- `lib/caida-ai.js` besitzt den serverseitigen Prompt, die geprüfte Interactions-Modell-Allowlist und harte Kontext-/Antwortgrenzen;
- `GEMINI_API_KEY` wird ausschließlich aus Vercel Environment Variables gelesen.

Auf Vercel wird niemals ein API-Key-Formular angeboten. Das Frontend erkennt den Modus über `managed: true` aus `/api/ai-status`.

## Routing-Reihenfolge

Die Reihenfolge ist ein Sicherheitsvertrag:

1. Reset und aktive Flow-Zustände;
2. Wettbewerbervergleich mit Faktenbegrenzung;
3. Probefahrt, Angebot und Händler;
4. Service und lokale Mitsubishi-Vergleiche;
5. verifizierte Modellfragen;
6. freie KI-Frage, sofern lokal aktiviert;
7. lokale Beratungslogik als Fallback.

Transaktionale Absichten dürfen nie hinter dem KI-Aufruf stehen. Andernfalls könnte das Sprachmodell eine Buchung simulieren oder Händler erfinden.

## GitHub-Pages-Modus

`STATIC_HOSTED` wird auf `*.github.io` automatisch aktiv. Dann:

- werden keine `/api/*`-Routen aufgerufen;
- ist die KI-Konfiguration sichtbar als nicht verfügbar markiert;
- bleiben Formulardaten nur im aktuellen Browserzustand;
- erzeugt die Demo lokale Referenzen statt Servereinträge.

Mit `?static=1` kann dieser Modus lokal getestet werden.

## Vercel-Modus

Auf einer Vercel-Domain ist `STATIC_HOSTED` nicht aktiv. Freie Fragen gehen an den gleichnamigen Serverless-Endpunkt `/api/ai-chat`; Intent-Routing und alle transaktionalen Widgets bleiben weiterhin im Browser kontrolliert. Ein Ausfall oder Rate-Limit fällt auf die geprüfte lokale Antwortlogik zurück.

## Sicherheitsgrenzen

- Modellfakten stammen nur aus der dokumentierten Datenbasis.
- Wettbewerberwissen wird nicht aus Modellvorwissen ergänzt.
- Händlerkarten bestätigen weder Fahrzeugbestand noch Terminverfügbarkeit.
- Erst ein zukünftiges Backend dürfte Consent, CRM-Übergabe und Statusrückmeldung übernehmen.
- Das Vercel-Backend ist ein Demo-Gateway, keine CRM- oder Buchungsschnittstelle.
