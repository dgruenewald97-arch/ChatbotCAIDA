CAIDA – MITSUBISHI CONCEPT PROTOTYPE
Stand: 25.08.2026

START
1. START-CAIDA.bat doppelklicken.
2. Der Browser öffnet http://127.0.0.1:4177
3. Das schwarze Fenster während der Präsentation geöffnet lassen.

PRÄSENTATION
- CAIDA startet bewusst zugeklappt als gebrandeter Launcher unten rechts.
- Auf Desktop öffnet sich ein kompaktes Chatfenster über der Mitsubishi-Seite;
  mobil wird CAIDA nach dem Öffnen vollflächig.
- Das bereitgestellte Bot-Motiv ist das einheitliche CAIDA-Gesicht in Launcher,
  Kopfzeile und Nachrichten.
- Im Chat frei schreiben oder einen der drei kleinen Gesprächsimpulse verwenden.
- Die Themenwelt, Modellberatung, Vergleiche, Händler- und Probefahrtvorbereitung
  bleiben vollständig im Chat. Es gibt keinen sichtbaren Umfrage-Parcours.
- Probefahrt und Angebotsprofil sind echte Chat-Widget-Flows mit Fortschritt,
  verifizierter Partnerwahl, Prüfansicht und klarer lokaler Demo-Bestätigung.
- CAIDA behauptet nie, ein Termin sei verfügbar oder eine Anfrage sei an Mitsubishi
  beziehungsweise einen Händler übermittelt worden.
- Relevanter Beratungskontext wird als kleine, löschbare Leiste im Chat angezeigt.
- Concept-Menü: oben rechts über das Menü-Symbol.
- Empfohlener Demo-Weg: Familienberatung.
- Lokale Probefahrt-Anfragen erscheinen im Concept-Menü unter „Demo-Inbox“.

DATENSCHUTZ
- Der Prototyp sendet keine Kontakt- oder Gesprächsdaten an Mitsubishi.
- Demo-Anfragen liegen nur im Arbeitsspeicher des lokalen Servers.
- Nach Beenden des Servers sind sie gelöscht.
- Erst wenn Gemini verbunden ist, werden freie Chatfragen samt sichtbarem
  Beratungskontext an Gemini übertragen. Der Chat zeigt diesen Zustand dauerhaft an.
- Spracherkennung wird nur nach aktiver Auswahl gestartet. Lokale Erkennung wird bevorzugt.

DATENBASIS
- Offizielle deutsche Mitsubishi-Webseiten und vorhandene offizielle Kampagnenassets.
- Preise, Verbrauch und Verfügbarkeit: Stand 25.08.2026.
- Preis- und Ausstattungsänderungen vorbehalten; Überführungskosten sind nicht enthalten.

TECHNIK
- Funktionaler lokaler Beratungsprototyp mit freier Texteingabe und regelbasierter,
  nachvollziehbarer Empfehlungslogik.
- Echter KI-Gateway ist eingebaut. Ohne API-Key arbeitet CAIDA transparent mit der
  lokalen Demo-Logik. Preis-, Antriebs-, Reichweiten-, Modell- und Vergleichsfragen
  werden aus der geprüften Datenbasis beantwortet; unbekannte Details werden klar
  als nicht verifiziert markiert statt erfunden.
- Motion-System: Liquid-Glass-Tiefe, federndes Öffnen, gestaffelte Nachrichten,
  sichtbares Denken, Kartenaufbau, Voice-Feedback und ruhiger Launcher-Impuls.
  Die Systemoption „Bewegung reduzieren“ wird vollständig respektiert.
- Gemini direkt im Chat verbinden: in der CAIDA-Kopfzeile auf
  „Demo-Modus · KI verbinden“ klicken und den Gemini API-Key einfügen.
- CAIDA prüft den Key sichtbar und wählt automatisch ein kompatibles
  Gemini-Flash-Lite-Modell. Ein API-Fehler wird direkt im Formular angezeigt.
- Neue Google Authorization Keys mit `AQ…` sowie ältere `AIza…`-Keys werden
  akzeptiert; die Gültigkeit entscheidet ausschließlich die Gemini API.
- Alternativ kann die interne Präsentationssteuerung weiterhin Gemini oder OpenAI
  konfigurieren.
  Der Schlüssel bleibt nur im Arbeitsspeicher des lokalen Servers, wird nicht in
  Dateien gespeichert und ist nach Server-Neustart gelöscht.
- Standard ist Gemini 3.5 Flash-Lite. Die Gesprächshistorie wird als echter
  mehrteiliger Gemini-Dialog gesendet, nicht als einzelne isolierte Frage.
- Die Gemini-Beraterrolle antwortet direkt, gibt eine begründete Tendenz, nennt
  einen fairen Haken und stellt höchstens eine entscheidende Rückfrage.
- Händler-, Probefahrt- und Angebotsabsichten werden vor Gemini erkannt und in
  kontrollierte Widgets geleitet. Wettbewerberdaten werden nur verglichen, wenn
  sie im Gespräch als geprüfte Daten vorliegen.
- Alternativ vor dem Start GEMINI_API_KEY
  oder OPENAI_API_KEY und optional CAIDA_AI_MODEL als Umgebungsvariablen setzen.
- Keine Installation und keine npm-Pakete erforderlich. Node.js genügt.
