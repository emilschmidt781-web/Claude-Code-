# 🎣 Angel-App

Eine Web-App fürs Angeln mit **KI-Fischerkennung** und **Beißprognose** – sie
hilft dir zu erkennen, *welchen* Fisch du gefangen hast und zeigt dir, *wann*
und *wo* du am besten angelst.

Gebaut mit **React + Vite**. Läuft vollständig offline im Browser – es werden
keine Daten an einen Server gesendet.

## Funktionen

| Tab | Funktion |
| --- | --- |
| 📷 **Erkennung** | Foto des Fangs hochladen → die App analysiert Farbe & Form on-device und schlägt die wahrscheinlichste Art vor (mit Konfidenz-Ranking). |
| 🕐 **Beißprognose** | Berechnet einen Beiß-Score (0–100) aus Mondphase (Solunar), Tageszeit, Jahreszeit und Wetter – inkl. 24-Stunden-Verlauf. Optional pro Zielfisch. |
| 📖 **Guide** | Steckbriefe heimischer Arten: Lebensraum, beste Monate, Tageszeiten, Köder, Mindestmaß und Tipps. |
| 📍 **Plätze** | Eigene Angelplätze mit Gewässer, Zielfisch und Notizen speichern (lokal via `localStorage`). |

## Entwicklung

```bash
npm install     # Abhängigkeiten installieren
npm run dev     # Dev-Server starten (http://localhost:5173)
npm run build   # Produktions-Build nach dist/
npm run preview # Build lokal testen
```

## Wie funktioniert die Erkennung?

Die Fischerkennung (`src/lib/recognition.js`) ist ein **heuristischer
Bildklassifikator**: Das Foto wird auf ein kleines Canvas gezeichnet, daraus
werden dominanter Farbton, Sättigung, Helligkeit und die Form/Elongation des
Motivs extrahiert und mit den Signaturen in der Fisch-Datenbank
(`src/data/fishes.js`) verglichen. Das läuft komplett offline und benötigt kein
trainiertes Modell.

> Für eine echte, hochgenaue Erkennung würde man hier ein trainiertes
> Bildmodell (z.B. TensorFlow.js) einbinden. Die aktuelle Heuristik ersetzt
> **keine** sichere Artbestimmung.

## Wie funktioniert die Beißprognose?

`src/lib/solunar.js` kombiniert mehrere Faktoren, die die Fressaktivität von
Fischen beeinflussen, zu einem Score:

1. **Solunar** – Mondphase (Voll- und Neumond = höhere Aktivität), deterministisch berechnet.
2. **Tageszeit** – Morgen- und Abenddämmerung als Prime-Time.
3. **Jahreszeit** – art- bzw. saisonabhängig aus der Fisch-Datenbank.
4. **Wetter** – Luftdruck-Tendenz, Bewölkung und Wind (Nutzereingabe).

## Hinweis

Schonzeiten, Mindestmaße und Regeln unterscheiden sich je nach Bundesland und
Gewässer. Angle immer mit gültigem Angelschein und beachte die örtlichen
Vorschriften. **Petri Heil!** 🐟
