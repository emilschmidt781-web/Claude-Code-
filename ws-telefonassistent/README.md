# ☎️ KI-Telefonassistent für W&S Karrierepartner

Der Assistent geht ans Telefon, wenn Ricky Wagner nicht abnehmen kann:

1. Er begrüßt den Anrufer und sagt, dass er eine KI ist.
2. Er findet heraus, ob ein **Unternehmen** Personal sucht, ein **Bewerber** einen Job sucht oder es um **etwas anderes** geht.
3. Er beantwortet einfache Fragen: Kosten, Ablauf, Diskretion, Personalvermittlung oder Zeitarbeit, offene Stellen aus der Google-Tabelle.
4. Er nimmt eine vollständige **Rückrufnotiz** auf und lässt sie bestätigen.
5. Ricky bekommt die Notiz sofort **per SMS aufs Handy**. Zusätzlich wird sie in `rueckrufe.json` gespeichert.

Beispiel für eine SMS an Ricky:

```
👤 Bewerber: Max Muster
Tel: 0151 1234567 – am besten nach 17 Uhr
Beruf/Position: Elektroniker
Region: Würzburg
Ab: 1. Februar
Anliegen: Sucht Stelle als Elektroniker, Lebenslauf kommt per WhatsApp.
```

## Was der Assistent bewusst nicht tut

- Er **bewertet keine Bewerber** und sagt nie, ob jemand passt. Das entscheidet Ricky.
  Das ist auch wegen der EU-KI-Verordnung wichtig: KI, die Bewerber auswählt, gilt als Hochrisiko-System.
- Er verspricht keine Stellen, Gehälter oder Honorare.
- Er nennt keine Namen von Kundenfirmen oder Kandidaten.
- Er fragt nicht nach sensiblen Daten wie Gesundheit, Religion oder Familienplanung.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `config.js` | Firmendaten, häufige Fragen, Link zur Google-Tabelle. **Hier anpassen.** |
| `assistant.js` | Gesprächsführung mit Claude und Speichern der Notiz |
| `stellen.js` | Liest die offenen Stellen aus der Google-Tabelle (Reiter „Stellen“), dieselbe wie auf der Website |
| `benachrichtigung.js` | SMS an Ricky über Twilio |
| `server.js` | Webserver für die Anrufe über Twilio |
| `simulator.js` | Test im Terminal, ohne Telefon |

## 1. Im Terminal testen

```bash
npm install
```

```bash
cp .env.example .env   # ANTHROPIC_API_KEY eintragen
```

```bash
npm run chat
```

Danach spielst du einen Anrufer, z. B. *„Hallo, wir suchen zwei Elektroniker für unseren Betrieb in Kitzingen.“*

## 2. Echte Telefonnummer einrichten

1. **Twilio-Konto** anlegen (am besten auf W&S Karrierepartner) und eine deutsche Nummer kaufen.
   Dafür braucht Twilio einen Adress- bzw. Gewerbenachweis.
2. In `.env` die Twilio-Zugangsdaten, die Twilio-Nummer und Rickys Handynummer (`RICKY_HANDY`) eintragen.
3. Server starten (`npm start`) und öffentlich erreichbar machen. Zum Testen geht `ngrok http 3000`,
   dauerhaft z. B. ein kleiner Server für etwa 5 € im Monat.
4. In Twilio bei der Nummer unter **A call comes in** die Adresse `https://<server>/voice` (HTTP POST) eintragen.
   Unter **Call status changes** optional `https://<server>/status`.
5. **Rufumleitung auf Rickys Handy** einrichten, und zwar „bei Nichtannahme“ und „bei besetzt“ auf die Twilio-Nummer.
   Bei den meisten Anbietern geht das mit `**61*<Twilio-Nummer>#` (bei Nichtannahme) und
   `**67*<Twilio-Nummer>#` (bei besetzt) und anschließend der Anruftaste.
   Ricky behält seine bekannte Nummer, und die KI geht nur ran, wenn er selbst nicht abnimmt.

## Kosten (grob)

- **Claude:** etwa 10–20 Cent pro Anruf mit Opus 5.5, mit Haiku 5.5 unter 1 Cent (`CLAUDE_MODEL=claude-haiku-5-5` in `.env`).
- **Twilio:** Nummer etwa 1–15 € im Monat, dazu wenige Cent pro Anruf und pro SMS.
- **Server:** etwa 5 € im Monat.

## Vor dem Livegang

- In der Datenschutzerklärung ergänzen, dass Anrufe von einem KI-Assistenten angenommen werden
  und welche Daten gespeichert werden. Anthropic und Twilio sind dabei als Dienstleister zu nennen.
- `rueckrufe.json` enthält personenbezogene Daten. Nur auf dem Server lassen und regelmäßig löschen.
  Diese Daten gehören **nicht** in die öffentliche Google-Tabelle.
