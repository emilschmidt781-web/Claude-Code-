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
3. **Referenzen**: Schneiderei Yasin und W&S Karrierepartner mit echten Screenshots (Desktop + Handy), verlinkt auf die Live-Seiten
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

## Stil

Hell und fett: Weiß und Creme (`#f7f3ea`), dunkle Schrift (`#1f1f22`), Inter in Schwarz (900)
mit Großbuchstaben für große Überschriften. Farbverläufe von Pink (`#e0337a`) über Lavendel nach
Blau (`#5fb0ec`) für Abschnittsköpfe und Zahlen, Lime bis Türkis für Logo und Hero-Überschrift.
Hero, Menü und Kontakt liegen auf einem großen, langsam fließenden Verlauf. Schwarze und weiße
Pillen-Knöpfe, runder schwarzer Menü-Knopf. Alle Farben stehen oben in `style.css` unter `:root`,
der Stil-Block am Ende der Datei überschreibt die ältere dunkle Gestaltung.

## Animationen

- Intro beim ersten Besuch: Logo tippt sich, Vorhang fährt hoch (einmal pro Sitzung)
- Hero: Wörter fahren einzeln hoch, „Vertrauen / Kunden / Anfragen“ wechselt, Aurora-Farbwolken
- Eigener Mauszeiger mit Ring („Anfragen“ über den Beispielen), magnetische Knöpfe
- Karten kippen in 3D mit Lichtreflex, Knöpfe mit einfahrender Füllung
- Abschnitts-Labels „entschlüsseln“ sich, Überschriften erscheinen Wort für Wort
- Laufband wird beim Scrollen schneller und neigt sich
- Skyline mit Parallax, Sternen, Sternschnuppe, Mond und glitzerndem Main
- Kontaktfläche wächst beim Scrollen auf volle Breite
- Bei „Bewegung reduzieren“ und auf Touch-Geräten werden die aufwendigen Effekte abgeschaltet

## Was neu ist

- Hero mit animiertem Sternbild-Hintergrund, Browserfenster, das sich „selbst baut“, und Performance-Ring
- „Raster einblenden“ zeigt ein echtes Layout-Raster über der ganzen Seite
- Leistungs-Karten mit kleinen Live-Vorschauen (Farbpalette, Code, CSS-Fix, Google-Treffer)
- Beispiel-Karten mit Mini-Vorschau. Ein Klick wählt im Formular die passende Anfrage vor
- Würzburg-Skyline (SVG) statt Stockfoto, Ablauf mit Fortschrittslinien, rotierender EB-Stempel
- Kontakt: Kopieren-Knöpfe, Anrufen/WhatsApp, Formular öffnet das E-Mail-Programm mit fertiger Nachricht
- Scroll-Fortschritt, aktiver Menüpunkt, „Nach oben“-Knopf, Rücksicht auf „Bewegung reduzieren“

## Noch offen

- **Referenzen**: Bitte kurz bei Schneiderei Yasin und Ricky Wagner nachfragen, ob sie als Referenz
  gezeigt werden dürfen. Die Screenshots liegen in `img/` und lassen sich jederzeit austauschen.
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
