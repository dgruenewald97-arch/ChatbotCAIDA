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

## Vercel: öffentliche Gemini-Demo

Die Vercel-Version hostet Frontend und Functions unter derselben Domain. Benötigt werden:

```text
GEMINI_API_KEY       erforderlich, nur als Vercel-Secret
CAIDA_AI_MODEL       optional: exakter, für den Key verfügbarer Modellname
CAIDA_ALLOWED_ORIGIN optional: zusätzliche exakt erlaubte Origin
```

Erst verbinden und einmal deployen:

```bash
vercel login
vercel --prod
```

Secret setzen und danach neu deployen:

```bash
vercel env add GEMINI_API_KEY production
vercel --prod
```

Das Secret gehört weder in `.env`, GitHub noch in das Browserformular. Vercel-Environment-Änderungen gelten erst für neue Deployments.

### Demo-Kostenbremse

- automatische Auswahl des neuesten stabilen Flash-Lite-Modells oder ein explizit gepinntes, zuvor live verifiziertes Modell über `CAIDA_AI_MODEL`;
- höchstens sechs vorangehende Chatnachrichten, gekürzt auf je 700 Zeichen;
- Nutzerfrage höchstens 1.200 Zeichen;
- Antwort höchstens 260 Output-Tokens;
- zwölf KI-Anfragen pro Minute und IP je warmer Function-Instanz;
- 18 Sekunden Upstream-Timeout und lokaler Fakten-Fallback im Browser.

Der In-Memory-Rate-Limiter ist bewusst nur ein Schutz für die Chef-Demo. Vor öffentlicher Kampagnennutzung müssen ein zentraler Rate-Limiter, Bot-Schutz, Monitoring sowie Budgetalarme im Google-Projekt ergänzt werden.

### Keine echte Lead-Übermittlung

`/api/demo-lead` erzeugt lediglich eine nicht persistierte Demo-Referenz. Name und Kontakt werden weder an Mitsubishi noch an einen Händler weitergegeben und nicht serverseitig gespeichert.

## Produktiver KI-Betrieb jenseits der Demo

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
