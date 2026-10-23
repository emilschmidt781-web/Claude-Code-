# Seniorenheim Schloss Ebracher Hof – Website

Statische One-Page-Website für das Seniorenheim Schloß Ebracher Hof GmbH in
Mainstockheim. Reines HTML, CSS und JavaScript, ohne Build-Schritt, ohne Cookies
und ohne externe Dienste. Schrift: Manrope, lokal in `fonts/` (SIL Open Font License).

## Gestaltung

Ein Motiv trägt die ganze Seite: der Rundbogen des Steinportals von 1624. Er ist
die große Form im ersten Bildschirm, der Rahmen jeder Zeichnung, die Form der
Schaltflächen und Aufzählungszeichen und die Bogenreihe im Fußbereich. Farben aus
dem Haus: Kalkputz (Grund), Park-Grün (Aktion), Mainsandstein-Rosa und Park-Mint.

Zum Mitmachen gibt es den **Rundgang**: Portal, Schlosshof, Park, Kapelle, Zimmer
auswählen, Zeichnung und Text wechseln.

## Ansehen

```bash
cd schloss-ebracher-hof
python3 -m http.server 8000   # http://localhost:8000
```

## Barrierearm

- Große Grundschrift (18 px) und Umschalter **A / A+** oben rechts
- Hohe Kontraste, große Klickflächen, „Zum Inhalt springen“-Link
- Animationen werden bei „Bewegung reduzieren“ abgeschaltet

## Vor der Veröffentlichung prüfen

Die Inhalte stammen aus öffentlichen Quellen (Gemeinde, Denkmalschutz,
Pflegeverzeichnisse) und sollten vom Haus bestätigt werden:

- **Kontakt**: Telefon 09321 7613, Fax 09321 23913, info@seniorenheim-ebracher-hof.de
- **Leistungen** (`#pflege`, `#alltag`): v. a. Kurzzeitpflege, Gottesdienste in der
  Hauskapelle, Sommerfest, Zusammenarbeit mit Ärzten/Therapeuten
- **Impressum**: Geschäftsführung, USt-ID, Anschrift der FQA, Verantwortlicher
- **Datenschutz**: Hosting-Anbieter und ggf. Datenschutzbeauftragte(r)
- **Fotos**: Alle Bilder sind Zeichnungen (SVG-Symbole oben in `index.html`:
  `d-portal`, `d-hof`, `d-park`, `d-kapelle`, `d-zimmer`, `d-giebel`). Echte Fotos
  von Portal, Hof, Park, Kapelle und Zimmern sollten sie ersetzen; sie passen
  in dieselben Bogen-Rahmen (Hochformat 4:5).

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Rundgang, Pflege, Familie & Geschichte, Aufnahme, Fragen, Kontakt |
| `style.css` | Gestaltung, responsiv vom Handy bis zum Desktop |
| `script.js` | Menü, Schriftgröße, Rundgang, Aufnahme-Schritte, Rückruf-Formular (per E-Mail), Einblendungen |
| `fonts/` | Manrope (lokal) |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Vorlagen) |
