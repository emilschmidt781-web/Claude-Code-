# Edgar Brandner – Webdesign (Website)

Neuauflage der Website von brandnerstudios.de: gleiche Inhalte, neues Design.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

```bash
cd brandner-studios
python3 -m http.server 8000   # http://localhost:8000
```

## Was neu ist

- Hero mit animiertem Sternbild-Hintergrund, Browserfenster, das sich „selbst baut“, und Performance-Ring
- „Raster einblenden“ zeigt ein echtes Layout-Raster über der ganzen Seite
- Leistungs-Karten mit kleinen Live-Vorschauen (Farbpalette, Code, CSS-Fix, Google-Treffer)
- Beispiel-Karten mit Mini-Vorschau. Ein Klick wählt im Formular die passende Anfrage vor
- Würzburg-Skyline (SVG) statt Stockfoto, Ablauf mit Fortschrittslinien, rotierender EB-Stempel
- Kontakt: Kopieren-Knöpfe, Anrufen/WhatsApp, Formular öffnet das E-Mail-Programm mit fertiger Nachricht
- Scroll-Fortschritt, aktiver Menüpunkt, „Nach oben“-Knopf, Rücksicht auf „Bewegung reduzieren“

## Noch offen

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
