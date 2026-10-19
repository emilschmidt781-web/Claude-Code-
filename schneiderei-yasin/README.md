# Schneiderei Yasin – Website

Statische One-Page-Website für die Schneiderei Yasin in Würzburg.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

`index.html` im Browser öffnen oder lokal einen Server starten:

```bash
cd schneiderei-yasin
python3 -m http.server 8000   # http://localhost:8000
```

## Noch offen

- **Impressum**: Name des Inhabers, E-Mail und ggf. USt-ID in `impressum.html`
  ergänzen. Impressum und Datenschutz sind Vorlagen, bitte rechtlich prüfen lassen.
- **Öffnungszeiten** stehen in der Tabelle in `index.html`. Die Anzeige
  „Jetzt geöffnet“ liest die Zeiten (auch mehrere pro Tag) automatisch daraus.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Leistungen, Über uns, Ablauf, FAQ, Kontakt |
| `style.css` | Gestaltung, responsiv für Handy bis Desktop |
| `script.js` | Mobiles Menü, Öffnungsstatus, Einblend-Animationen |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Platzhalter) |
