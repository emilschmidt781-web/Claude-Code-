import { useState } from 'react'
import { useApp } from '../state.jsx'
import { AVATARS, PROFILE_COLORS } from '../lib/store.js'

export default function Onboarding() {
  const { finishOnboarding } = useApp()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦊')
  const [color, setColor] = useState(PROFILE_COLORS[0])

  return (
    <div className="onboard">
      <div className="hero">🦊</div>
      <h1 style={{ margin: '6px 0 2px' }}>Willkommen bei Fokusfuchs</h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        Dein ruhiger Planer mit einem Fuchs, der beim Fokussieren neben dir sitzt.
        Du machst nie allein – und ganz in deinem Tempo.
      </p>

      <div className="card" style={{ textAlign: 'left' }}>
        <div className="field">
          <label>Wie dürfen wir dich nennen?</label>
          <input className="input" value={name} placeholder="Dein Name" autoFocus
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && finishOnboarding(name, avatar, color)} />
        </div>

        <div className="field">
          <label>Wähl dein Symbol</label>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button key={a} className={`avatar-pick ${avatar === a ? 'on' : ''}`} onClick={() => setAvatar(a)}>{a}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Lieblingsfarbe</label>
          <div className="color-row">
            {PROFILE_COLORS.map((c) => (
              <button key={c} className={`color-dot ${color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="Farbe" />
            ))}
          </div>
        </div>
      </div>

      <button className="btn primary block lg" onClick={() => finishOnboarding(name || 'Ich', avatar, color)}>
        Los geht’s 🌿
      </button>
      <p className="muted" style={{ marginTop: 14, fontSize: '0.78rem' }}>
        Alles bleibt nur auf deinem Gerät. Werbefrei. Kein Konto nötig.
      </p>
    </div>
  )
}
