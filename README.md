# 🦊 Fokusfuchs

Ein **neuroinklusiver Tagesplaner** für ADHS-, autistische und alle anderen
Gehirne – mit einem kleinen Fuchs, der beim Fokussieren **neben dir sitzt**.

Das Besondere: Fokusfuchs setzt nicht auf Zeitdruck, sondern auf **Body-Doubling
und Belohnung**. Dein Fokus-Buddy macht mit, feuert dich an und du sammelst
Münzen, Streaks und XP – ganz ohne schlechtes Gewissen.

Gebaut mit **React + Vite**. Läuft vollständig lokal im Browser (PWA,
installierbar) – es werden **keine Daten an einen Server gesendet**.

## Funktionen

| Tab | Funktion |
| --- | --- |
| 📅 **Tag** | Farbkodierte Zeitleiste. Aufgaben mit Uhrzeit landen im Tagesplan, flexible Aufgaben in „Wann immer es passt" – kein Zeitdruck. |
| ✅ **To-do** | Alles aus dem Kopf in eine Liste. Kategorien, Energie-Level (🪫/🔋/⚡), Wichtig-Markierung, Drag-and-drop-Sortierung und **KI-Plan**, der sanft eine machbare Reihenfolge vorschlägt. Große Aufgaben lassen sich in kleine Schritte zerlegen (gegen Overwhelm). |
| 🦊 **Fokus** | **Der Herzstück-Body-Doubling-Raum.** Wähl eine Aufgabe und eine Dauer, dann startet ein ruhiger visueller Countdown. Der Fuchs atmet neben dir und schickt druckfreie Mutmach-Nachrichten. Am Ende: Konfetti, Münzen, XP und Streak. |
| 🎁 **Belohnung** | Münz-Shop: Fokusräume (Wald, Café, Weltall …), Hüte für den Fuchs und Farbthemen freischalten. Rein zum Spaß, kein Pay-to-win. |
| 📈 **Einblick** | Streak, Fokus-Stunden, erledigte Aufgaben und ein 7-Tage-Verlauf – zum Muster-Erkennen, ausdrücklich **ohne Wertung**. |

Dazu: **bis zu 5 Profile** (z. B. für die Familie), automatische Hell-/Dunkel-
Darstellung und ein **Ruhemodus** über `prefers-reduced-motion`.

## Warum „anders" als klassische Planer?

- **Body-Doubling statt Alleinsein:** Der Fuchs „arbeitet mit" – das bekannte
  Prinzip, das vielen neurodivergenten Menschen beim Anfangen hilft.
- **Belohnung statt Druck:** Erfolge werden gefeiert, ein ruhiger Tag ist okay.
- **Energie statt nur Uhrzeit:** Aufgaben tragen ein Energie-Level, der KI-Plan
  startet bewusst klein für einen leichten Einstieg.

## Entwicklung

```bash
npm install     # Abhängigkeiten installieren
npm run dev     # Dev-Server (http://localhost:5173)
npm run build   # Produktions-Build nach dist/
npm run preview # Build lokal testen
```

## Technik & Datenschutz

- **React 18 + Vite**, keine weiteren Laufzeit-Abhängigkeiten.
- Zustand liegt in `localStorage` (`src/lib/store.js`), pro Profil getrennt.
- Der „KI-Plan" und die Aufgaben-Zerlegung sind **erklärbare Heuristiken**
  (`src/lib/buddy.js`) – kein Netzwerk-Call, keine Tracker, werbefrei.

## Aufbau

```
src/
  state.jsx            # zentraler App-State + Aktionen (Context)
  lib/store.js         # Persistenz, Kategorien, Belohnungen, Level-Kurve
  lib/buddy.js         # Fokus-Buddy-Nachrichten + KI-Plan-Heuristik
  components/
    FocusRoom.jsx      # Body-Doubling-Fokusraum (Herzstück)
    DayPlanner.jsx     # farbkodierte Tages-Zeitleiste
    TaskList.jsx       # To-do-Liste + Sortierung + KI-Plan
    TaskModal.jsx      # Aufgabe anlegen/bearbeiten + Schritte
    Rewards.jsx        # Münz-Shop
    Insights.jsx       # Statistiken
    Buddy.jsx          # der Fuchs (mit Hut)
    Confetti.jsx       # Feier-Animation
    Onboarding.jsx     # erster Start
    ProfileSheet.jsx   # bis zu 5 Profile
```
