// Persistente App-State-Verwaltung für Fokusfuchs.
// Alles läuft lokal im Browser (localStorage) – es werden keine Daten gesendet.

const KEY = 'fokusfuchs.v1'

export const CATEGORIES = [
  { id: 'self', label: 'Selbstfürsorge', color: '#5fd0c5', emoji: '🌿' },
  { id: 'work', label: 'Arbeit / Lernen', color: '#7c9cff', emoji: '💻' },
  { id: 'home', label: 'Haushalt', color: '#f6a94a', emoji: '🏠' },
  { id: 'social', label: 'Menschen', color: '#f57ab0', emoji: '💬' },
  { id: 'fun', label: 'Freude', color: '#b58cf0', emoji: '✨' },
  { id: 'health', label: 'Gesundheit', color: '#8bd07a', emoji: '💚' },
]

export const ENERGY = [
  { id: 'low', label: 'Wenig Energie', emoji: '🪫', color: '#9aa7d0' },
  { id: 'med', label: 'Mittel', emoji: '🔋', color: '#6ec0a8' },
  { id: 'high', label: 'Voll da', emoji: '⚡', color: '#f2b13c' },
]

export const AVATARS = ['🦊', '🐨', '🦉', '🐢', '🦔', '🐙', '🦋', '🐝', '🌵', '🍄']
export const PROFILE_COLORS = ['#7c6ff0', '#f57ab0', '#5fd0c5', '#f6a94a', '#8bd07a']

// Belohnungen im Shop: rein kosmetisch / motivierend, mit Münzen gekauft.
export const REWARDS = [
  { id: 'scene_forest', type: 'scene', label: 'Wald-Fokusraum', emoji: '🌲', cost: 40 },
  { id: 'scene_cafe', type: 'scene', label: 'Café-Fokusraum', emoji: '☕', cost: 60 },
  { id: 'scene_space', type: 'scene', label: 'Weltall-Fokusraum', emoji: '🌌', cost: 120 },
  { id: 'scene_rain', type: 'scene', label: 'Regen-am-Fenster', emoji: '🌧️', cost: 80 },
  { id: 'hat_party', type: 'buddy', label: 'Partyhut für den Fuchs', emoji: '🎉', cost: 30 },
  { id: 'hat_crown', type: 'buddy', label: 'Krone für den Fuchs', emoji: '👑', cost: 150 },
  { id: 'hat_flower', type: 'buddy', label: 'Blumenkranz', emoji: '🌼', cost: 25 },
  { id: 'hat_wizard', type: 'buddy', label: 'Zauberhut', emoji: '🧙', cost: 90 },
  { id: 'theme_sunset', type: 'theme', label: 'Sonnenuntergang-Farben', emoji: '🌅', cost: 70 },
  { id: 'theme_mint', type: 'theme', label: 'Minz-Farben', emoji: '🌱', cost: 70 },
]

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function freshProfileData() {
  return {
    tasks: [],
    focusSessions: [],
    coins: 0,
    xp: 0,
    streak: { count: 0, lastDate: null },
    ownedRewards: [],
    equipped: { scene: null, buddy: null, theme: null },
  }
}

function defaultState() {
  const pid = uid()
  return {
    profiles: [{ id: pid, name: 'Ich', avatar: '🦊', color: '#7c6ff0' }],
    activeProfileId: pid,
    dataByProfile: { [pid]: freshProfileData() },
    onboarded: false,
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    // sanfte Migration: fehlende Felder ergänzen
    if (!parsed.profiles || !parsed.profiles.length) return defaultState()
    for (const p of parsed.profiles) {
      if (!parsed.dataByProfile[p.id]) parsed.dataByProfile[p.id] = freshProfileData()
      const d = parsed.dataByProfile[p.id]
      d.tasks ??= []
      d.focusSessions ??= []
      d.coins ??= 0
      d.xp ??= 0
      d.streak ??= { count: 0, lastDate: null }
      d.ownedRewards ??= []
      d.equipped ??= { scene: null, buddy: null, theme: null }
    }
    if (!parsed.dataByProfile[parsed.activeProfileId]) {
      parsed.activeProfileId = parsed.profiles[0].id
    }
    return parsed
  } catch {
    return defaultState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* Speicher voll oder blockiert – App läuft trotzdem weiter */
  }
}

export const helpers = { uid, todayISO, freshProfileData }

// XP-Level: sanfte Kurve, jedes Level ein bisschen mehr.
export function levelFromXp(xp) {
  let level = 1
  let need = 60
  let remaining = xp
  while (remaining >= need) {
    remaining -= need
    level++
    need = Math.round(need * 1.35)
  }
  return { level, intoLevel: remaining, need }
}
