import { REWARDS } from '../lib/store.js'

// Der Fokus-Fuchs als Body-Doubling-Kumpel.
// `breathing` lässt ihn ruhig atmen (Fokus läuft), `hatId` setzt einen Hut auf.
export default function Buddy({ breathing = false, hatId = null, size = 'md' }) {
  const hat = REWARDS.find((r) => r.id === hatId && r.type === 'buddy')
  const fontSize = size === 'lg' ? '5rem' : size === 'sm' ? '2.6rem' : '4rem'
  return (
    <div className={`buddy ${breathing ? 'breathing' : ''}`} style={{ height: 'auto' }}>
      {hat && <span className="hat" aria-hidden="true">{hat.emoji}</span>}
      <span className="fox" style={{ fontSize }} role="img" aria-label="Fokus-Fuchs">🦊</span>
    </div>
  )
}
