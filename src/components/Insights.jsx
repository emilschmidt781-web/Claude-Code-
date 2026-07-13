import { useMemo } from 'react'
import { useApp } from '../state.jsx'

function dayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10)
}

export default function Insights() {
  const { data } = useApp()

  const stats = useMemo(() => {
    const sessions = data.focusSessions
    const totalMin = sessions.reduce((s, x) => s + x.minutes, 0)
    const doneTasks = data.tasks.filter((t) => t.done).length

    // letzte 7 Tage Fokusminuten
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5)
      const key = d.toISOString().slice(0, 10)
      const min = sessions.filter((s) => dayKey(s.completedAt) === key).reduce((a, s) => a + s.minutes, 0)
      days.push({ key, min, label: d.toLocaleDateString('de-DE', { weekday: 'short' }) })
    }
    const maxMin = Math.max(30, ...days.map((d) => d.min))
    return { totalMin, doneTasks, sessions: sessions.length, days, maxMin }
  }, [data])

  return (
    <div>
      <div className="section-title">📈 Deine Einblicke</div>

      <div className="stat-row" style={{ marginBottom: 14 }}>
        <div className="stat"><div className="big">🔥 {data.streak.count}</div><div className="lbl">Tage-Streak</div></div>
        <div className="stat"><div className="big">{Math.round(stats.totalMin / 60 * 10) / 10}h</div><div className="lbl">Fokus gesamt</div></div>
        <div className="stat"><div className="big">{stats.doneTasks}</div><div className="lbl">Erledigt</div></div>
      </div>

      <div className="card">
        <h2>Fokus der letzten 7 Tage</h2>
        <p className="muted" style={{ marginBottom: 14 }}>Muster erkennen, ganz ohne Wertung – jeder Balken zählt.</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
          {stats.days.map((d) => (
            <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>{d.min || ''}</div>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(4, (d.min / stats.maxMin) * 100)}%`,
                  background: d.min ? 'linear-gradient(180deg, var(--primary), var(--accent))' : 'var(--bg-soft)',
                  borderRadius: 8,
                  transition: 'height 0.4s ease',
                }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Sanfte Erinnerung 💜</h2>
        <p className="muted">
          Zahlen sind hier zum Verstehen da, nicht zum Bewerten. Ein ruhiger Tag ist auch okay –
          du bist mehr als deine Produktivität.
        </p>
      </div>
    </div>
  )
}
