import { useMemo, useState } from 'react'
import { biteForecast, hourlyForecast } from '../lib/solunar.js'
import { FISHES } from '../data/fishes.js'

function toLocalInputValue(date) {
  const off = date.getTimezoneOffset()
  const local = new Date(date.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

export default function BiteForecast() {
  const [when, setWhen] = useState(() => toLocalInputValue(new Date()))
  const [fishId, setFishId] = useState('')
  const [pressureTrend, setPressureTrend] = useState('stabil')
  const [clouds, setClouds] = useState('leicht')
  const [wind, setWind] = useState('leicht')

  const weather = { pressureTrend, clouds, wind }
  const fish = FISHES.find((f) => f.id === fishId) || null
  const date = useMemo(() => new Date(when), [when])

  const forecast = useMemo(
    () => biteForecast({ date, weather, fish }),
    [date, pressureTrend, clouds, wind, fishId]
  )

  const hourly = useMemo(
    () => hourlyForecast({ baseDate: date, weather, fish, hours: 24 }),
    [date, pressureTrend, clouds, wind, fishId]
  )

  return (
    <div className="card">
      <h2>🕐 Beißprognose – wann angeln?</h2>
      <p className="muted">
        Berechnet aus Mondphase (Solunar), Tageszeit, Jahreszeit und Wetter, wie
        gut die Chancen stehen.
      </p>

      <div className="grid-2">
        <div className="field">
          <label>Zeitpunkt</label>
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Zielfisch (optional)</label>
          <select value={fishId} onChange={(e) => setFishId(e.target.value)}>
            <option value="">Allgemein</option>
            {FISHES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.emoji} {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Luftdruck-Tendenz</label>
          <select
            value={pressureTrend}
            onChange={(e) => setPressureTrend(e.target.value)}
          >
            <option value="fallend">Fallend (Wetterwechsel) 📉</option>
            <option value="stabil">Stabil</option>
            <option value="steigend">Steigend 📈</option>
          </select>
        </div>
        <div className="field">
          <label>Bewölkung</label>
          <select value={clouds} onChange={(e) => setClouds(e.target.value)}>
            <option value="klar">Klar / Sonne</option>
            <option value="leicht">Leicht bewölkt</option>
            <option value="bewoelkt">Stark bewölkt</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Wind</label>
        <select value={wind} onChange={(e) => setWind(e.target.value)}>
          <option value="windstill">Windstill</option>
          <option value="leicht">Leichte Brise</option>
          <option value="stark">Stark / Sturm</option>
        </select>
      </div>

      {/* Gauge */}
      <div className="gauge">
        <div className="score" style={{ color: forecast.rating.color }}>
          {forecast.percent}
        </div>
        <div className="rating" style={{ color: forecast.rating.color }}>
          {forecast.rating.emoji} {forecast.rating.label}
        </div>
        <div className="muted">
          {forecast.moon.emoji} {forecast.moon.name}
        </div>
      </div>

      <div className="factors">
        <Factor label="Mond (Solunar)" value={forecast.factors.mond} />
        <Factor label="Tageszeit" value={forecast.factors.tageszeit} />
        <Factor label="Wetter" value={forecast.factors.wetter} />
        {forecast.factors.saison !== undefined && (
          <Factor label="Saison" value={forecast.factors.saison} />
        )}
      </div>

      {/* 24h-Verlauf */}
      <h3 style={{ marginTop: 22, fontSize: '1rem' }}>Nächste 24 Stunden</h3>
      <div className="hourly">
        {hourly.map((h, i) => (
          <div className="hbar" key={i} title={`${h.hour}:00 – ${h.percent}%`}>
            <div className="track">
              <div
                className="fill"
                style={{
                  height: `${h.percent}%`,
                  background: h.rating.color,
                }}
              />
            </div>
            <div className="h">{String(h.hour).padStart(2, '0')}</div>
          </div>
        ))}
      </div>

      {fish && (
        <div className="tip" style={{ marginTop: 16 }}>
          💡 {fish.name}: {fish.tips}
        </div>
      )}
    </div>
  )
}

function Factor({ label, value }) {
  return (
    <div className="factor">
      <div className="label">{label}</div>
      <div className="val">{Math.round(value * 100)}%</div>
      <div className="bar">
        <span style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  )
}
