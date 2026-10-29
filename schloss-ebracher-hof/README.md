# Seniorenheim Schloss Ebracher Hof – Website

Statische One-Page-Website für das Seniorenheim Schloß Ebracher Hof GmbH in
Mainstockheim. Reines HTML, CSS und JavaScript, ohne Build-Schritt, ohne Cookies
und ohne externe Dienste. Schrift: Manrope, lokal in `fonts/` (SIL Open Font License).

## Gestaltung

Nach einfachen Regeln aufgebaut:

- **So wenig wie möglich:** Im Mittelpunkt steht, was Besucher tun sollen: anrufen
  oder einen Rückruf anfordern (Überschrift, zwei Eingaben, ein Knopf).
- **Ähnlichkeit und Nähe:** Gleichrangiges sieht gleich aus (Leistungen als
  gleiche Karten, Schritte als gleiche Flächen), Zusammengehöriges steht nah beieinander.
- **Viel Weißraum** zwischen den Abschnitten.
- **Designsystem** in `style.css` unter `:root`: Abstände in 4er-Schritten (rem),
  eine Schrift mit fünf Größen, vier Farben (dunkel, hell, Park-Grün, Mainsandstein),
  ein Haupt- und ein Nebenknopf.
- **Hierarchie:** Titel groß und kräftig, Nebeninformation in gedämpfter Farbe.
- **Tiefe:** dezente Schatten auf Karten und Formular, leichter Verlauf auf dem Hauptknopf.

### Stimmen von Angehörigen

Der Abschnitt `#stimmen` ist vorbereitet, aber mit `hidden` ausgeblendet. Er wird
erst eingeschaltet, wenn zwei bis drei echte Zitate mit Foto und schriftlichem
Einverständnis vorliegen: Fotos als `img/stimme-1.jpg` bis `img/stimme-3.jpg`
ablegen, Platzhalter in [eckigen Klammern] ersetzen, `hidden` entfernen.

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
- **Fotos**: Die zwei Bilder sind Zeichnungen (SVG-Symbole `d-portal` und `d-park`
  oben in `index.html`). Echte Fotos (Hochformat 4:5) sollten sie ersetzen.
- **Nutzertest**: Seite vor dem Livegang Bewohnern, Angehörigen und Mitarbeitenden
  zeigen und nach ihren Rückmeldungen anpassen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Angebot, Das Haus, Stimmen (ausgeblendet), Aufnahme, Fragen, Kontakt |
| `style.css` | Gestaltung, responsiv vom Handy bis zum Desktop |
| `script.js` | Menü, Schriftgröße, Rückruf-Formular (per E-Mail), Einblendungen |
| `fonts/` | Manrope (lokal) |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Vorlagen) |
