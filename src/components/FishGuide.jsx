import { FISHES, MONTH_LABELS, TIME_LABELS } from '../data/fishes.js'

export default function FishGuide() {
  const currentMonth = new Date().getMonth() + 1

  return (
    <div className="card">
      <h2>📖 Fisch-Guide – wo & womit</h2>
      <p className="muted">
        Lebensraum, beste Monate, Tageszeiten und Köder für heimische Arten.
        Grün markierte Monate sind aktuell{' '}
        {FISHES.some((f) => f.bestMonths.includes(currentMonth))
          ? 'in Saison.'
          : 'Richtwerte.'}
      </p>

      <div className="fish-grid">
        {FISHES.map((fish) => (
          <div className="fish-card" key={fish.id}>
            <div className="head">
              <span className="emoji">{fish.emoji}</span>
              <div>
                <h3>{fish.name}</h3>
                <span className="latin">{fish.latin}</span>
              </div>
            </div>

            <div className="muted">📍 {fish.habitat}</div>

            <div className="months">
              {MONTH_LABELS.map((m, i) => (
                <span
                  key={m}
                  className={fish.bestMonths.includes(i + 1) ? 'on' : ''}
                  title={m}
                >
                  {m[0]}
                </span>
              ))}
            </div>

            <div className="chips">
              {fish.bestTimes.map((t) => (
                <span className="chip" key={t}>
                  🕐 {TIME_LABELS[t]}
                </span>
              ))}
            </div>

            <div className="chips" style={{ marginTop: 6 }}>
              {fish.baits.map((b) => (
                <span className="chip" key={b}>
                  🪱 {b}
                </span>
              ))}
            </div>

            {fish.minSize > 0 && (
              <div className="muted" style={{ marginTop: 8 }}>
                Mindestmaß (Richtwert): {fish.minSize} cm
              </div>
            )}

            <div className="tip">{fish.tips}</div>
          </div>
        ))}
      </div>

      <div className="note">
        ⚖️ Schonzeiten und Mindestmaße sind je nach Bundesland und Gewässer
        unterschiedlich. Prüfe immer die örtlichen Vorschriften und deinen
        gültigen Angelschein.
      </div>
    </div>
  )
}
