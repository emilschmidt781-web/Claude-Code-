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
| Adresse | https://brandnerstudios.de/ (online seit Oktober 2026) |

## Vor dem Livegang – Pflicht

- [ ] **Impressum** (`impressum.html`): Straße und Hausnummer eintragen.
- [ ] **Impressum**: Umsatzsteuer – Variante A (USt-ID) oder B (Kleinunternehmer § 19 UStG) behalten, andere löschen.
- [ ] **Datenschutz** (`datenschutz.html`): Anschrift und tatsächlichen Hoster (Abschnitt 2) eintragen.
- [ ] Beim Hoster den **Vertrag zur Auftragsverarbeitung** (DPA) abschließen.
- [ ] **Gewerbe anmelden** und Finanzamt informieren (falls noch nicht geschehen).
- [ ] **Foto-Rechte**: kurze Bestätigung von der Person holen, die das Polaroid-Foto gemacht hat.
- [ ] Nach dem Livegang auf https://pagespeed.web.dev neu messen und Werte im Abschnitt „Zahlen“ anpassen.
- [x] **Adresse angepasst** auf https://brandnerstudios.de/ (index.html, sitemap.xml, robots.txt) – 24. Oktober 2026
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

## Checkliste vor dem Livegang (20 Punkte, Stand 23. Oktober 2026)

| # | Punkt | Stand |
| --- | --- | --- |
| 1 | Datenschutzerklärung | ✓ `datenschutz.html` – Anschrift und Hoster noch eintragen |
| 2 | AGB | bewusst keine – nicht Pflicht; Bedingungen stehen im jeweiligen Angebot |
| 3 | Keine Geheimnisse im Code | ✓ geprüft – keine Schlüssel, Passwörter oder Zugangsdaten |
| 4 | HTTPS erzwingen | ✓ `netlify.toml` (Netlify) bzw. `.htaccess` (Strato, IONOS …); bei GitHub Pages „Enforce HTTPS“ anhaken |
| 5 | Cookie-Banner | nicht nötig – keine Cookies, kein Tracking (steht in der Datenschutzerklärung) |
| 6 | Seitentitel und Beschreibungen | ✓ für alle Seiten; Konzepte, Impressum, Datenschutz, 404 auf `noindex` |
| 7 | Vorschaubild zum Teilen | ✓ `img/og-bild.jpg` mit Open-Graph- und Twitter-Angaben |
| 8 | Favicon | ✓ `favicon.ico`, SVG, Apple-Icon, App-Icons und `site.webmanifest` |
| 9 | Sitemap und robots.txt | ✓ |
| 10 | Alt-Texte | ✓ alle Bilder geprüft |
| 11 | Bilder komprimiert | ✓ WebP statt JPG (ca. 55 % kleiner); JPG nur noch fürs Vorschaubild |
| 12 | Ladezeit | ✓ Lighthouse: Desktop 100, Handy 92–95 |
| 13 | Farbkontrast | ✓ Lighthouse-Barrierefreiheit 100 |
| 14 | Handy-tauglich | ✓ |
| 15 | Eigene 404-Seite | ✓ `404.html` (Netlify automatisch, Apache über `.htaccess`) |
| 16 | Kaputte Links | ✓ alle internen Links, Sprungmarken und Dateien geprüft |
| 17 | Formular-Prüfung | ✓ Name, echte E-Mail, Website-Format, Pflicht-Adresse beim Website-Check, Längenbegrenzung |
| 18 | Spam-Schutz | nicht nötig – das Formular öffnet das E-Mail-Programm, es gibt keinen Server, der Spam empfangen kann |
| 19 | Besucher-Statistik | offen – Empfehlung: cookiefrei (z. B. GoatCounter, kostenlos) und dann Datenschutzerklärung ergänzen |
| 20 | Ein klarer Aufruf | ✓ überall „Projekt besprechen“ |

## Neugestaltung 28. Oktober 2026 – „nicht nach KI aussehen“

- Richtung: **Der Name als Monument** – „Brandner Studios“ riesig auf Markenpink, danach Graphit und helles Grau.
- Eine Schriftfamilie (Archivo / Archivo Wide), drei Farben (Graphit, Hellgrau, Pink aus dem Logo).
- Entfernt: Farbverläufe, Glas-Effekte, Leuchten, kleine Großbuchstaben-Labels über Überschriften,
  Nummerierungen (01/02/03), Programmierer-Schrift, Kartenreihen, Lauftext, wechselndes Wort.
- Neu: Arbeiten als große, versetzte Bilder · Leistungen als Namenslisten · Ablauf als Treppe mit Linien-Zeichnungen ·
  Kontakt mit Auswahl, die die E-Mail fertig vorbereitet · Name kommt in der Fußzeile zurück.
