// Beißprognose-Logik ("wann am besten angeln").
//
// Kombiniert mehrere Faktoren, die die Fressaktivität von Fischen
// nachweislich beeinflussen, zu einem Score von 0–100:
//   1. Solunar-Theorie: Mondphase (Voll-/Neumond = stärkere Aktivität)
//   2. Tageszeit: Morgen-/Abenddämmerung sind Prime-Time
//   3. Jahreszeit / Monat: art- bzw. saisonabhängig
//   4. Wetter: Luftdruck-Tendenz, Bewölkung, Wind (Nutzereingabe)
//
// Alle Berechnungen sind deterministisch und laufen offline.

// --- Mondphase ---------------------------------------------------------

// Liefert die Mondphase als Wert 0..1 (0 = Neumond, 0.5 = Vollmond).
export function moonPhase(date) {
  // Bekannter Neumond: 6. Januar 2000, 18:14 UTC
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14) / 1000
  const synodicMonth = 29.53058867 * 86400 // Sekunden
  const now = date.getTime() / 1000
  let phase = ((now - knownNewMoon) % synodicMonth) / synodicMonth
  if (phase < 0) phase += 1
  return phase
}

export function moonPhaseName(phase) {
  const names = [
    'Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond',
    'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel',
  ]
  const idx = Math.round(phase * 8) % 8
  return names[idx]
}

export function moonEmoji(phase) {
  const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
  const idx = Math.round(phase * 8) % 8
  return emojis[idx]
}

// Solunar-Score 0..1: nahe Neumond (0) und Vollmond (0.5) am höchsten.
function solunarScore(phase) {
  // Abstand zur nächsten "starken" Phase (0 oder 0.5)
  const dist = Math.min(
    Math.abs(phase - 0),
    Math.abs(phase - 0.5),
    Math.abs(phase - 1)
  )
  // dist reicht von 0 (stark) bis 0.25 (schwach) -> auf 1..0 mappen
  return 1 - dist / 0.25
}

// --- Tageszeit ---------------------------------------------------------

// Kategorisiert eine Stunde (0–23) in eine Tageszeit-Klasse.
export function timeOfDay(hour) {
  if (hour >= 5 && hour < 8) return 'daemmerung'
  if (hour >= 8 && hour < 11) return 'morgen'
  if (hour >= 11 && hour < 17) return 'tag'
  if (hour >= 17 && hour < 20) return 'daemmerung'
  if (hour >= 20 && hour < 23) return 'abend'
  return 'nacht'
}

// Grundwert der Tageszeit für die Beißaktivität (0..1).
function timeScore(hour) {
  // Dämmerung morgens (~5-8) und abends (~18-21) = Prime-Time.
  const peaks = [6.5, 19.5]
  let best = 0
  for (const p of peaks) {
    const d = Math.abs(hour - p)
    best = Math.max(best, Math.max(0, 1 - d / 4))
  }
  // Nachts moderate Grundaktivität, mittags am niedrigsten.
  const base = hour >= 22 || hour < 5 ? 0.45 : 0.25
  return Math.max(best, base)
}

// --- Wetter ------------------------------------------------------------

// weather: { pressureTrend: 'fallend'|'stabil'|'steigend',
//            clouds: 'klar'|'leicht'|'bewoelkt',
//            wind: 'windstill'|'leicht'|'stark' }
function weatherScore(weather) {
  let s = 0.5
  // Fallender Luftdruck kurbelt die Fressaktivität an, steigender bremst.
  if (weather.pressureTrend === 'fallend') s += 0.25
  else if (weather.pressureTrend === 'steigend') s -= 0.15
  // Leichte Bewölkung ist ideal (weniger Scheu), praller Sonnenschein weniger.
  if (weather.clouds === 'leicht') s += 0.15
  else if (weather.clouds === 'bewoelkt') s += 0.05
  else if (weather.clouds === 'klar') s -= 0.05
  // Leichter Wind ("Anglerwind") bringt Sauerstoff & Bewegung, Sturm stört.
  if (weather.wind === 'leicht') s += 0.1
  else if (weather.wind === 'stark') s -= 0.15
  return Math.min(1, Math.max(0, s))
}

// --- Gesamtprognose ----------------------------------------------------

// Optional fish: berücksichtigt Monats-/Tageszeit-Präferenz einer Art.
export function biteForecast({ date, weather, fish = null }) {
  const phase = moonPhase(date)
  const hour = date.getHours()
  const month = date.getMonth() + 1

  const parts = {
    mond: solunarScore(phase),
    tageszeit: timeScore(hour),
    wetter: weatherScore(weather),
  }

  let seasonScore = 0.6 // neutral, wenn keine Art gewählt ist
  if (fish) {
    seasonScore = fish.bestMonths.includes(month) ? 1 : 0.35
    // Tageszeit-Präferenz der Art verstärkt / dämpft den Zeitwert.
    const tod = timeOfDay(hour)
    if (fish.bestTimes.includes(tod)) parts.tageszeit = Math.min(1, parts.tageszeit + 0.2)
    else parts.tageszeit = parts.tageszeit * 0.8
  }
  parts.saison = seasonScore

  // Gewichtete Summe.
  const weights = fish
    ? { mond: 0.25, tageszeit: 0.3, wetter: 0.25, saison: 0.2 }
    : { mond: 0.3, tageszeit: 0.35, wetter: 0.35 }

  let score = 0
  let totalWeight = 0
  for (const key of Object.keys(weights)) {
    if (parts[key] !== undefined) {
      score += parts[key] * weights[key]
      totalWeight += weights[key]
    }
  }
  score = score / totalWeight

  const percent = Math.round(score * 100)
  return {
    percent,
    rating: ratingFor(percent),
    factors: parts,
    moon: { phase, name: moonPhaseName(phase), emoji: moonEmoji(phase) },
    hour,
  }
}

export function ratingFor(percent) {
  if (percent >= 75) return { label: 'Ausgezeichnet', emoji: '🔥', color: '#2b8a3e' }
  if (percent >= 55) return { label: 'Gut', emoji: '👍', color: '#5c940d' }
  if (percent >= 40) return { label: 'Mittelmäßig', emoji: '😐', color: '#e8a900' }
  return { label: 'Schwach', emoji: '💤', color: '#e03131' }
}

// Prognose für die nächsten `hours` Stunden im Stundenraster.
export function hourlyForecast({ baseDate, weather, fish = null, hours = 24 }) {
  const results = []
  for (let i = 0; i < hours; i++) {
    const d = new Date(baseDate.getTime() + i * 3600 * 1000)
    const fc = biteForecast({ date: d, weather, fish })
    results.push({ date: d, hour: d.getHours(), percent: fc.percent, rating: fc.rating })
  }
  return results
}
