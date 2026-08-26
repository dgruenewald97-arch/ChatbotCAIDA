# Lernprotokoll und Trainingsdaten

Das Lernprotokoll erzeugt einen auswertbaren, pseudonymisierten Gesprächsdatensatz für Qualitätsprüfung, Prompt-Tests, Evaluationen und eine mögliche spätere Modellanpassung. Es trainiert Gemini nicht automatisch und verändert keine Modellgewichte im laufenden Chat.

## Einwilligung

- Standard ist **aus**. Vor der Zustimmung wird kein Gespräch gespeichert.
- Die Beratung und alle Widgets funktionieren auch nach „Ohne Speicherung“.
- Die Entscheidung liegt lokal im Browser unter `caida-training-consent-v1`.
- „Training: aktiv“ öffnet die Einstellung erneut. Beim Widerruf wird das Logging sofort beendet und die aktuelle Browsersitzung aus dem privaten Speicher gelöscht.
- Die Einwilligungsversion ist `training-v1`.

## Was gespeichert wird

Jede Nachricht ist ein eigenes privates JSON-Objekt mit:

- pseudonymisierter Sitzungskennung;
- Rolle `user` oder `assistant`;
- redigiertem Nachrichtentext;
- Quelle `user`, `local` oder `gemini` sowie optional dem Modellnamen;
- Dialogzustand, Fahrzeugtendenz und Widget-Typ;
- Reihenfolge und Zeitstempeln.

Die erste Zustimmung wird als separates Ereignis ohne Nachrichtentext protokolliert. IP-Adresse und User-Agent werden nicht in den Datensatz geschrieben.

## Was ausgeschlossen wird

Formularfelder für Name, E-Mail, Telefon oder Angebots-/Probefahrtkontakt werden niemals an `addMessage()` übergeben und deshalb nicht als Trainingsnachricht protokolliert. Im Chat erscheinen nur neutrale Hinweise wie „Kontaktdaten eingetragen“.

Als zweite Schutzschicht redigiert das Backend erkannte:

- E-Mail-Adressen;
- Telefonnummern;
- fünfstellige Postleitzahlen;
- Namensformulierungen wie „Ich heiße …“;
- typische Straßenadressen;
- Weblinks.

Automatische Redaktion ist eine Schutzschicht, keine Garantie für vollständige Anonymität. Vor echtem Kampagnenbetrieb sind Rechtsprüfung, Datenschutzerklärung, AV-Verträge, Zuständigkeiten und ein Lösch-/Auskunftsprozess erforderlich.

## Speicherung und Löschung

- privater Vercel Blob Store `caida-training`;
- Region `fra1` (Frankfurt);
- keine öffentliche Blob-URL;
- täglicher Vercel Cron unter `/api/training-retention`;
- Löschung aller Objekte, die älter als 30 Tage sind;
- Widerruf löscht die aktuelle Browsersitzung sofort, sofern der Speicher erreichbar ist.

## Geschützter Export

`GET /api/training-export` benötigt:

```http
Authorization: Bearer <CAIDA_TRAINING_ADMIN_TOKEN>
```

Parameter:

- `limit=1..500`, Standard `250`;
- `cursor=<cursor>` für die nächste Seite;
- `format=jsonl` für einen JSONL-Download.

Der Admin-Token liegt ausschließlich als sensibles Vercel-Environment-Secret vor. Er darf weder in Browsercode noch Repository oder Screenshots erscheinen.

Für die lokale Auswertung ohne Admin-Token kann ein angemeldeter Projektentwickler den verknüpften Blob-Token laden und einen JSONL-Export erzeugen:

```bash
npx vercel env pull .env.local --environment development
npm run training:export
```

Der Export landet unter `exports/` und ist durch `.gitignore` vom Repository ausgeschlossen.

## Gute Datensätze daraus machen

Der Roh-Export ist noch kein Fine-Tuning-Datensatz. Für jede Weiterentwicklung sollte man:

1. schlechte, falsche oder unklare Antworten markieren;
2. gewünschte Musterantworten redaktionell ergänzen;
3. Fakten gegen aktuelle offizielle Quellen prüfen;
4. Trainings- und Testfälle trennen, damit Evaluationen ehrlich bleiben;
5. zuerst Prompt und Routing verbessern; Fine-Tuning nur bei wiederkehrenden, messbaren Fehlerklassen einsetzen.
