import { useMemo } from 'react'
import { useApp } from '../state.jsx'
import { CATEGORIES } from '../lib/store.js'

function catOf(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]
}

// Farbe leicht aufhellen für lesbaren Block-Hintergrund
function tint(hex) {
  return hex + '33'
}

export default function DayPlanner() {
  const { data, profile, toggleTask } = useApp()

  const scheduled = data.tasks.filter((t) => t.time && !t.done).sort((a, b) => a.time.localeCompare(b.time))
  const flexible = data.tasks.filter((t) => !t.time && !t.done)

  // Stundenbereich: von der frühesten Aufgabe (min 6) bis spätesten (max 22)
  const hours = useMemo(() => {
    let start = 8
    let end = 20
    if (scheduled.length) {
      const times = scheduled.map((t) => Number(t.time.slice(0, 2)))
      start = Math.min(start, ...times)
      end = Math.max(end, ...times.map((h) => h + 1))
    }
    start = Math.max(0, Math.min(start, 22))
    end = Math.min(24, Math.max(end, start + 4))
    return Array.from({ length: end - start }, (_, i) => start + i)
  }, [scheduled])

  const now = new Date()
  const nowLabel = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  const curHour = now.getHours()

  return (
    <div>
      <div className="section-title">📅 Tagesplan · {nowLabel}</div>

      {!scheduled.length && !flexible.length && (
        <div className="empty">
          <div className="emo">☀️</div>
          <p>Dein Tag ist frei. Leg unter „To-do" Aufgaben an – die mit Uhrzeit erscheinen hier auf der Zeitleiste.</p>
        </div>
      )}

      {(scheduled.length > 0) && (
        <div className="card">
          <div className="timeline">
            {hours.map((h) => {
              const inHour = scheduled.filter((t) => Number(t.time.slice(0, 2)) === h)
              return (
                <div className="tl-row" key={h}>
                  <div className="tl-hour" style={h === curHour ? { color: 'var(--primary)', fontWeight: 700 } : undefined}>
                    {String(h).padStart(2, '0')}:00
                  </div>
                  <div className="tl-track" style={h === curHour ? { borderColor: 'var(--primary)' } : undefined}>
                    {inHour.map((t) => {
                      const c = catOf(t.category)
                      return (
                        <div
                          key={t.id}
                          className="tl-block"
                          style={{ background: tint(c.color), border: `1px solid ${c.color}` }}
                          onClick={() => toggleTask(t.id)}
                          title="Antippen zum Abhaken"
                        >
                          <span>{c.emoji}</span>
                          <span style={{ flex: 1 }}>{t.title}</span>
                          <small>{t.time} · {t.duration}′</small>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {flexible.length > 0 && (
        <>
          <div className="section-title">🕊️ Wann immer es passt</div>
          <div className="card" style={{ padding: 12 }}>
            {flexible.map((t) => {
              const c = catOf(t.category)
              return (
                <div
                  key={t.id}
                  className="tl-block"
                  style={{ background: tint(c.color), border: `1px solid ${c.color}`, marginBottom: 8 }}
                  onClick={() => toggleTask(t.id)}
                >
                  <span>{c.emoji}</span>
                  <span style={{ flex: 1 }}>{t.title}</span>
                  <small>{t.duration}′</small>
                </div>
              )
            })}
            <p className="muted" style={{ margin: '4px 2px 0', fontSize: '0.78rem' }}>
              Kein Zeitdruck – erledige diese, wann es sich für dich richtig anfühlt.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
