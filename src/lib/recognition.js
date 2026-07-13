// KI-Fischerkennung (On-Device).
//
// Hinweis zur Ehrlichkeit: Dies ist ein heuristischer Bildklassifikator,
// der komplett offline im Browser läuft. Er extrahiert Merkmale aus dem
// Foto (dominanter Farbton, Sättigung, Helligkeit sowie die Form/Elongation
// des Motivs) und vergleicht sie mit den Signaturen aus der Fisch-Datenbank.
// Er nutzt KEIN trainiertes neuronales Netz mit Gewichten aus dem Netz –
// das wäre in dieser Offline-Umgebung nicht möglich. Für eine echte
// Produktion würde man hier z.B. ein TensorFlow.js-Modell einbinden.
//
// Das Ergebnis ist eine nach Konfidenz sortierte Trefferliste.

import { FISHES } from '../data/fishes.js'

// Bild in ein kleines Canvas laden und Merkmale extrahieren.
export async function analyzeImage(fileOrUrl) {
  const img = await loadImage(fileOrUrl)
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  const features = extractFeatures(data, size)
  const matches = FISHES.map((fish) => ({
    fish,
    confidence: scoreMatch(features, fish.signature),
  }))

  // In Prozent normalisieren (Softmax-artig, damit die Summe Sinn ergibt).
  const exp = matches.map((m) => Math.exp(m.confidence * 4))
  const sum = exp.reduce((a, b) => a + b, 0)
  matches.forEach((m, i) => {
    m.percent = Math.round((exp[i] / sum) * 100)
  })

  matches.sort((a, b) => b.percent - a.percent)
  return { features, matches }
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

// Extrahiert Durchschnitts-Farbton (HSL), Sättigung, Helligkeit sowie
// eine grobe Elongation des vom Hintergrund abweichenden Motivs.
function extractFeatures(data, size) {
  let rSum = 0, gSum = 0, bSum = 0, count = 0
  // Motiv-Bounding-Box anhand von Pixeln, die vom Randmittelwert abweichen.
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
    // Kein klar abgegrenztes Motiv -> gesamtes Bild mitteln.
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
    elongation = Math.min(1, (ratio - 1) / 3) // ratio 1..4 -> 0..1
  }

  return { hue: h, sat: s, light: l, elongation }
}

// Ähnlichkeit zwischen Bildmerkmalen und Fisch-Signatur (0..1).
function scoreMatch(f, sig) {
  // Zirkuläre Distanz für den Farbton (0..360).
  let hueDiff = Math.abs(f.hue - sig.hue)
  if (hueDiff > 180) hueDiff = 360 - hueDiff
  const hueScore = 1 - hueDiff / 180
  const satScore = 1 - Math.abs(f.sat - sig.sat)
  const lightScore = 1 - Math.abs(f.light - sig.light)
  const elongScore = 1 - Math.abs(f.elongation - sig.elongation)

  return (
    hueScore * 0.3 +
    satScore * 0.2 +
    lightScore * 0.2 +
    elongScore * 0.3
  )
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
