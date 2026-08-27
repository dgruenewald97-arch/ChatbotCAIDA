# CAIDA – Datenbasis des Prototyps

Stand: 27.08.2026

CAIDA verwendet für Tatsachenbehauptungen ausschließlich belegte Angaben der deutschen Mitsubishi-Motors-Webseite. In der Vercel-Demo formuliert Gemini die freie Beratung, bleibt aber an denselben versionierten Fakten-Snapshot gebunden. Widgets, Formulare und Demo-Bestätigungen werden weiterhin deterministisch im Browser gesteuert.

## Offizielle Modellseiten

- Modellübersicht: https://www.mitsubishi-motors.de/modelle/
- ASX: https://www.mitsubishi-motors.de/asx/
- ASX Antriebe: https://www.mitsubishi-motors.de/asx/antriebe
- ASX Design: https://www.mitsubishi-motors.de/asx/design
- Grandis: https://www.mitsubishi-motors.de/grandis
- Eclipse Cross: https://www.mitsubishi-motors.de/eclipse-cross
- Eclipse Cross Technik: https://www.mitsubishi-motors.de/eclipse-cross/technik
- Outlander Plug-in Hybrid: https://www.mitsubishi-motors.de/outlander-plug-in-hybrid
- Outlander Technik: https://www.mitsubishi-motors.de/outlander-plug-in-hybrid/technik
- COLT: https://www.mitsubishi-motors.de/colt
- Händlersuche: https://www.mitsubishi-motors.de/haendlersuche

## Abgrenzung

- Preise, Verbrauchswerte und Verfügbarkeiten sind ein zeitgebundener Snapshot und müssen vor einem Produktiveinsatz automatisiert oder redaktionell aktualisiert werden.
- Der Aktionspreis-Snapshot umfasst ASX 22.390 €, GRANDIS 26.390 €, ECLIPSE CROSS 43.990 € und OUTLANDER 39.990 €. Es gelten die auf den Modellseiten genannten Bedingungen: ab Importlager, solange Vorrat, zuzüglich Überführung; Sonderlackierungen können Aufpreis kosten.
- Browser und Server beziehen Modellfakten gemeinsam aus `lib/caida-facts.js`. So können Widget und Gemini-Prompt nicht unbemerkt auseinanderlaufen.
- Der COLT wird ausdrücklich als Auslaufmodell behandelt und nicht wie ein regulär konfigurierbarer Neuwagen empfohlen.
- Der Händlerdatensatz für die Demo-PLZ 61169 wurde am genannten Stand über die offizielle Händlersuche geprüft. Für alle anderen Postleitzahlen leitet CAIDA zur offiziellen Suche weiter und erfindet keine Namen.
- Probefahrt- und Kontaktdaten werden im Node-Prototyp nur lokal im Arbeitsspeicher gehalten. In der GitHub-Pages-Demo bleiben sie ausschließlich im aktuellen Browserzustand. Es erfolgt keine Übertragung an Mitsubishi oder Händler.
- Die Händlerkarten bestätigen keinen Fahrzeugbestand und keine Terminverfügbarkeit. Beides müsste in einem Produkt über angebundene Partnersysteme geprüft werden.
