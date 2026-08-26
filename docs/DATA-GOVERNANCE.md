# Daten und Faktenkontrolle

## Erlaubte Faktenquellen

Die aktuelle Basis ist in `QUELLEN.md` dokumentiert. Zahlen und Verfügbarkeitsangaben werden nicht aus allgemeinem Modellwissen ergänzt.

## Snapshot-Prinzip

`DATA_STAND` kennzeichnet den redaktionellen Stand. Vor einer Präsentation mit längerem Abstand sollten mindestens Preise, Modellstatus, Verbrauch, Reichweite und Händlerdaten erneut geprüft werden.

## Wettbewerber

Ohne mitgelieferte offizielle Wettbewerberdaten nennt CAIDA keinen Sieger und keine Details zu Garantie, Plattform, Werk, Infotainment oder Ausstattung. Die Mitsubishi-Seite darf dennoch mit ihren belegten Werten eingeordnet werden.

## Händler

Der Demo-Datensatz bestätigt nur Name, Entfernung und Typ des Partners zum genannten Stand. Er bestätigt nicht:

- Fahrzeugbestand;
- konkrete Ausstattung;
- Öffnungszeiten;
- freie Probefahrttermine;
- Lieferzeit.

Diese Daten benötigen im Produkt eine offizielle Händler- oder Bestands-API.

## Personenbezogene Daten

GitHub Pages hält Formularwerte nur im aktuellen DOM-/JavaScript-Zustand. Der lokale Node-Server speichert Demo-Anfragen nur im Arbeitsspeicher. Es gibt keine CRM-Übertragung.

Die Vercel-Demo bietet zusätzlich ein standardmäßig deaktiviertes Lernprotokoll. Erst nach separater Zustimmung werden freie Chatnachrichten und Antworten serverseitig redigiert und für höchstens 30 Tage in einem privaten Blob Store in Frankfurt abgelegt. Kontaktfelder aus Probefahrt und Angebot werden nicht protokolliert. Technische Details und Grenzen stehen in `TRAINING-DATA.md`.

Vor einem produktiven Kampagneneinsatz weiterhin erforderlich:

- Einwilligung und Datenschutzhinweise;
- Zweckbindung und Löschfristen;
- Transportverschlüsselung;
- Backendvalidierung und Rate Limits;
- Einbindung in die verbindliche Consent-/Datenschutzerklärung und belastbare Betroffenenprozesse;
- Rollen- und Berechtigungskonzept.
