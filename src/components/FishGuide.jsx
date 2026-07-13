import { FISHES, MONTH_LABELS, TIME_LABELS } from '../data/fishes.js'

export default function FishGuide() {
  return (
    <div className="card">
      <h2>📖 Fisch-Guide</h2>
      <p className="muted">Wo, wann und womit – für heimische Arten.</p>

      <div className="fish-grid">
        {FISHES.map((fish) => (
          <div className="fish-card" key={fish.id}>
            <div className="head">
              <span className="emoji">{fish.emoji}</span>
              <h3>{fish.name}</h3>
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
              <span className="chip">🕐 {fish.bestTimes.map((t) => TIME_LABELS[t]).join(', ')}</span>
            </div>
            <div className="chips" style={{ marginTop: 6 }}>
              {fish.baits.slice(0, 3).map((b) => (
                <span className="chip" key={b}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
