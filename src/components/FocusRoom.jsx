import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state.jsx'
import { buddyMessage } from '../lib/buddy.js'
import Buddy from './Buddy.jsx'
import { celebrate } from './Confetti.jsx'

const DURATIONS = [
  { min: 5, label: 'Mini' },
  { min: 15, label: 'Kurz' },
  { min: 25, label: 'Pomo' },
  { min: 45, label: 'Tief' },
]

const SCENES = {
  scene_forest: { emoji: '🌲', name: 'Wald' },
  scene_cafe: { emoji: '☕', name: 'Café' },
  scene_space: { emoji: '🌌', name: 'Weltall' },
  scene_rain: { emoji: '🌧️', name: 'Regen' },
}

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function FocusRoom() {
  const { data, completeFocus } = useApp()
  const openTasks = data.tasks.filter((t) => !t.done)

  const [taskId, setTaskId] = useState(null)
  const [minutes, setMinutes] = useState(25)
  const [phase, setPhase] = useState('setup') // setup | running | paused | done
  const [remaining, setRemaining] = useState(25 * 60)
  const [msg, setMsg] = useState('')
  const [reward, setReward] = useState(null)
  const tickRef = useRef(null)

  const total = minutes * 60
  const scene = data.equipped.scene ? SCENES[data.equipped.scene] : null
  const hatId = data.equipped.buddy

  const task = openTasks.find((t) => t.id === taskId) || null

  // Ring-Geometrie
  const R = 100
  const C = 2 * Math.PI * R
  const progress = phase === 'setup' ? 0 : 1 - remaining / total
  const offset = C * (1 - progress)

  // Timer
  useEffect(() => {
    if (phase !== 'running') return
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(tickRef.current)
          finish()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Buddy-Nachrichten je nach Fortschritt
  useEffect(() => {
    if (phase === 'setup' || phase === 'done') return
    const p = remaining / total
    let ph = 'mid'
    if (p > 0.85) ph = 'start'
    else if (p < 0.18) ph = 'almost'
    // alle ~45s eine neue Nachricht, plus bei Phasenwechsel
    const seed = Math.floor(remaining / 45)
    setMsg(buddyMessage(ph, seed))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(remaining / 45), phase])

  function start() {
    setRemaining(minutes * 60)
    setPhase('running')
    setMsg(buddyMessage('start'))
  }

  function finish() {
    setPhase('done')
    const coins = Math.max(5, Math.round(minutes * 0.8))
    const xp = Math.max(10, Math.round(minutes * 1.2))
    completeFocus({ minutes, taskId })
    setReward({ coins, xp })
    setMsg(buddyMessage('done'))
    celebrate()
  }

  function cancel() {
    clearInterval(tickRef.current)
    setPhase('setup')
    setRemaining(minutes * 60)
    setMsg(buddyMessage('cancel'))
  }

  function reset() {
    setPhase('setup')
    setReward(null)
    setRemaining(minutes * 60)
    setMsg('')
  }

  function pickMinutes(m) {
    setMinutes(m)
    setRemaining(m * 60)
  }

  // ---------- SETUP ----------
  if (phase === 'setup') {
    return (
      <div>
        <div className="section-title">🧑‍🤝‍🧑 Fokusraum · Body-Doubling</div>
        <div className="help-note">
          <span>🦊</span>
          <span>Der Fuchs setzt sich neben dich und macht mit. Du bist nicht allein – einfach anfangen, klein ist genug.</span>
        </div>

        <div className="card">
          <div className="field">
            <label>Woran arbeitest du? (optional)</label>
            {openTasks.length ? (
              <select className="input" value={taskId || ''} onChange={(e) => setTaskId(e.target.value || null)}>
                <option value="">Freies Fokussieren</option>
                {openTasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            ) : (
              <p className="muted">Noch keine offenen Aufgaben – du kannst auch einfach frei fokussieren.</p>
            )}
          </div>

          <div className="field">
            <label>Wie lange bleiben wir dran?</label>
            <div className="duration-grid">
              {DURATIONS.map((d) => (
                <button
                  key={d.min}
                  className={`chip ${minutes === d.min ? 'selected' : ''}`}
                  onClick={() => pickMinutes(d.min)}
                >
                  <b>{d.min}</b>
                  <span style={{ fontSize: '0.7rem' }}>{d.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <input
                type="range" min="1" max="90" value={minutes}
                onChange={(e) => pickMinutes(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 700, minWidth: 62, textAlign: 'right' }}>{minutes} Min</span>
            </div>
          </div>

          <button className="btn primary block lg" onClick={start}>
            🦊 Zusammen loslegen
          </button>
        </div>
      </div>
    )
  }

  // ---------- DONE ----------
  if (phase === 'done') {
    return (
      <div>
        <div className="section-title">🎉 Geschafft</div>
        <div className="focus-stage">
          <Buddy hatId={hatId} size="lg" />
          <div className="buddy-speech" style={{ marginTop: 16 }}>{msg}</div>
          <div className="stat-row" style={{ marginTop: 18 }}>
            <div className="stat"><div className="big">{minutes}</div><div className="lbl">Minuten Fokus</div></div>
            <div className="stat"><div className="big coin">+{reward?.coins} 🪙</div><div className="lbl">Münzen</div></div>
            <div className="stat"><div className="big">+{reward?.xp}</div><div className="lbl">XP</div></div>
          </div>
          {task && (
            <p className="muted" style={{ marginTop: 14 }}>
              An „{task.title}" gearbeitet. In der To-do-Liste kannst du sie abhaken. ✅
            </p>
          )}
        </div>
        <button className="btn primary block lg" style={{ marginTop: 14 }} onClick={reset}>
          Noch eine Runde 🔁
        </button>
      </div>
    )
  }

  // ---------- RUNNING / PAUSED ----------
  return (
    <div>
      <div className="section-title">🧑‍🤝‍🧑 Gemeinsam im Fokus</div>
      <div className="focus-stage">
        {scene && <span className="focus-scene-emoji" style={{ top: 14, right: 16 }} aria-hidden="true">{scene.emoji}</span>}
        {scene && <span className="focus-scene-emoji" style={{ bottom: 14, left: 16 }} aria-hidden="true">{scene.emoji}</span>}

        <div className="ring-wrap">
          <svg width="230" height="230" viewBox="0 0 230 230">
            <circle className="ring-bg" cx="115" cy="115" r={R} />
            <circle
              className="ring-fg" cx="115" cy="115" r={R}
              strokeDasharray={C} strokeDashoffset={offset}
              style={{ stroke: phase === 'paused' ? 'var(--warn)' : 'var(--primary)' }}
            />
          </svg>
          <div className="ring-center">
            <div className="ring-time">{fmt(remaining)}</div>
            <div className="ring-label">{task ? task.title : 'Freier Fokus'}</div>
          </div>
        </div>

        <Buddy breathing={phase === 'running'} hatId={hatId} />
        <div className="buddy-speech">{msg}</div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center' }}>
          {phase === 'running' ? (
            <button className="btn" onClick={() => setPhase('paused')}>⏸ Pause</button>
          ) : (
            <button className="btn primary" onClick={() => setPhase('running')}>▶ Weiter</button>
          )}
          <button className="btn ghost" onClick={cancel}>Beenden</button>
        </div>
      </div>
      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        Abgelenkt? Ganz normal. Komm einfach sanft zurück – der Fuchs wartet. 🦊
      </p>
    </div>
  )
}
