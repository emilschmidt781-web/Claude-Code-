# ☎️ KI-Telefonassistent für Essensbestellungen

Ein KI-Assistent, der ans Telefon geht und Bestellungen aufnimmt, so wie
eine Mitarbeiterin im Restaurant:

1. Er begrüßt den Anrufer und nimmt die Gerichte auf (mit Sonderwünschen).
2. Er fragt, ob geliefert oder abgeholt wird.
3. Er fragt nach Name, Rückrufnummer und, bei Lieferung, nach der Adresse.
4. Er fasst die Bestellung mit Gesamtpreis zusammen und lässt sie bestätigen.
5. Er speichert sie in `bestellungen.json`, nennt die Bestellnummer und die Wartezeit und legt auf.

Das Gespräch führt **Claude** (Anthropic). **Twilio** stellt die Telefonnummer
und wandelt Sprache in Text und Text in Sprache um.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `config.js` | Restaurant, Speisekarte, Preise, Liefergebiet. **Hier anpassen.** |
| `assistant.js` | Gesprächslogik mit Claude, Preisprüfung, Speichern der Bestellung |
| `server.js` | Webserver für die Anrufe über Twilio |
| `simulator.js` | Test im Terminal, ohne Telefon |

## 1. Im Terminal testen (ohne Telefon)

```bash
npm install
```

```bash
cp .env.example .env   # dann ANTHROPIC_API_KEY eintragen
```

```bash
npm run chat
```

Danach tippst du, was ein Anrufer sagen würde, z. B. *„Ich hätte gern zwei Pizza
Salami und eine Cola zum Abholen.“*

## 2. Mit echter Telefonnummer (Twilio)

1. Konto bei [twilio.com](https://www.twilio.com) anlegen und eine Telefonnummer kaufen (deutsche Nummern brauchen einen Adressnachweis).
2. Server starten:
   ```bash
   npm start
   ```
3. Den Server öffentlich erreichbar machen, z. B. zum Testen mit ngrok:
   ```bash
   ngrok http 3000
   ```
4. In Twilio bei der Nummer unter **Voice Configuration → A call comes in** die Adresse
   `https://<deine-ngrok-adresse>/voice` (HTTP POST) eintragen.
   Optional kommt unter **Call status changes** noch `https://<…>/status` dazu.
5. Die Nummer anrufen und bestellen. 🍕

Willst du deine eigene Handynummer nutzen? Richte dort eine Rufumleitung auf die
Twilio-Nummer ein, z. B. „bei Nichtannahme“. Dann geht der Assistent nur ran,
wenn du selbst nicht abnimmst.

## Technische Hinweise

- Modell: `claude-opus-5-5` mit `effort: "low"`, damit am Telefon keine langen Pausen entstehen.
  Über `CLAUDE_MODEL` in `.env` lässt sich ein anderes Modell wählen.
- Ist der Server-Fallback eingeschaltet (`fallbacks: "default"`) und lehnt das Modell eine Anfrage ab,
  übernimmt automatisch ein anderes Modell.
- Der Server rechnet den Preis selbst nach und prüft den Mindestbestellwert, bevor er die Bestellung speichert.
- Laufende Gespräche liegen im Arbeitsspeicher. Für den Dauerbetrieb mit mehreren Servern
  sollten sie in eine Datenbank (z. B. Redis) wandern, ebenso `bestellungen.json`.
- Datenschutz: Anrufer sollten zu Beginn erfahren, dass sie mit einer KI sprechen und dass
  ihre Angaben gespeichert werden. Am besten ergänzt du das in `BEGRUESSUNG` in `assistant.js`.
