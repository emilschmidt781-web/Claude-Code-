# Website-Akquise-Agent

Findet Unternehmen in deiner Region, prüft deren Online-Auftritt auf Schwachstellen und erstellt mit Claude für jeden Lead:

- die **wichtigsten Schwachstellen**, übersetzt in Folgen für den Inhaber (verlorene Anrufe, Abmahnrisiko, schlechtes Image …)
- **Verkaufsargumente**
- einen **Gesprächseinstieg** für Telefon oder Besuch vor Ort
- **Einwände mit passenden Antworten** („Zu teuer“, „Hab doch Facebook“ …)
- eine **Paket-Empfehlung** und einen **E-Mail-Entwurf** zum Nachfassen

Ergebnis: eine nach Verkaufschance sortierte Liste als Markdown-Bericht, CSV (öffnet direkt in Excel) und JSON.

## So funktioniert es

1. **Suche:** Über OpenStreetMap (kostenlos, ohne Schlüssel) werden alle Betriebe der gewählten Branche im Umkreis gesucht, inkl. Adresse, Telefon und Website.
2. **Website-Check:** Die Startseite wird normal aufgerufen, wie im Browser, und geprüft auf:
   - keine Website / nur Facebook / nicht erreichbar
   - kein HTTPS, nicht mobilfähig, langsame Ladezeit
   - veraltet (altes Copyright-Jahr, Tabellen-Layout, Flash, altes WordPress/jQuery, Baukasten)
   - Rechtliches: fehlendes Impressum oder fehlender Datenschutz, extern geladene Google Fonts, Tracking ohne Cookie-Banner
   - SEO: Seitentitel, Meta-Beschreibung, H1, strukturierte Daten, Textmenge, Alt-Texte
   - Kontakt: antippbare Telefonnummer, Kontaktformular, Online-Buchung
3. **Bewertung:** Jeder Befund gibt Punkte → Score 0–100 → Chance *gering / mittel / hoch / sehr hoch*.
4. **Verkaufsargumente:** Claude erstellt für die besten Leads die Verkaufsunterlage. Es nutzt dafür nur die echten Befunde und erfindet nichts dazu.

## Einrichtung

Voraussetzung ist Node.js 18 oder neuer.

```bash
cd website-akquise-agent
```

```bash
npm install
```

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Den API-Schlüssel bekommst du unter https://console.anthropic.com. Ohne Schlüssel läuft das Tool mit `--no-ai` und liefert dann nur die technischen Befunde.

## Benutzung

```bash
node agent.mjs --region "Bamberg" --branche friseur
```

```bash
node agent.mjs --region "Nürnberg Gostenhof" --branche alle --radius 2 --limit 50 --absender "Max Muster, Muster Webdesign"
```

```bash
node agent.mjs --region "Erlangen" --tag craft=plumber --no-ai
```

| Option | Bedeutung | Standard |
|---|---|---|
| `--region` | Ort oder Stadtteil | Pflicht |
| `--branche` | z. B. `friseur`, `restaurant`, `handwerk`, `zahnarzt`, `alle` (Liste: `--help`) | `alle` |
| `--tag` | eigener OpenStreetMap-Filter, z. B. `shop=bakery` | – |
| `--radius` | Umkreis in km | `5` |
| `--limit` | max. geprüfte Betriebe (Betriebe ohne Website zuerst) | `30` |
| `--min-score` | nur Leads ab diesem Score | `15` |
| `--ai-top` | nur für die besten N Leads Texte erzeugen (spart Kosten) | `15` |
| `--model` | Claude-Modell | `claude-opus-5-5` |
| `--absender` | dein Name/Agentur für den E-Mail-Entwurf | – |
| `--out` | Ausgabeordner | `berichte` |

**Kosten:** Pro Lead fällt eine Claude-Anfrage an, grob 1–3 Cent. Mit `--ai-top` legst du fest, für wie viele Leads Texte erzeugt werden.

## Selbsttest

```bash
npm test
```

Der Test läuft komplett offline gegen einen simulierten Server.

## Wichtige rechtliche Hinweise (Deutschland)

- **Kalt-E-Mails an Firmen sind ohne vorherige Einwilligung unzulässig** (§ 7 Abs. 2 Nr. 2 UWG), auch im B2B-Bereich. Die E-Mail-Entwürfe sind deshalb zum **Nachfassen nach einem Gespräch** gedacht.
- **Anrufe bei Gewerbetreibenden** sind nur bei *mutmaßlicher Einwilligung* erlaubt, also wenn ein konkretes Interesse anzunehmen ist. Am sichersten sind persönliche Besuche, ein Brief oder ein Kontakt über eine Empfehlung.
- Der Website-Check ruft nur die öffentliche Startseite ab. Es ist **kein Sicherheits-Scan**, und es werden keine Lücken ausgenutzt.
- Die Hinweise zu Impressum, DSGVO und Google Fonts sind Hinweise auf mögliche Risiken, keine Rechtsberatung. Formuliere sie im Gespräch auch so.
- Daten aus OpenStreetMap stehen unter der ODbL-Lizenz (© OpenStreetMap-Mitwirkende). Die Daten sind nicht immer vollständig: Manche Betriebe haben eine Website, die dort nur nicht eingetragen ist. **Prüfe Leads ohne Website kurz per Google, bevor du Kontakt aufnimmst.**

## Aufbau

```
agent.mjs          Kommandozeile und Ablauf
lib/search.mjs     Firmensuche (Nominatim + Overpass / OpenStreetMap)
lib/analyze.mjs    Website-Check und Scoring
lib/ai.mjs         Verkaufsargumente mit Claude (strukturierte JSON-Ausgabe)
lib/report.mjs     Markdown-, CSV- und JSON-Bericht
test/selftest.mjs  Offline-Test
```
