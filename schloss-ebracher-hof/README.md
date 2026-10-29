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

### Fotos einfügen

Jeder Bildplatz zeigt einen gestrichelten Platzhalter mit Motiv, Dateiname und
Format. Foto mit diesem Namen nach `img/` legen, fertig. Die vollständige Liste
steht in `img/README.md`.

### Stimmen von Angehörigen

Der Abschnitt `#stimmen` enthält Platzhalter in [eckigen Klammern]. Nur echte
Zitate mit Foto und schriftlichem Einverständnis eintragen; bis dahin den
Abschnitt vor dem Livegang mit `hidden` ausblenden.

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
- **Fotos**: 16 Bildplätze warten auf echte Fotos (siehe `img/README.md`).
- **Nutzertest**: Seite vor dem Livegang Bewohnern, Angehörigen und Mitarbeitenden
  zeigen und nach ihren Rückmeldungen anpassen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Angebot, Einblicke, Team, Stimmen, Aufnahme, Fragen, Kontakt |
| `img/` | Fotos (Liste und Dateinamen in `img/README.md`) |
| `style.css` | Gestaltung, responsiv vom Handy bis zum Desktop |
| `script.js` | Menü, Schriftgröße, Rückruf-Formular (per E-Mail), Einblendungen |
| `fonts/` | Manrope (lokal) |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Vorlagen) |
