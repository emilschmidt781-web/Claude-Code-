import { useState } from 'react'
import { useApp } from '../state.jsx'
import { CATEGORIES, ENERGY } from '../lib/store.js'
import { suggestPlan } from '../lib/buddy.js'
import TaskModal from './TaskModal.jsx'

function catOf(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]
}
function energyOf(id) {
  return ENERGY.find((e) => e.id === id) || ENERGY[1]
}

export default function TaskList() {
  const { data, toggleTask, removeTask, reorderTasks, toggleStep } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [plan, setPlan] = useState(null)

  const tasks = data.tasks
  const open = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)

  function runPlanner() {
    const p = suggestPlan(tasks)
    if (p.order.length) reorderTasks(p.order)
    setPlan(p)
  }

  function onDrop(targetId) {
    if (!dragId || dragId === targetId) return
    const ids = open.map((t) => t.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    reorderTasks(ids)
    setDragId(null)
  }

  function openEdit(t) {
    setEditTask(t)
    setModalOpen(true)
  }
  function openNew() {
    setEditTask(null)
    setModalOpen(true)
  }

  return (
    <div>
      <div className="section-title">✅ To-do · alles aus dem Kopf</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button className="btn primary" style={{ flex: 1 }} onClick={openNew}>＋ Aufgabe</button>
        <button className="btn" onClick={runPlanner} disabled={!open.length}>🪄 KI-Plan</button>
      </div>

      {plan && (
        <div className="help-note">
          <span>🦊</span>
          <span>{plan.note}</span>
        </div>
      )}

      {!open.length && !done.length && (
        <div className="empty">
          <div className="emo">🌱</div>
          <p>Noch nichts hier. Schreib alles auf, was dir im Kopf herumschwirrt – der Fuchs hilft dir beim Sortieren.</p>
        </div>
      )}

      {open.map((t) => {
        const c = catOf(t.category)
        const e = energyOf(t.energy)
        const stepsDone = t.steps?.filter((s) => s.done).length || 0
        return (
          <div
            key={t.id}
            className={`task ${dragId === t.id ? 'dragging' : ''}`}
            style={{ '--cat': c.color }}
            draggable
            onDragStart={() => setDragId(t.id)}
            onDragOver={(ev) => ev.preventDefault()}
            onDrop={() => onDrop(t.id)}
          >
            <button className="check" onClick={() => toggleTask(t.id)} aria-label="Erledigt">
              {t.done ? '✓' : ''}
            </button>
            <div className="task-body" onClick={() => openEdit(t)}>
              <div className="task-title">{t.title}</div>
              <div className="task-meta">
                <span className="tag">{c.emoji} {c.label}</span>
                <span className="tag">{e.emoji} {e.label}</span>
                {t.time && <span className="tag">🕐 {t.time}</span>}
                <span className="tag">⏱ {t.duration} Min</span>
                {t.priority && <span className="tag prio">⭐ Wichtig</span>}
              </div>
              {t.steps?.length > 0 && (
                <div className="steps">
                  {t.steps.map((s) => (
                    <div
                      key={s.id}
                      className={`step ${s.done ? 'done' : ''}`}
                      onClick={(ev) => { ev.stopPropagation(); toggleStep(t.id, s.id) }}
                    >
                      <span className={`sbox ${s.done ? 'on' : ''}`}>{s.done ? '✓' : ''}</span>
                      <span>{s.title}</span>
                    </div>
                  ))}
                  <div className="muted" style={{ fontSize: '0.72rem', marginTop: 2 }}>
                    {stepsDone}/{t.steps.length} Schritte
                  </div>
                </div>
              )}
            </div>
            <span className="drag-handle" title="Ziehen zum Sortieren">⠿</span>
          </div>
        )
      })}

      {done.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 18 }}>Erledigt · {done.length} 🎉</div>
          {done.map((t) => {
            const c = catOf(t.category)
            return (
              <div key={t.id} className="task done" style={{ '--cat': c.color }}>
                <button className="check on" onClick={() => toggleTask(t.id)} aria-label="Wieder öffnen">✓</button>
                <div className="task-body">
                  <div className="task-title">{t.title}</div>
                </div>
                <button className="icon-btn" onClick={() => removeTask(t.id)} aria-label="Löschen">🗑</button>
              </div>
            )
          })}
        </>
      )}

      {modalOpen && (
        <TaskModal
          task={editTask}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
