import { useApp } from '../state.jsx'
import { REWARDS } from '../lib/store.js'
import Buddy from './Buddy.jsx'

const TYPE_LABELS = {
  scene: '🌆 Fokusräume',
  buddy: '🎩 Für den Fuchs',
  theme: '🎨 Farbthemen',
}

export default function Rewards() {
  const { data, level, buyReward, equipReward } = useApp()

  const byType = REWARDS.reduce((acc, r) => {
    ;(acc[r.type] ||= []).push(r)
    return acc
  }, {})

  return (
    <div>
      <div className="section-title">🎁 Belohnungen</div>

      <div className="card" style={{ textAlign: 'center' }}>
        <Buddy hatId={data.equipped.buddy} size="md" />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }}>
          <div><div style={{ fontSize: '1.4rem', fontWeight: 800 }} className="coin">{data.coins} 🪙</div><div className="lbl muted">Münzen</div></div>
          <div><div style={{ fontSize: '1.4rem', fontWeight: 800 }}>Lv {level.level}</div><div className="lbl muted">{level.intoLevel}/{level.need} XP</div></div>
        </div>
        <div className="xp-bar"><div style={{ width: `${Math.round((level.intoLevel / level.need) * 100)}%` }} /></div>
        <p className="muted" style={{ marginTop: 10, fontSize: '0.82rem' }}>
          Münzen verdienst du mit Fokus-Runden und erledigten Aufgaben. Alles hier ist zum Spaß – kein Druck. 💜
        </p>
      </div>

      {Object.entries(byType).map(([type, items]) => (
        <div key={type}>
          <div className="section-title">{TYPE_LABELS[type]}</div>
          <div className="reward-grid">
            {items.map((r) => {
              const owned = data.ownedRewards.includes(r.id)
              const equipped = data.equipped[r.type] === r.id
              const canAfford = data.coins >= r.cost
              return (
                <div key={r.id} className={`reward ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`}>
                  <div className="emo">{r.emoji}</div>
                  <div className="name">{r.label}</div>
                  {owned ? (
                    <button className="btn block" onClick={() => equipReward(r.id)}>
                      {equipped ? '✓ Aktiv' : 'Anlegen'}
                    </button>
                  ) : (
                    <button className="btn primary block" disabled={!canAfford} onClick={() => buyReward(r.id)}>
                      {r.cost} 🪙
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
