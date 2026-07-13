import { useRef, useState } from 'react'
import { analyzeImage } from '../lib/recognition.js'

export default function FishRecognition() {
  const [preview, setPreview] = useState(null)
  const [matches, setMatches] = useState(null)
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setLoading(true)
    setMatches(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    try {
      const { matches } = await analyzeImage(file)
      // Kleine Kunstpause, damit die "Analyse" spürbar ist.
      await new Promise((r) => setTimeout(r, 350))
      setMatches(matches)
    } catch (e) {
      console.error(e)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  const top = matches && matches.length ? matches[0] : null

  return (
    <div className="card">
      <h2>📷 Fischerkennung</h2>
      <p className="muted">Foto vom Fang hochladen – wir erkennen die Art.</p>

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
            {loading && <p className="muted">🔍 Analysiere Bild …</p>}

            {!loading && top && (
              <>
                <div className="result-row top-hit">
                  <span className="fish-emoji">{top.fish.emoji}</span>
                  <div className="fish-name">
                    <strong>
                      Wahrscheinlich: {top.fish.name} ({top.percent}%)
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
                <div className="tip">💡 {top.fish.tips}</div>
              </>
            )}

            {!loading && matches && matches.length === 0 && (
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
                setMatches(null)
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
