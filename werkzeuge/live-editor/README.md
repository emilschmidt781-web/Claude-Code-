# Live-Editor für brandner-studios

Nur für die Bearbeiten-Vorschau, nicht für die echte Website.

- In eine Kopie von `brandner-studios/` legen, in `index.html` `editor.css` im Kopf und `editor.js` vor `script.js` einbinden.
- Als Claude-Artifact mit den Fähigkeiten `db` und `assets` veröffentlichen.
- Gespeichert wird im Dokument `editor/zustand`: `texts` (je Text `html` und `original`), `order` (Reihenfolge der Bereiche oder null) und `images` (je Bild `url`, `assetId`, `original`).
- Übernehmen: Texte über `original` in `brandner-studios/index.html` suchen und ersetzen, Bereiche umsortieren, hochgeladene Bilder herunterladen und unter `img/` ablegen.
