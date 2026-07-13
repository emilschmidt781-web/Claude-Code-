import { useEffect, useState } from 'react'
import { FISHES } from '../data/fishes.js'

const STORAGE_KEY = 'angel-app.spots'

function loadSpots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function SpotManager() {
  const [spots, setSpots] = useState(loadSpots)
  const [name, setName] = useState('')
  const [water, setWater] = useState('')
  const [targetFish, setTargetFish] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
  }, [spots])

  function addSpot(e) {
    e.preventDefault()
    if (!name.trim()) return
    const spot = {
      id: Date.now(),
      name: name.trim(),
      water: water.trim(),
      targetFish,
      notes: notes.trim(),
      created: new Date().toISOString(),
    }
    setSpots([spot, ...spots])
    setName('')
    setWater('')
    setTargetFish('')
    setNotes('')
  }

  function removeSpot(id) {
    setSpots(spots.filter((s) => s.id !== id))
  }

  return (
    <div className="card">
      <h2>📍 Meine Angelplätze</h2>
      <p className="muted">
        Speichere deine besten Spots mit Gewässer, Zielfisch und Notizen. Alles
        bleibt lokal auf deinem Gerät.
      </p>

      <form onSubmit={addSpot}>
        <div className="grid-2">
          <div className="field">
            <label>Name des Platzes *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Alte Brücke Nordufer"
            />
          </div>
          <div className="field">
            <label>Gewässer</label>
            <input
              type="text"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              placeholder="z.B. Rheinaltarm"
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Zielfisch</label>
            <select
              value={targetFish}
              onChange={(e) => setTargetFish(e.target.value)}
            >
              <option value="">–</option>
              {FISHES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.emoji} {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Notizen</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tiefe, Köder, Uhrzeit …"
            />
          </div>
        </div>
        <button className="btn" type="submit">
          ➕ Platz speichern
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        {spots.length === 0 ? (
          <div className="empty">
            Noch keine Plätze gespeichert. Lege deinen ersten Spot an! 🎣
          </div>
        ) : (
          spots.map((s) => {
            const fish = FISHES.find((f) => f.id === s.targetFish)
            return (
              <div className="spot" key={s.id}>
                <span style={{ fontSize: '1.5rem' }}>
                  {fish ? fish.emoji : '📍'}
                </span>
                <div className="info">
                  <strong>{s.name}</strong>
                  <span className="muted">
                    {[s.water, fish?.name].filter(Boolean).join(' · ')}
                  </span>
                  {s.notes && (
                    <div style={{ marginTop: 4, fontSize: '0.9rem' }}>
                      {s.notes}
                    </div>
                  )}
                </div>
                <button
                  className="del"
                  onClick={() => removeSpot(s.id)}
                  title="Platz löschen"
                  aria-label="Platz löschen"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
