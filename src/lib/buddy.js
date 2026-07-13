// Der Fokus-Buddy (Body-Doubling): warme, druckfreie Nachrichten.
// Body-Doubling = jemand "arbeitet neben dir mit". Der Fuchs ist dein Kumpel.

const START = [
  'Ich setz mich zu dir. Wir machen das zusammen. 🦊',
  'Ich bin da und mach mit. Fang einfach an – klein ist okay.',
  'Nur wir zwei und diese eine Sache. Los geht’s, ganz ruhig.',
  'Ich arbeite neben dir. Du musst nicht perfekt sein, nur dabei.',
  'Bereit? Ich auch. Ein Schritt nach dem anderen.',
]

const MID = [
  'Läuft. Ich bin immer noch hier neben dir. 🦊',
  'Du machst das gut – einfach dranbleiben.',
  'Kurz durchatmen. Weiter geht’s, wir haben Zeit.',
  'Ich sehe dich fokussieren. Stark.',
  'Noch ein Stück. Ich bleib bei dir.',
  'Ablenkung ist normal. Komm einfach sanft zurück.',
]

const ALMOST = [
  'Fast geschafft! Ich bin so stolz auf dich.',
  'Der letzte Rest – wir ziehen das zusammen durch. 🦊',
  'Gleich hast du’s. Dranbleiben!',
]

const DONE = [
  'Geschafft! Das war echte Arbeit. 🎉',
  'Wir haben’s zusammen durchgezogen. Gut gemacht!',
  'Session fertig – sei stolz, egal wie viel geschafft wurde.',
  'Fokus-Runde beendet. Du bist aufgetaucht, das zählt am meisten.',
]

const CANCEL = [
  'Alles gut. Auch anfangen war schon mutig.',
  'Kein Stress – Pause ist auch okay. Ich bin da, wenn du willst.',
  'Du entscheidest. Ich bleib dein Kumpel, ganz ohne Druck.',
]

function pick(arr, seed) {
  const i = seed == null ? Math.floor(Math.random() * arr.length) : seed % arr.length
  return arr[i]
}

export function buddyMessage(phase, seed) {
  switch (phase) {
    case 'start':
      return pick(START, seed)
    case 'mid':
      return pick(MID, seed)
    case 'almost':
      return pick(ALMOST, seed)
    case 'done':
      return pick(DONE, seed)
    case 'cancel':
      return pick(CANCEL, seed)
    default:
      return pick(MID, seed)
  }
}

// Sanftes „KI"-Co-Planer-Prompt: schlägt Prioritäten & Reihenfolge vor,
// ohne echten Netzwerk-Call – heuristisch und erklärbar.
export function suggestPlan(tasks) {
  const open = tasks.filter((t) => !t.done)
  if (!open.length) return { order: [], note: 'Nichts Offenes – gönn dir eine Pause. 🌿' }
  const score = (t) => {
    let s = 0
    if (t.priority) s += 50
    if (t.time) s += 20
    if (t.energy === 'low') s += 15 // kleine, machbare Dinge zuerst als Anschwung
    if (t.energy === 'high') s -= 5
    if ((t.duration || 15) <= 15) s += 10 // schneller Erfolg
    return s
  }
  const order = [...open].sort((a, b) => score(b) - score(a)).map((t) => t.id)
  const first = open.find((t) => t.id === order[0])
  return {
    order,
    note: first
      ? `Starte klein mit „${first.title}". Ein kleiner Anfang bringt den Rest ins Rollen.`
      : 'Los geht’s, ganz in deinem Tempo.',
  }
}
