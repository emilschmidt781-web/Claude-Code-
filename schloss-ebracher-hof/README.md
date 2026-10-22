# Seniorenheim Schloss Ebracher Hof – Website

Statische One-Page-Website für das Seniorenheim Schloß Ebracher Hof GmbH in
Mainstockheim. Reines HTML, CSS und JavaScript, ohne Build-Schritt, ohne Cookies
und ohne externe Dienste (Systemschriften statt Google Fonts).

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
- **Fotos**: Die Startseite nutzt eine gezeichnete Illustration. Echte Fotos von
  Haus, Park und Zimmern würden die Seite deutlich aufwerten.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Haus, Pflege, Alltag, Geschichte, Aufnahme, FAQ, Karriere, Kontakt |
| `style.css` | Gestaltung, responsiv vom Handy bis zum Desktop |
| `script.js` | Mobiles Menü, Schriftgröße, Rückruf-Formular (per E-Mail), Einblendungen |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Vorlagen) |
