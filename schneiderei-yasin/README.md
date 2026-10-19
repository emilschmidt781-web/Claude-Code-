# Schneiderei Yasin – Website

Statische One-Page-Website für die Schneiderei Yasin in Würzburg.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

`index.html` im Browser öffnen oder lokal einen Server starten:

```bash
cd schneiderei-yasin
python3 -m http.server 8000   # http://localhost:8000
```

## Vor der Veröffentlichung anpassen

Alle Stellen sind im HTML mit `TODO` markiert:

- **Adresse, Telefon, E-Mail**: `index.html`, Bereich „Kontakt“
- **Öffnungszeiten**: Tabelle in `index.html`. Die Anzeige „Jetzt geöffnet“
  liest die Zeiten automatisch aus der Tabelle.
- **Impressum / Datenschutz**: `impressum.html`, `datenschutz.html`
  (Platzhalter, bitte rechtlich prüfen lassen)

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Leistungen, Über uns, Ablauf, FAQ, Kontakt |
| `style.css` | Gestaltung, responsiv für Handy bis Desktop |
| `script.js` | Mobiles Menü, Öffnungsstatus, Einblend-Animationen |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Platzhalter) |
