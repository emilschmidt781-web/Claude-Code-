import { useEffect, useRef, useState } from 'react'
import { analyzeImage, loadModel } from '../lib/recognition.js'
import { classifyWithClaude, fileToResizedDataUrl, CLOUD_MODELS } from '../lib/cloud.js'
import { FISHES } from '../data/fishes.js'

const CLOUD_KEY = 'angel-app.cloud'

function loadCloudCfg() {
  try {
    const raw = localStorage.getItem(CLOUD_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { enabled: false, apiKey: '', model: 'claude-opus-4-8' }
}

export default function FishRecognition() {
  const [preview, setPreview] = useState(null)
  const [onDevice, setOnDevice] = useState(null) // Ergebnis der Geräte-KI
  const [cloud, setCloud] = useState(null) // Ergebnis der Cloud-KI
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modelState, setModelState] = useState('idle')
  const [drag, setDrag] = useState(false)
  const [cfg, setCfg] = useState(loadCloudCfg)
  const [showSettings, setShowSettings] = useState(false)
  const inputRef = useRef(null)

  const cloudActive = cfg.enabled && cfg.apiKey.trim().length > 0

  useEffect(() => {
    localStorage.setItem(CLOUD_KEY, JSON.stringify(cfg))
  }, [cfg])

  // Geräte-Modell nur vorladen, wenn die Cloud NICHT aktiv ist.
  useEffect(() => {
    if (cloudActive) return
    let active = true
    setModelState('loading')
    loadModel()
      .then(() => active && setModelState('ready'))
      .catch(() => active && setModelState('failed'))
    return () => {
      active = false
    }
  }, [cloudActive])

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setLoading(true)
    setOnDevice(null)
    setCloud(null)
    setError(null)
    setPreview(URL.createObjectURL(file))
    try {
      if (cloudActive) {
        const dataUrl = await fileToResizedDataUrl(file)
        const res = await classifyWithClaude({
          imageDataUrl: dataUrl,
          apiKey: cfg.apiKey.trim(),
          model: cfg.model,
        })
        setCloud(res)
      } else {
        setOnDevice(await analyzeImage(file))
      }
    } catch (e) {
      console.error(e)
      setError(e.message || 'Analyse fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPreview(null)
    setOnDevice(null)
    setCloud(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const top = onDevice?.matches?.[0] || null

  return (
    <div className="card">
      <h2>📷 Fischerkennung</h2>
      <p className="muted">Foto vom Fang hochladen – die KI erkennt die Art.</p>

      {/* KI-Status */}
      {cloudActive ? (
        <div className="ai-badge" data-state="cloud">
          ☁️ Cloud-KI aktiv (Claude) – erkennt praktisch jeden Fisch
        </div>
      ) : (
        <div className="ai-badge" data-state={modelState}>
          {modelState === 'loading' && '🧠 KI-Modell wird geladen …'}
          {modelState === 'ready' && '🧠 Geräte-KI aktiv (kennt ~18 Fischtypen)'}
          {modelState === 'failed' && '📴 Offline-Analyse (KI nicht erreichbar)'}
          {modelState === 'idle' && '🧠 Geräte-KI'}
        </div>
      )}

      <button
        className="link-btn"
        onClick={() => setShowSettings((s) => !s)}
        aria-expanded={showSettings}
      >
        ⚙️ Cloud-KI einrichten (jeden Fisch erkennen) {showSettings ? '▲' : '▼'}
      </button>

      {showSettings && <CloudSettings cfg={cfg} setCfg={setCfg} />}

      {!preview && (
        <div
          className={`dropzone ${drag ? 'drag' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
        >
          <div className="emoji">🎣</div>
          <p>
            <strong>Foto hierher ziehen</strong> oder klicken zum Auswählen
          </p>
          <p className="muted">JPG, PNG · Kamera oder Galerie</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview && (
        <div className="preview-wrap">
          <img src={preview} alt="Hochgeladener Fisch" />
          <div className="results">
            {loading && (
              <p className="muted">
                🔍 {cloudActive ? 'Cloud-KI analysiert …' : 'KI analysiert das Bild …'}
              </p>
            )}

            {!loading && error && (
              <p className="error-msg">⚠️ {error}</p>
            )}

            {!loading && cloud && <CloudResult res={cloud} />}

            {!loading && top && (
              <>
                <div className="result-row top-hit">
                  <span className="fish-emoji">{top.fish.emoji}</span>
                  <div className="fish-name">
                    <strong>
                      {top.fish.name} · {top.percent}%
                    </strong>
                    <small>{top.fish.latin}</small>
                  </div>
                </div>
                {onDevice.matches.slice(1, 5).map((m) => (
                  <div className="result-row" key={m.fish.id}>
                    <span className="fish-emoji">{m.fish.emoji}</span>
                    <div className="fish-name">
                      {m.fish.name}
                      <div className="bar">
                        <span style={{ width: `${m.percent}%` }} />
                      </div>
                    </div>
                    <span className="pct">{m.percent}%</span>
                  </div>
                ))}
                <div className="tip">💡 {top.fish.tips}</div>
              </>
            )}

            <button className="btn secondary" style={{ marginTop: 14 }} onClick={reset}>
              Neues Foto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CloudResult({ res }) {
  const known = FISHES.find(
    (f) => f.name.toLowerCase() === (res.art || '').toLowerCase()
  )
  if (!res.istFisch) {
    return (
      <div>
        <p className="muted">🤔 Kein Fisch klar erkennbar.</p>
        {res.beschreibung && <p className="muted">{res.beschreibung}</p>}
      </div>
    )
  }
  return (
    <div>
      <div className="result-row top-hit">
        <span className="fish-emoji">{known ? known.emoji : '🐟'}</span>
        <div className="fish-name">
          <strong>
            {res.art}
            {res.konfidenz !== null ? ` · ${res.konfidenz}%` : ''}
          </strong>
          {res.lateinisch && <small>{res.lateinisch}</small>}
        </div>
      </div>
      <div className="chips" style={{ margin: '10px 0' }}>
        {res.wasser && res.wasser !== 'unbekannt' && (
          <span className="chip">💧 {res.wasser}</span>
        )}
      </div>
      {res.beschreibung && <p className="muted">{res.beschreibung}</p>}
      {res.alternativen.length > 0 && (
        <p className="muted" style={{ fontSize: '0.82rem' }}>
          Auch möglich: {res.alternativen.join(', ')}
        </p>
      )}
      {res.tipp && <div className="tip">💡 {res.tipp}</div>}
    </div>
  )
}

function CloudSettings({ cfg, setCfg }) {
  return (
    <div className="cloud-settings">
      <label className="switch-row">
        <input
          type="checkbox"
          checked={cfg.enabled}
          onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })}
        />
        Cloud-KI verwenden (Claude Vision)
      </label>

      <div className="field" style={{ marginTop: 12 }}>
        <label>Dein Anthropic API-Schlüssel</label>
        <input
          type="password"
          value={cfg.apiKey}
          placeholder="sk-ant-…"
          autoComplete="off"
          onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Modell</label>
        <select
          value={cfg.model}
          onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
        >
          {CLOUD_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <p className="muted" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
        🔒 Der Schlüssel bleibt nur auf diesem Gerät (localStorage) und wird
        ausschließlich an api.anthropic.com gesendet. Schlüssel erstellen unter{' '}
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
          console.anthropic.com
        </a>
        . Pro Scan fallen kleine Kosten an; das Foto verlässt dein Gerät.
      </p>
    </div>
  )
}
