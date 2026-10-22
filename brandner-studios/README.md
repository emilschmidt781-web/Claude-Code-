# Edgar Brandner – Webdesign (Website)

Neuauflage der Website von brandnerstudios.de: gleiche Inhalte, neues Design.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

```bash
cd brandner-studios
python3 -m http.server 8000   # http://localhost:8000
```

## Aufbau (auf Anfragen ausgelegt)

1. **Hero** mit klarer Botschaft, zwei Knöpfen und Vertrauenszeile (kostenloses Kennenlernen, ein Ansprechpartner, regional)
2. **Leistungen**
3. **Beispiele**: fünf Design-Konzepte als anklickbare Online-Demos (siehe unten)
4. **Angebot**: Firmenwebsite, Landingpage, Ausbesserung (Klick wählt die Anfrage im Formular vor)
5. **Was du bekommst**: sechs Vorteile
6. Würzburg-Skyline, **Ablauf**, **Über mich**
7. **FAQ** mit sieben Fragen (auch als FAQ-Daten für Google eingebunden)
8. **Kontakt** mit Feld für die aktuelle Website, damit du vor dem Gespräch schon reinschauen kannst
9. **Footer** mit Abschluss-Aufruf, Seitenlinks und Kontakt
10. **Handy**: feste Leiste unten mit Anrufen, WhatsApp und Anfragen

## Logo

Ein „B“ aus dunklem Balken und zwei Bögen im Verlauf Pink–Lavendel–Blau, dazu ein
Lime-Punkt. Schriftzug BRANDNER (Inter Display Black, als Vektorpfade) mit STUDIOS und Verlaufslinie.

| Datei | Wofür |
| --- | --- |
| `img/logo.svg` | Standard auf hellem Grund |
| `img/logo-dunkel.svg` | auf dunklem Grund (weiße Schrift, Verlauf bleibt) |
| `img/logo-weiss.svg` | komplett weiß, für Farbverläufe und Fotos |
| `img/logo-marke.svg` | nur das Zeichen |
| `img/logo-icon.svg` | App-Icon / Favicon (dunkles Quadrat) |
| `img/apple-touch-icon.png`, `img/logo.png` | PNG-Versionen |

## Design-Konzepte im Hero

Die fünf Karten im Hero zeigen erfundene Startseiten in sehr unterschiedlichen Stilen
(Weingut, Yogastudio, Architekturbüro, Rösterei, Tattoo-Studio). Sie sind als „Konzept“
markiert. Ein ausdrücklicher Satz „erfunden“ ist nicht nötig, das Etikett „Konzept“ aber
bitte stehen lassen, damit kein Eindruck echter Kundenprojekte entsteht (UWG §§ 5, 5a).

- Bilder: `img/konzept-*.jpg` (1280 × 800)
- Demos: `konzepte/*.html` sind online anklickbar (Abschnitt „Beispiele“). Sie skalieren sich auf jedes Fenster und tragen unten das Schild
  „Design-Konzept von Brandner Studios“. Bitte nicht als echte Kundenprojekte ausgeben.
- Quellen: `konzepte/*.html`, jeweils eine eigenständige Seite. Nach einer Änderung neu
  abfotografieren, zum Beispiel mit Playwright bei 1280 × 800.

## Zahlen und Erfolge

**Lighthouse-Werte** (Abschnitt „Zahlen, die stimmen“): gemessen mit Lighthouse 12, Oktober 2026.
Desktop 100 / 100 / 100 / 100, Handy Performance 90–95, Rest 100. Nach dem Livegang bitte unter
https://pagespeed.web.dev mit der echten Adresse neu messen und Werte sowie Datum in `index.html`
anpassen (`style="--v: …"` und `data-count="…"` je Kreis, dazu der Satz darunter).

**Erfolge** (Abschnitt `id="erfolge"`): ist noch ausgeblendet. Sobald es echte Projekte und eine
echte Kundenstimme gibt, Zahlen und Zitat eintragen und `hidden` entfernen. Nur wahre Angaben
verwenden – erfundene Zahlen sind irreführende Werbung (§ 5 UWG).

**Schriften** liegen alle lokal in `fonts/` (SIL Open Font License), auch auf den Demo-Seiten.
Die Seite stellt keine Verbindung zu Google oder anderen Drittanbietern her, setzt keine Cookies
und speichert nichts im Browser. Bitte so lassen – sonst Datenschutzerklärung anpassen.

## Stil

Dunkel und technisch: fast schwarzer Hintergrund (`#0a0a0f`), schmale Serifen-Überschriften
(Instrument Serif), Mono-Labels (JetBrains Mono), Karten mit Raster und Leuchten, Terminal-Fenster
und eine Vergleichstabelle. Akzent Pink (`#ff5fa8`) mit Verlauf über Violett nach Blau aus dem Logo.
Alle Farben stehen oben in `style.css` unter `:root`.

## Animationen

- Hero: Wörter fahren hoch, wechselndes Wort mit gemaltem Verlaufs-Marker, wanderndes Raster,
  Farbwolken und ein Lichtkegel, der der Maus folgt
- Leistungs-Karten: Farbfelder werden ausgewählt, Dateien leuchten auf, Fehler werden grün,
  „Dein Betrieb“ klettert im Suchergebnis nach oben
- Vergleichstabelle baut sich Zeile für Zeile auf, Häkchen springen auf
- Ablauf: Terminal-Fenster tippen sich selbst, Zahlen zählen hoch
- Beispiele: Vorschau wischt beim Wechsel ein, wechselt automatisch
- Lichtkegel auf Karten, magnetische Knöpfe, Glanz auf dem Hauptknopf, Fortschrittsbalken
- Bei „Bewegung reduzieren“ werden alle Animationen abgeschaltet

## Was neu ist

- Hero mit animiertem Sternbild-Hintergrund, Browserfenster, das sich „selbst baut“, und Performance-Ring
- „Raster einblenden“ zeigt ein echtes Layout-Raster über der ganzen Seite
- Leistungs-Karten mit kleinen Live-Vorschauen (Farbpalette, Code, CSS-Fix, Google-Treffer)
- Beispiel-Karten mit Mini-Vorschau. Ein Klick wählt im Formular die passende Anfrage vor
- Würzburg-Skyline (SVG) statt Stockfoto, Ablauf mit Fortschrittslinien, rotierender EB-Stempel
- Kontakt: Kopieren-Knöpfe, Anrufen/WhatsApp, Formular öffnet das E-Mail-Programm mit fertiger Nachricht
- Scroll-Fortschritt, aktiver Menüpunkt, „Nach oben“-Knopf, Rücksicht auf „Bewegung reduzieren“

## Noch offen

- **FAQ**: Die Antworten (z. B. „Angebot vor dem Start“, Betreuung nach dem Livegang) bitte prüfen,
  ob sie so zu deinem Angebot passen.

- **Impressum/Datenschutz**: Straße und Hausnummer, USt-Angabe und Hoster ergänzen.
  Beide Seiten sind Vorlagen, bitte rechtlich prüfen lassen.
- **Statement-Text** („Aus Würzburg. Für die Region und überall.“) und die Überschrift
  „Was ich für dich baue.“ waren auf den Screenshots nur teilweise lesbar – bei Bedarf anpassen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Hero, Leistungen, Beispiele, Ablauf, Über mich, Kontakt |
| `style.css` | Gestaltung, responsiv vom Handy bis Desktop |
| `script.js` | Animationen, Raster, Kopieren, Formular |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Vorlagen) |
