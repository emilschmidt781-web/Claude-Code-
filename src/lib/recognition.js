// KI-Fischerkennung – echtes neuronales Netz im Browser.
//
// Primär: TensorFlow.js + MobileNet (ein trainiertes Bildmodell) läuft
// direkt auf dem Gerät. Das Modell wird beim ersten Scan einmalig vom CDN
// geladen und danach vom Browser gecacht. Es erkennt allgemeine Bildinhalte;
// die für Fische relevanten Klassen ordnen wir unseren heimischen Arten zu.
//
// Fallback: Ist kein Netz verfügbar (offline / CDN blockiert), nutzt die App
// automatisch die heuristische Farb-/Formanalyse. Dadurch funktioniert der
// Scanner immer – nur eben genauer, wenn das KI-Modell geladen werden kann.

import { FISHES } from '../data/fishes.js'

const CDN = {
  tf: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
  mobilenet:
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js',
}

// ImageNet-Klassen (das kann MobileNet) → unsere Fischarten.
// Nur ein Teil der Arten ist über ImageNet abbildbar; der Rest wird über die
// Heuristik ergänzt.
const IMAGENET_TO_FISH = [
  { keys: ['eel'], fish: 'aal', weight: 1.0 },
  { keys: ['coho', 'salmon', 'trout'], fish: 'forelle', weight: 0.95 },
  { keys: ['gar'], fish: 'hecht', weight: 0.85 },
  { keys: ['barracouta', 'barracuda'], fish: 'hecht', weight: 0.6 },
  { keys: ['barracouta', 'barracuda'], fish: 'zander', weight: 0.4 },
  { keys: ['sturgeon'], fish: 'wels', weight: 0.7 },
  { keys: ['catfish'], fish: 'wels', weight: 0.9 },
  { keys: ['tench'], fish: 'karpfen', weight: 0.7 },
  { keys: ['goldfish'], fish: 'rotauge', weight: 0.7 },
  { keys: ['goldfish', 'tench'], fish: 'karpfen', weight: 0.3 },
]

// Welche ImageNet-Begriffe gelten überhaupt als „Fisch"?
const FISH_TERMS = [
  'fish', 'eel', 'coho', 'salmon', 'trout', 'gar', 'barracouta', 'barracuda',
  'sturgeon', 'catfish', 'tench', 'goldfish', 'puffer', 'lionfish',
]

let modelPromise = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Konnte nicht laden: ' + src))
    document.head.appendChild(s)
  })
}

// Lädt (einmalig) TensorFlow.js + MobileNet. Bei Erfolg gecacht.
export function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      if (typeof window.tf === 'undefined') await loadScript(CDN.tf)
      if (typeof window.mobilenet === 'undefined') await loadScript(CDN.mobilenet)
      return window.mobilenet.load({ version: 2, alpha: 1.0 })
    })().catch((err) => {
      modelPromise = null // erneuten Versuch erlauben
      throw err
    })
  }
  return modelPromise
}

export async function analyzeImage(fileOrUrl) {
  const img = await loadImage(fileOrUrl)

  // Heuristik immer berechnen (Fallback + Ergänzung).
  const heur = heuristicScores(img) // Map fishId -> 0..1

  let raw = null
  let usedModel = false
  let fishness = null
  const modelScores = new Map()

  try {
    const model = await loadModel()
    const preds = await model.classify(img, 10) // [{className, probability}]
    usedModel = true
    raw = preds.slice(0, 3).map((p) => ({
      label: p.className.split(',')[0],
      prob: p.probability,
    }))
    fishness = clamp01(sumFishProb(preds))

    for (const p of preds) {
      const name = p.className.toLowerCase()
      for (const rule of IMAGENET_TO_FISH) {
        if (rule.keys.some((k) => name.includes(k))) {
          modelScores.set(
            rule.fish,
            (modelScores.get(rule.fish) || 0) + p.probability * rule.weight
          )
        }
      }
    }
  } catch {
    // offline / CDN nicht erreichbar -> nur Heuristik
  }

  // Scores kombinieren.
  const matches = FISHES.map((fish) => {
    const h = heur.get(fish.id) || 0
    const m = modelScores.get(fish.id) || 0
    // Modell dominiert, wenn verfügbar; sonst reine Heuristik.
    const score = usedModel ? 0.75 * m + 0.25 * h : h
    return { fish, score }
  })

  // In Prozent normalisieren (softmax-artig).
  const temp = usedModel ? 6 : 4
  const exps = matches.map((x) => Math.exp(x.score * temp))
  const sum = exps.reduce((a, b) => a + b, 0) || 1
  matches.forEach((x, i) => {
    x.percent = Math.round((exps[i] / sum) * 100)
  })
  matches.sort((a, b) => b.percent - a.percent)

  return { matches, usedModel, raw, fishness }
}

function sumFishProb(preds) {
  return preds
    .filter((p) => FISH_TERMS.some((t) => p.className.toLowerCase().includes(t)))
    .reduce((a, p) => a + p.probability, 0)
}
function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

function loadImage(fileOrUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl
    } else {
      const reader = new FileReader()
      reader.onload = (e) => (img.src = e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(fileOrUrl)
    }
  })
}

// ---------------------------------------------------------------------------
// Heuristik (Fallback): Farb-/Formanalyse auf kleinem Canvas.
// ---------------------------------------------------------------------------

function heuristicScores(img) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  const features = extractFeatures(data, size)
  const scores = new Map()
  for (const fish of FISHES) {
    scores.set(fish.id, scoreMatch(features, fish.signature))
  }
  return scores
}

function extractFeatures(data, size) {
  const edgeSamples = []
  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % size
    const py = Math.floor(i / 4 / size)
    if (px < 2 || px >= size - 2 || py < 2 || py >= size - 2) {
      edgeSamples.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  const bg = avg(edgeSamples)

  let minX = size, minY = size, maxX = 0, maxY = 0
  let hasSubject = false
  let rSum = 0, gSum = 0, bSum = 0, count = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const px = (i / 4) % size
    const py = Math.floor(i / 4 / size)
    const diff = Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2])
    if (diff > 60) {
      hasSubject = true
      minX = Math.min(minX, px); maxX = Math.max(maxX, px)
      minY = Math.min(minY, py); maxY = Math.max(maxY, py)
      rSum += r; gSum += g; bSum += b; count++
    }
  }
  if (count === 0) {
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; count++
    }
  }

  const [h, s, l] = rgbToHsl(rSum / count, gSum / count, bSum / count)
  let elongation = 0.5
  if (hasSubject) {
    const w = maxX - minX + 1
    const hgt = maxY - minY + 1
    const ratio = Math.max(w, hgt) / Math.min(w, hgt)
    elongation = Math.min(1, (ratio - 1) / 3)
  }
  return { hue: h, sat: s, light: l, elongation }
}

function scoreMatch(f, sig) {
  let hueDiff = Math.abs(f.hue - sig.hue)
  if (hueDiff > 180) hueDiff = 360 - hueDiff
  const hueScore = 1 - hueDiff / 180
  const satScore = 1 - Math.abs(f.sat - sig.sat)
  const lightScore = 1 - Math.abs(f.light - sig.light)
  const elongScore = 1 - Math.abs(f.elongation - sig.elongation)
  return hueScore * 0.3 + satScore * 0.2 + lightScore * 0.2 + elongScore * 0.3
}

function avg(samples) {
  if (samples.length === 0) return [128, 128, 128]
  const s = samples.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0]
  )
  return [s[0] / samples.length, s[1] / samples.length, s[2] / samples.length]
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r: h = ((g - b) / d) % 6; break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s, l]
}
