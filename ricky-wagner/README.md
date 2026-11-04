# W&S Karrierepartner – Website

Statische One-Page-Website für W&S Karrierepartner (Ricky Wagner), Personalvermittlung in Kitzingen.
Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Ansehen

`index.html` im Browser öffnen oder lokal einen Server starten:

```bash
cd ricky-wagner
python3 -m http.server 8000   # http://localhost:8000
```

## Stellen- und Bewerberprofile pflegen (Google-Tabelle)

Ricky pflegt Stellen und Bewerberprofile selbst in einer **Google-Tabelle** – ohne Code.
Die Website liest sie beim Aufruf aus (`tabelle.js`).

- Tabelle: „W&S Karrierepartner – Stellen & Bewerber“ (Google Drive, freigegeben „Jeder mit dem Link: Betrachter“)
- Link steht in `tabelle.js` → `window.TABELLE_LINK`
- Reiter **Stellen**: ID · Titel · Bereich · Kategorie · Ort · Art · Beschreibung · Punkte · Aktiv
- Reiter **Bewerber**: ID · Beruf · Bereich · Kategorie · Erfahrung · Region · Verfügbar · Stärken · Aktiv
- Reiter **Anleitung**: Kurzanleitung für Ricky
- Bereich: `technisch` oder `kaufmännisch` · Punkte/Stärken mit `;` trennen · Aktiv `nein` = ausgeblendet
- Spaltenreihenfolge ist egal, Spaltennamen und Reiternamen aber nicht ändern.
- Änderungen erscheinen beim nächsten Neuladen der Seite (ggf. 1–2 Minuten Verzögerung durch Google).
- Ist Google nicht erreichbar oder kein Link eingetragen, nutzt die Seite die Einträge aus `profile.js`.

**Übergabe an Ricky:** Tabelle in Google Drive an Rickys Google-Konto übertragen (Teilen → Eigentümer)
oder er legt eine Kopie an, gibt sie „Jeder mit dem Link: Betrachter“ frei und der neue Link kommt in `tabelle.js`.

**Wichtig:** Die Tabelle ist öffentlich lesbar. Keine Namen, Telefonnummern oder sonstigen persönlichen Daten
eintragen. Bewerberprofile nur anonymisiert und mit Einverständnis. Die Datenschutzerklärung (Punkt 3)
nennt die Einbindung von Google Sheets – vor dem Livegang mit prüfen lassen.

## Suchmaschinen & Teilen

- Vorschau beim Teilen (WhatsApp, Facebook, LinkedIn): `og:`-Angaben in jeder Seite, Bild `img/og-image.jpg`
  (Vorlage: `vorlagen/og-bild.html`).
- Google-Firmenangaben (`EmploymentAgency`) als JSON-LD in `index.html`.
- `sitemap.xml` in der Google Search Console einreichen. Bei eigener Domain alle
  Adressen `https://emilschmidt781-web.github.io/Claude-Code-/ricky-wagner/` ersetzen
  (Seiten, `sitemap.xml`, JSON-LD, QR-Codes) und `404.html` an die Domain-Wurzel legen.
- Beispielprofile: `window.ZEIGE_BEISPIELE` in `profile.js` (aktuell `false` = ausgeblendet).

## Noch offen

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
| `unternehmen.html` + `bedarf.js` | „Personalbedarf melden“: 3-Schritte-Formular für Unternehmen (mehrere Stellen), Versand per E-Mail/WhatsApp; optional Formspree über `FORM_ENDPOINT` |
| `style.css` | Gestaltung, responsiv für Handy bis Desktop |
| `script.js` | Menü, Animationen, Profile, Filter, Kontaktformular |
| `profile.js` | Ersatzdaten der Stellen- und Bewerberprofile (falls die Tabelle nicht lädt) |
| `tabelle.js` | Lädt Stellen und Bewerberprofile aus der Google-Tabelle |
| `berufs-assistent.js` | Chat „Welcher Job passt zu mir?“: 4 Fragen → Berufsvorschläge + passende Stellen; Wissensbasis `BERUFE` oben in der Datei |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Platzhalter) |
