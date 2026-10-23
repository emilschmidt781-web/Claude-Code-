# Notizen – Brandner Studios

Stand: 22. Oktober 2026

## Eckdaten

| | |
| --- | --- |
| Name | Edgar Brandner – Brandner Studios (Webdesign) |
| Ort | Mainstockheim bei Würzburg, auch remote |
| E-Mail | brandnerstudios@gmail.com |
| Telefon / WhatsApp | +49 1575 7320820 |
| Projektordner | `brandner-studios/` im Repo `emilschmidt781-web/Claude-Code-` |
| Branch | `claude/dazzling-meitner-0o4pk6` |
| Geplante Adresse | https://emilschmidt781-web.github.io/Claude-Code-/brandner-studios/ (oder eigene Domain) |

## Vor dem Livegang – Pflicht

- [ ] **Impressum** (`impressum.html`): Straße und Hausnummer eintragen.
- [ ] **Impressum**: Umsatzsteuer – Variante A (USt-ID) oder B (Kleinunternehmer § 19 UStG) behalten, andere löschen.
- [ ] **Datenschutz** (`datenschutz.html`): Anschrift und tatsächlichen Hoster (Abschnitt 2) eintragen.
- [ ] Beim Hoster den **Vertrag zur Auftragsverarbeitung** (DPA) abschließen.
- [ ] **Gewerbe anmelden** und Finanzamt informieren (falls noch nicht geschehen).
- [ ] **Foto-Rechte**: kurze Bestätigung von der Person holen, die das Polaroid-Foto gemacht hat.
- [ ] Nach dem Livegang auf https://pagespeed.web.dev neu messen und Werte im Abschnitt „Zahlen“ anpassen.
- [ ] **Adresse anpassen**, falls eine eigene Domain kommt: in `index.html` (og:url, og:image, canonical,
      Strukturdaten), `sitemap.xml` und `robots.txt` steht noch die GitHub-Pages-Adresse.
- [ ] Nach dem Livegang die Seite in der **Google Search Console** anmelden und `sitemap.xml` einreichen.
- [ ] Vorschaubild testen: Link an dich selbst per WhatsApp schicken.

## Veröffentlichung – aktueller Stand

- **Vorschau-Link (Claude-Artifact, privat):** https://claude.ai/artifact/KNXMvv5ewxKHXckwyTTNKZ
  Nur mit deinem Claude-Konto sichtbar, Teilen über das Teilen-Menü auf der Seite. Keine echte Website-Adresse.

- GitHub Pages veröffentlicht diesen Branch nicht: Der Schritt „deploy“ bricht ab, weil vermutlich nur
  `claude/angel-app-tqz8ao` freigegeben ist.
- Lösung A: Inhalt auf `claude/angel-app-tqz8ao` übertragen (Claude Bescheid sagen).
- Lösung B: GitHub → Settings → Environments → `github-pages` → Branch freigeben.
- Lösung C (empfohlen mit eigener Domain): Ordner `brandner-studios` bei Netlify per Drag & Drop hochladen.

## Bewusste Entscheidungen

- **Keine erfundenen Zahlen oder Kundenstimmen** – wäre irreführende Werbung (§ 5 UWG).
  Nur echte Werte (Lighthouse, 30 Min., 1 Ansprechpartner, 5 Stile, 0 Cookies).
- **Design-Konzepte** (Kubus, Bohnenwerk, Rebenhang, Atem, Nachtschicht) sind erfundene Firmen.
  Etikett „Konzept“ bleibt stehen, Hinweis steht im Impressum. Nicht als Kundenprojekte ausgeben.
- **Schneiderei Yasin und Ricky Wagner** wurden auf Wunsch von der Seite entfernt.
- **Helle Abschnitte**: „Über mich“ und FAQ haben Cremeweiß (Klasse `theme-light`), der Rest bleibt dunkel.
  Zurück auf ganz dunkel: `theme-light` in `index.html` an beiden Stellen entfernen.
- **Versionsnummer**: Nach Änderungen an `style.css` oder `script.js` in `index.html` die Zahl bei `?v=` erhöhen,
  sonst zeigen Browser die alte Version aus dem Zwischenspeicher.
- **Alle Schriften lokal** in `fonts/` – keine Verbindung zu Google, keine Cookies, kein Tracking.
  Wer später etwas einbaut (Statistik, Maps, YouTube), muss die Datenschutzerklärung anpassen.

## Was wo geändert wird

| Was | Wo |
| --- | --- |
| Texte, Abschnitte | `index.html` |
| Farben (Pink, Violett, Blau) | `style.css`, ganz oben unter `:root` |
| Animationen, Formular | `script.js` |
| Lighthouse-Werte | `index.html`, Block `id="zahlen"` im Abschnitt „Warum“ (`--v` und `data-count`) |
| Echte Erfolge freischalten | `index.html`, Abschnitt `id="erfolge"`: Werte eintragen, `hidden` entfernen |
| Logos, Fotos, Vorschaubilder | `img/` |
| Demo-Seiten | `konzepte/*.html` |

## Messwerte (Lighthouse 12, Oktober 2026, vor dem Livegang)

- Desktop: Performance 100 · Barrierefreiheit 100 · Best Practices 100 · SEO 100
- Handy: Performance 93–96 · Rest 100

## Nächste Ideen

1. ~~Vorschaubild für WhatsApp, Instagram, LinkedIn~~ – erledigt (`img/og-bild.jpg`)
2. ~~`sitemap.xml`, `robots.txt`, eigene 404-Seite~~ – erledigt (404 greift bei eigener Domain/Netlify)
3. ~~Kostenloser Website-Check~~ – erledigt (seit Oktober als Hinweis im Kontakt, kein eigener Abschnitt mehr)
4. Visitenkarte und Flyer mit QR-Code als PDF
5. Eigene Domain (z. B. brandnerstudios.de) und E-Mail kontakt@brandnerstudios.de
6. Google-Unternehmensprofil anlegen (größter Hebel für „Webdesign Würzburg“)
7. 1–2 echte Referenzprojekte gegen Bewertung → Abschnitt „Erfolge“ füllen
8. Pakete mit „ab“-Preisen (für Privatkunden Endpreise inkl. USt)
9. Unterseiten „Webdesign Würzburg“, „Webdesign Kitzingen“
