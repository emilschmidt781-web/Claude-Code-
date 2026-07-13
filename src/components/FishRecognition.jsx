import { useEffect, useRef, useState } from 'react'
import { analyzeImage, loadModel } from '../lib/recognition.js'

export default function FishRecognition() {
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null) // { matches, usedModel, raw, fishness }
  const [loading, setLoading] = useState(false)
  const [modelState, setModelState] = useState('idle') // idle | loading | ready | failed
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  // KI-Modell schon beim Öffnen im Hintergrund laden, damit der erste Scan
  // schneller ist.
  useEffect(() => {
    let active = true
    setModelState('loading')
    loadModel()
      .then(() => active && setModelState('ready'))
      .catch(() => active && setModelState('failed'))
    return () => {
      active = false
    }
  }, [])

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setLoading(true)
    setResult(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    try {
      const res = await analyzeImage(file)
      setResult(res)
    } catch (e) {
      console.error(e)
      setResult({ matches: [], usedModel: false, raw: null, fishness: null })
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const matches = result?.matches || []
  const top = matches.length ? matches[0] : null
  const noFish =
    result?.usedModel && result.fishness !== null && result.fishness < 0.05

  return (
    <div className="card">
      <h2>📷 Fischerkennung</h2>
      <p className="muted">Foto vom Fang hochladen – die KI erkennt die Art.</p>

      <div className="ai-badge" data-state={modelState}>
        {modelState === 'loading' && '🧠 KI-Modell wird geladen …'}
        {modelState === 'ready' && '🧠 KI aktiv (MobileNet, läuft im Gerät)'}
        {modelState === 'failed' && '📴 Offline-Analyse (KI nicht erreichbar)'}
      </div>

      {!preview && (
        <div
          className={`dropzone ${drag ? 'drag' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
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
            {loading && <p className="muted">🔍 KI analysiert das Bild …</p>}

            {!loading && noFish && (
              <p className="muted">
                🤔 Auf dem Bild ist wohl kein Fisch klar erkennbar. Der beste
                Tipp ist trotzdem:
              </p>
            )}

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
                {matches.slice(1, 5).map((m) => (
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

                {result.usedModel && result.raw?.length > 0 && (
                  <p className="raw-detect">
                    KI erkennt im Bild:{' '}
                    {result.raw
                      .map((r) => `${r.label} (${Math.round(r.prob * 100)}%)`)
                      .join(', ')}
                  </p>
                )}

                <div className="tip">💡 {top.fish.tips}</div>
              </>
            )}

            {!loading && matches.length === 0 && (
              <p className="muted">
                Konnte kein Motiv erkennen. Versuche ein Foto mit klarerem
                Hintergrund.
              </p>
            )}

            <button
              className="btn secondary"
              style={{ marginTop: 14 }}
              onClick={() => {
                setPreview(null)
                setResult(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              Neues Foto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
