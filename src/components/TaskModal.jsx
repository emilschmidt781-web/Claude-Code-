import { useState } from 'react'
import { useApp } from '../state.jsx'
import { CATEGORIES, ENERGY } from '../lib/store.js'

// Modal zum Anlegen/Bearbeiten einer Aufgabe – inkl. Aufteilen in kleine Schritte.
export default function TaskModal({ task, onClose }) {
  const { addTask, updateTask, removeTask, setSteps } = useApp()
  const editing = !!task

  const [title, setTitle] = useState(task?.title || '')
  const [notes, setNotes] = useState(task?.notes || '')
  const [time, setTime] = useState(task?.time || '')
  const [duration, setDuration] = useState(task?.duration || 15)
  const [category, setCategory] = useState(task?.category || 'work')
  const [energy, setEnergy] = useState(task?.energy || 'med')
  const [priority, setPriority] = useState(task?.priority || false)
  const [stepInput, setStepInput] = useState('')
  const [steps, setLocalSteps] = useState(task?.steps?.map((s) => s.title) || [])

  function save() {
    if (!title.trim()) return
    const payload = { title, notes, time, duration, category, energy, priority }
    if (editing) {
      updateTask(task.id, payload)
      setSteps(task.id, steps)
    } else {
      addTask({ ...payload, steps: steps.map((t) => ({ id: Math.random().toString(36).slice(2), title: t, done: false })) })
    }
    onClose()
  }

  function addStep() {
    const v = stepInput.trim()
    if (!v) return
    setLocalSteps((s) => [...s, v])
    setStepInput('')
  }

  // Große Aufgabe automatisch in generische kleine Schritte zerlegen (gegen Overwhelm)
  function autoBreak() {
    if (!title.trim()) return
    const t = title.trim()
    setLocalSteps([
      `Alles bereitlegen für „${t}"`,
      `Die ersten 2 Minuten von „${t}" anfangen`,
      `Ein kleines Stück von „${t}" schaffen`,
      `Kurz prüfen & abschließen`,
    ])
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-grip" />
        <h2>{editing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</h2>

        <div className="field">
          <label>Was möchtest du tun?</label>
          <input className="input" value={title} autoFocus placeholder="z. B. Wäsche zusammenlegen"
            onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
        </div>

        <div className="field">
          <label>Kategorie</label>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`chip ${category === c.id ? 'selected' : ''}`} onClick={() => setCategory(c.id)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Wie viel Energie braucht das?</label>
          <div className="chips">
            {ENERGY.map((e) => (
              <button key={e.id} className={`chip ${energy === e.id ? 'selected' : ''}`} onClick={() => setEnergy(e.id)}>
                {e.emoji} {e.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Uhrzeit (optional)</label>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Dauer: {duration} Min</label>
            <input type="range" min="5" max="120" step="5" value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', marginTop: 14 }} />
          </div>
        </div>

        <div className="field">
          <button className={`chip ${priority ? 'selected' : ''}`} onClick={() => setPriority((p) => !p)}>
            ⭐ Wichtig
          </button>
        </div>

        <div className="field">
          <label>In kleine Schritte aufteilen (hilft gegen Overwhelm)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={stepInput} placeholder="kleiner Schritt…"
              onChange={(e) => setStepInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())} />
            <button className="btn" onClick={addStep}>＋</button>
          </div>
          <button className="btn ghost" style={{ marginTop: 8 }} onClick={autoBreak}>🪄 Automatisch zerlegen</button>
          {steps.length > 0 && (
            <div className="steps" style={{ marginTop: 8 }}>
              {steps.map((s, i) => (
                <div key={i} className="step">
                  <span className="sbox" />
                  <span style={{ flex: 1 }}>{s}</span>
                  <button className="icon-btn" onClick={() => setLocalSteps((arr) => arr.filter((_, j) => j !== i))} aria-label="Entfernen">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label>Notiz (optional)</label>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="alles, was hilft…" />
        </div>

        <button className="btn primary block lg" onClick={save} disabled={!title.trim()}>
          {editing ? 'Speichern' : 'Hinzufügen'}
        </button>
        {editing && (
          <button className="btn ghost block" style={{ marginTop: 8 }}
            onClick={() => { removeTask(task.id); onClose() }}>
            Aufgabe löschen
          </button>
        )}
      </div>
    </div>
  )
}
