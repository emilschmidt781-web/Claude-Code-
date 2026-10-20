# W&S Karrierepartner – Website

Statische One-Page-Website für W&S Karrierepartner (Ricky Wagner), Personalvermittlung in Kitzingen.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

`index.html` im Browser öffnen oder lokal einen Server starten:

```bash
cd ricky-wagner
python3 -m http.server 8000   # http://localhost:8000
```

## Noch offen

- **Impressum**: Straße/Hausnummer, ggf. weitere Inhaber und USt-ID ergänzen.
- **Logo** liegt freigestellt in `img/` (`logo.png` farbig, `logo-white.png` und
  `mark-white.png` für dunklen Hintergrund, `favicon.png`).
- **Rechtstexte** sind Vorlagen, bitte rechtlich prüfen lassen.
- **Kontaktformular** öffnet das Mailprogramm des Besuchers (statische Seite,
  kein Server). Für echten Versand z. B. Formspree o. Ä. anbinden.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Unternehmen, Bewerber, Bereiche, Ablauf, Über mich, FAQ, Kontakt |
| `style.css` | Gestaltung, responsiv für Handy bis Desktop |
| `script.js` | Mobiles Menü, Einblend-Animationen, Kontaktformular |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Platzhalter) |
