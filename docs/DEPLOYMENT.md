# Deployment

## GitHub Pages

Der Workflow `.github/workflows/pages.yml` baut ein minimales `_site`-Verzeichnis aus:

- `index.html`;
- `styles.css`;
- `app.js`;
- `assets/`.

`server.js`, lokale Startdateien und Dokumentation werden nicht als Webanwendung ausgeliefert, bleiben aber im Repository verfügbar.

Die Pages-Version erkennt `*.github.io` und deaktiviert die API-Key-Konfiguration. So landet kein geheimer Schlüssel im Browserbundle.

## Lokal

```bash
npm start
```

Der Server bindet ausschließlich an `127.0.0.1:4177`. Optional können gesetzt werden:

```text
GEMINI_API_KEY
OPENAI_API_KEY
CAIDA_AI_MODEL
CAIDA_PORT
```

Keys aus der UI bleiben nur im Arbeitsspeicher und werden nie an den Browser zurückgegeben.

## Produktiver KI-Betrieb

Für eine öffentliche KI-Version ist ein separates Backend erforderlich. Mindestanforderungen:

- Secret Management statt Browser-Key;
- Authentifizierung oder Missbrauchsschutz;
- Rate Limits und Kostenlimits;
- serverseitige Faktenretrieval-Schicht;
- strukturierte Intent-Antwort für Widgets;
- Logging ohne unnötige personenbezogene Inhalte;
- Timeout- und Fallback-Strategie.

GitHub Pages kann weiterhin das Frontend hosten, wenn `/api/*` auf einen sicheren Dienst zeigt.

## Produktive Händlerübergabe

Die lokale Demo-Inbox ist kein CRM. Eine echte Übergabe benötigt Partner-ID, Consent, sichere Kontaktdatenübertragung, Fehlerstatus und eine bestätigte Rückmeldung. Erst dann darf der Chat „gesendet“ oder „gebucht“ anzeigen.

