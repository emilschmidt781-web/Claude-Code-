# Ricky Wagner Personalvermittlung – Website

Statische One-Page-Website für den Personalvermittler Ricky Wagner.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

`index.html` im Browser öffnen oder lokal einen Server starten:

```bash
cd ricky-wagner
python3 -m http.server 8000   # http://localhost:8000
```

## Noch offen

- **Kontaktdaten**: Telefon, E-Mail und Adresse sind Platzhalter – in `index.html`,
  `impressum.html`, `datenschutz.html` und `RECIPIENT` in `script.js` ersetzen.
- **Foto**: Im Abschnitt „Über mich“ den Platzhalter durch ein `<img>` ersetzen.
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
