// Cloud-Fischerkennung über die Claude-Vision-API.
//
// Datenschutz/Design: Es wird KEIN Server betrieben. Die App ruft die
// Anthropic-API direkt aus dem Browser auf – mit dem offiziellen Header
// `anthropic-dangerous-direct-browser-access`. Der API-Schlüssel gehört dem
// Nutzer, wird nur lokal (localStorage) gespeichert und ausschließlich an
// api.anthropic.com gesendet. „dangerous" heißt hier: der Schlüssel ist im
// Browser sichtbar – deshalb den EIGENEN Schlüssel nutzen (jederzeit im
// Anthropic-Console widerrufbar).

const API_URL = 'https://api.anthropic.com/v1/messages'

export const CLOUD_MODELS = [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (beste Genauigkeit)' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 (guter Kompromiss)' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (günstig & schnell)' },
]

const SYSTEM =
  'Du bist ein Experte für die Bestimmung von Fischarten weltweit (Süß- und ' +
  'Salzwasser). Du bekommst ein Foto und bestimmst die wahrscheinlichste Art ' +
  'so genau wie möglich. Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, ohne ' +
  'weiteren Text und ohne Code-Fences.'

const PROMPT = `Bestimme den Fisch auf dem Foto. Gib genau dieses JSON zurück:
{
  "istFisch": true oder false,
  "art": "deutscher Name der Art (oder beste Vermutung)",
  "lateinisch": "wissenschaftlicher Name",
  "wasser": "Süßwasser" | "Salzwasser" | "beides" | "unbekannt",
  "konfidenz": Zahl 0-100,
  "beschreibung": "1-2 Sätze zu Merkmalen/Verbreitung",
  "alternativen": ["andere mögliche Arten"],
  "tipp": "kurzer Angel-Tipp zu dieser Art"
}
Wenn kein Fisch erkennbar ist, setze istFisch=false und erkläre das kurz in "beschreibung".`

export async function classifyWithClaude({ imageDataUrl, apiKey, model }) {
  const { mediaType, data } = parseDataUrl(imageDataUrl)

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model || 'claude-opus-4-8',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const err = await res.json()
      msg = err?.error?.message || msg
    } catch {
      /* ignore */
    }
    if (res.status === 401) msg = 'API-Schlüssel ungültig oder fehlt.'
    if (res.status === 429) msg = 'Zu viele Anfragen – kurz warten und erneut versuchen.'
    throw new Error(msg)
  }

  const json = await res.json()
  const text = (json.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
  return parseResult(text)
}

function parseResult(text) {
  // JSON aus der Antwort herausschneiden (falls doch Text drumherum steht).
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error('Unerwartete Antwort der KI.')
  }
  const obj = JSON.parse(text.slice(start, end + 1))
  return {
    istFisch: obj.istFisch !== false,
    art: obj.art || 'Unbekannt',
    lateinisch: obj.lateinisch || '',
    wasser: obj.wasser || 'unbekannt',
    konfidenz: clampInt(obj.konfidenz, 0, 100),
    beschreibung: obj.beschreibung || '',
    alternativen: Array.isArray(obj.alternativen) ? obj.alternativen.slice(0, 4) : [],
    tipp: obj.tipp || '',
  }
}

function clampInt(v, min, max) {
  const n = Math.round(Number(v))
  if (Number.isNaN(n)) return null
  return Math.max(min, Math.min(max, n))
}

function parseDataUrl(dataUrl) {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl)
  if (!match) throw new Error('Ungültiges Bildformat.')
  return { mediaType: match[1], data: match[2] }
}

// Bild verkleinern (max. Kantenlänge) und als JPEG-Data-URL zurückgeben –
// spart Datenvolumen und API-Kosten.
export function fileToResizedDataUrl(file, maxDim = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => (img.src = e.target.result)
    reader.onerror = reject
    img.onload = () => {
      let { width, height } = img
      const scale = Math.min(1, maxDim / Math.max(width, height))
      width = Math.round(width * scale)
      height = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    reader.readAsDataURL(file)
  })
}
