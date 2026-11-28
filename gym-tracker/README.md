# Hantelbuch – Gym-Tracker fürs Handy

Web-App zum Mitschreiben von Gewichten und Wiederholungen im Gym, mit Fortschritt pro Übung.
Reines HTML/CSS/JS, keine Abhängigkeiten.

## Funktionen

- **Training:** Übungen wählen (27 vorgegeben + eigene), pro Satz kg und Wiederholungen mit großen +/− Tasten.
  Vorschlag aus dem letzten Satz bzw. dem letzten Training, „Letztes Mal“-Anzeige, „Wiederholen“ für frühere Trainings.
- **Pausentimer** startet nach jedem Satz, piept/vibriert am Ende (60/90/120/180 s einstellbar, ±15 s).
- **Scheibenrechner** für Langhantelübungen (Wettkampffarben, Stange 20/15/10 kg).
- **Rekorde:** neues geschätztes Maximum (Epley) wird beim Speichern markiert.
- **Fortschritt:** Volumen pro Woche, Kurve je Übung (Maximum, schwerster Satz, Volumen), Bestwerte, Körpergewicht.
- **Verlauf** aller Trainings, löschen, Sicherung als JSON herunterladen und wieder laden.
- Display bleibt während des Trainings an (wenn der Browser es erlaubt).

## Dateien

| Datei | Inhalt |
| --- | --- |
| `app.html` | Die App (Quelle). Wird auch 1:1 als Claude-Artifact veröffentlicht. |
| `index.html` | Eigenständige Version, erzeugt mit `node gym-tracker/build.mjs` – nicht von Hand bearbeiten. |
| `manifest.webmanifest`, `sw.js`, `icons/` | „Zum Home-Bildschirm“ und Offline-Betrieb |

## Speicherung

- Als eigenständige Seite (`index.html`): im Browser auf dem Gerät (`localStorage`).
- Als Claude-Artifact: zusätzlich privat im Claude-Konto des Nutzers (`db`, Pfad `data/users/<id>/gym`),
  damit die Daten auf allen Geräten gleich sind.

## Lokal ansehen

```bash
cd gym-tracker && python3 -m http.server 8000   # http://localhost:8000
```