- `img/handy-ansicht.webp` ist ein Screenshot dieser Seite am Handy – nach größeren Änderungen neu erstellen.
- Lighthouse (lokal, 28. Oktober 2026): Computer und Handy je 100 / 100 / 100 / 100.

## Neugestaltung 28. Oktober 2026 (zweite Runde) – „coole Sachen“ wie in den Beispielen

- Hell mit pinker Bühne: riesiges „BRANDNER“, davor Laptop und Handy, in denen die fünf Beispiele wechseln.
- Schwebende Info-Karten, Vorteile-Reihe, große graue/schwarze Schrift mit schrägem Foto darüber,
  Bildkarten zum Wischen, Leistungs-Karten, vier Schritte mit Zeichnungen, Zahlen-Karten, Formular-Karte.
- Kleine Bildversionen `img/konzept-*-800.webp` für Laptop und Handy (schneller am Handy).
- Lighthouse (lokal, 28. Oktober 2026): Computer 100 / 100 / 100 / 100, Handy 98–99 / 100 / 100 / 100.
  Auf der Seite steht deshalb „100 am Computer, 98 am Handy“.

## Feinschliff nach Design-Regeln (Video), 28. Oktober 2026

- Weniger: Ecken-Texte, zweite schwebende Karte, runder Aufkleber, Zahlen-Abschnitt, zwei doppelte Fragen entfernt;
  Leistungen auf je drei Punkte gekürzt.
- Festes System in `style.css` (ganz oben): Abstände `--s-1` bis `--s-10` in 4-Pixel-Schritten (rem),
  Schriftgrößen `--fs-sm` bis `--fs-2xl`, Schatten `--shadow-sm`. Neue Werte immer daraus nehmen.
- Mehr Abstand zwischen den Abschnitten (`--section`).
- Tiefe: Karten heben sich mit weichem Schatten ab statt mit Linien.
- Akzent: „Projekt besprechen“ oben und der Formular-Knopf in Pink mit feinem Verlauf (`.btn-accent`).
- Gesicht und einfache Sprache: persönliches Zitat von Edgar mit Foto.
- **Kundenstimmen** (`id="stimmen"`) sind vorbereitet, aber ausgeblendet. Sobald 2–3 echte Stimmen mit Foto
  und Erlaubnis da sind: in `index.html` eintragen und `hidden` entfernen. Niemals erfundene Stimmen.

## Bewusste Entscheidungen

- **Keine erfundenen Zahlen oder Kundenstimmen** – wäre irreführende Werbung (§ 5 UWG).
  Nur echte Werte (Lighthouse, 30 Min., 1 Ansprechpartner, 0 Cookies).
- **Design-Konzepte** (Quader, Bohnenwerk, Rebenhang, Atem, Nachtschicht) sind erfundene Firmen.
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
- Nachmessung 23. Oktober 2026 (nach Baukasten, Konfetti, neuer Schrift): Desktop 3× 100/100/100/100,
  Handy 5 Läufe: Tempo 94–95 (ein Ausreißer mit 83 beim ersten, kalten Lauf) · Rest 100.
  Die Angaben auf der Seite („100“, „am Handy über 90“) stimmen damit weiterhin.

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

## Konzepte als eigene Seite (29.10.)
- Der Bereich „Arbeiten“ ist von der Startseite entfernt. Die Konzepte liegen jetzt auf `konzepte.html` und sind im Menü als „Konzepte“ verlinkt.
- Auf Handy und Tablet gibt es ein Menü zum Aufklappen (Knopf rechts oben).
- Der Knopf in der Leiste der Konzept-Seiten führt zurück zu `konzepte.html`.

## Handy-Tempo 100 (29.10.)
- Kleinere Bilder: `konzept-*-560.webp` für den Laptop am Handy, `konzept-*-handy-200.webp` fürs kleine Handy, `edgar-privat-600.webp` und `edgar-avatar.webp` (96 px).
- Im Startbild lädt nur das erste Bild sofort, die anderen vier erst nach dem Laden der Seite.
- Das erste Laptop-Bild wird im Kopf vorgeladen.
- Abschnitte weiter unten werden erst berechnet, wenn sie in die Nähe kommen (`content-visibility`).
- Lighthouse (lokal mit Komprimierung wie bei Netlify, 29.10.2026): Handy 100 (3 Läufe), Computer 100, Konzepte-Seite Handy 100.
  Auf der Seite steht deshalb „100 – am Computer und am Handy“. Nach dem Livegang mit pagespeed.web.dev gegenprüfen.
