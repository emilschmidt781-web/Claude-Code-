# W&S Karrierepartner – Website

Statische One-Page-Website für W&S Karrierepartner (Ricky Wagner), Personalvermittlung in Kitzingen.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

`index.html` im Browser öffnen oder lokal einen Server starten:

```bash
cd ricky-wagner
python3 -m http.server 8000   # http://localhost:8000
```

## Stellen- und Bewerberprofile pflegen

Alle Profile stehen in `profile.js` (`window.STELLEN` und `window.KANDIDATEN`).
Einträge hinzufügen, ändern oder löschen – die Website zeigt sie automatisch an,
inklusive Suche (Freitext, Kategorie, Ort), „Jetzt bewerben“/„Profil anfragen“ (E-Mail), WhatsApp und
Direktlink (z. B. `stellen.html#stelle-S-101`). Die mitgelieferten Einträge sind **Beispiele**
(`beispiel: true` zeigt ein Label) und müssen vor dem Livegang ersetzt werden.
Bewerberprofile nur anonymisiert und mit Einverständnis veröffentlichen.

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
| `index.html` | Startseite: Hero mit Kennzahlen, Leistungen (Umschalter Unternehmen/Bewerber), Ablauf, Über mich, FAQ, Kontakt |
| `stellen.html` | Unterseite Stellenangebote mit Suche |
| `bewerberprofile.html` | Unterseite Bewerberprofile mit Suche |
| `style.css` | Gestaltung, responsiv für Handy bis Desktop |
| `script.js` | Menü, Animationen, Profile, Filter, Kontaktformular |
| `profile.js` | Daten der Stellen- und Bewerberprofile |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Platzhalter) |
