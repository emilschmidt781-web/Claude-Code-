import { useState } from 'react'
import { useApp } from '../state.jsx'
import { AVATARS, PROFILE_COLORS } from '../lib/store.js'

// Profilverwaltung: bis zu 5 Profile mit der Familie teilen (alle lokal).
export default function ProfileSheet({ onClose }) {
  const { profiles, profile, switchProfile, addProfile, updateProfile, removeProfile } = useApp()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🐨')
  const [color, setColor] = useState(PROFILE_COLORS[2])

  function create() {
    if (!name.trim()) return
    addProfile({ name: name.trim(), avatar, color })
    setAdding(false)
    setName('')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-grip" />
        <h2>Profile</h2>
        <p className="muted" style={{ marginBottom: 14 }}>Bis zu 5 Profile – z. B. für die Familie. Jedes hat eigene Aufgaben, Münzen und Streaks.</p>

        {profiles.map((p) => (
          <div key={p.id} className="task" style={{ '--cat': p.color, cursor: 'pointer' }}>
            <div className="check on" style={{ background: p.color, borderColor: p.color, opacity: p.id === profile.id ? 1 : 0.25 }}>
              {p.id === profile.id ? '✓' : ''}
            </div>
            <div className="task-body" onClick={() => { switchProfile(p.id); onClose() }}>
              <div className="task-title">{p.avatar} {p.name}</div>
              {p.id === profile.id && <div className="task-meta"><span className="tag">aktiv</span></div>}
            </div>
            {profiles.length > 1 && (
              <button className="icon-btn" onClick={() => removeProfile(p.id)} aria-label="Profil löschen">🗑</button>
            )}
          </div>
        ))}

        {adding ? (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Name</label>
              <input className="input" value={name} autoFocus placeholder="z. B. Mia" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Symbol</label>
              <div className="avatar-grid">
                {AVATARS.map((a) => (
                  <button key={a} className={`avatar-pick ${avatar === a ? 'on' : ''}`} onClick={() => setAvatar(a)}>{a}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Farbe</label>
              <div className="color-row">
                {PROFILE_COLORS.map((c) => (
                  <button key={c} className={`color-dot ${color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="Farbe" />
                ))}
              </div>
            </div>
            <button className="btn primary block" onClick={create} disabled={!name.trim()}>Profil erstellen</button>
            <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => setAdding(false)}>Abbrechen</button>
          </div>
        ) : (
          profiles.length < 5 && (
            <button className="btn block" style={{ marginTop: 12 }} onClick={() => setAdding(true)}>＋ Profil hinzufügen</button>
          )
        )}
      </div>
    </div>
  )
}
