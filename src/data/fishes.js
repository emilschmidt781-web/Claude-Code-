// Datenbank heimischer Süßwasserfische.
// Wird sowohl von der Fischerkennung (Farb-/Form-Signaturen) als auch
// vom Angel-Guide und der Beißprognose genutzt.
//
// Felder:
//  - id: eindeutiger Schlüssel
//  - name: deutscher Name
//  - latin: wissenschaftlicher Name
//  - emoji: Anzeige-Icon
//  - habitat: bevorzugtes Gewässer
//  - bestMonths: Monate mit bester Beißaktivität (1 = Januar … 12 = Dezember)
//  - bestTimes: bevorzugte Tageszeiten ('daemmerung' | 'morgen' | 'tag' | 'abend' | 'nacht')
//  - baits: bewährte Köder
//  - minSize: gesetzliches/übliches Mindestmaß in cm (Richtwert, Bundesland beachten!)
//  - signature: normierte Merkmale für die Bilderkennung
//      { hue: 0..360 dominanter Farbton, sat: 0..1, light: 0..1,
//        elongation: 0..1 (0 = rundlich, 1 = sehr langgestreckt) }
//  - tips: kurzer Angel-Tipp

export const FISHES = [
  {
    id: 'hecht',
    name: 'Hecht',
    latin: 'Esox lucius',
    emoji: '🐊',
    habitat: 'Seen & langsam fließende Flüsse mit Kraut',
    bestMonths: [3, 4, 5, 9, 10, 11],
    bestTimes: ['daemmerung', 'morgen', 'abend'],
    baits: ['Gummifisch', 'Blinker', 'Köderfisch', 'Wobbler'],
    minSize: 50,
    signature: { hue: 95, sat: 0.45, light: 0.4, elongation: 0.9 },
    tips: 'Räuber – an Krautkanten und Unterständen suchen. Stahlvorfach nutzen!',
  },
  {
    id: 'zander',
    name: 'Zander',
    latin: 'Sander lucioperca',
    emoji: '🐟',
    habitat: 'Tiefe, trübe Seen & große Flüsse',
    bestMonths: [4, 5, 6, 9, 10, 11],
    bestTimes: ['daemmerung', 'nacht', 'abend'],
    baits: ['Gummifisch', 'Köderfisch', 'Tauwurm'],
    minSize: 45,
    signature: { hue: 45, sat: 0.35, light: 0.45, elongation: 0.8 },
    tips: 'Beißt gern in der Dämmerung und nachts. Grundnah führen.',
  },
  {
    id: 'barsch',
    name: 'Flussbarsch',
    latin: 'Perca fluviatilis',
    emoji: '🐠',
    habitat: 'Fast alle Gewässer, gern an Strukturen',
    bestMonths: [5, 6, 7, 8, 9, 10],
    bestTimes: ['morgen', 'tag', 'abend'],
    baits: ['Kleiner Gummifisch', 'Spinner', 'Wurm', 'Made'],
    minSize: 15,
    signature: { hue: 30, sat: 0.6, light: 0.5, elongation: 0.55 },
    tips: 'Jagt im Schwarm – wo einer beißt, sind meist mehr. Aktiv angeln.',
  },
  {
    id: 'karpfen',
    name: 'Karpfen',
    latin: 'Cyprinus carpio',
    emoji: '🐡',
    habitat: 'Warme, nährstoffreiche Seen & Teiche',
    bestMonths: [5, 6, 7, 8, 9],
    bestTimes: ['daemmerung', 'nacht', 'morgen'],
    baits: ['Boilie', 'Mais', 'Teig', 'Pellets'],
    minSize: 35,
    signature: { hue: 40, sat: 0.5, light: 0.4, elongation: 0.5 },
    tips: 'Vorfüttern lohnt sich. Warme, windstille Nächte sind top.',
  },
  {
    id: 'forelle',
    name: 'Bachforelle',
    latin: 'Salmo trutta fario',
    emoji: '🎏',
    habitat: 'Kühle, sauerstoffreiche Bäche & Flüsse',
    bestMonths: [3, 4, 5, 9, 10],
    bestTimes: ['morgen', 'abend', 'daemmerung'],
    baits: ['Fliege', 'Spinner', 'Wurm', 'Bienenmade'],
    minSize: 25,
    signature: { hue: 25, sat: 0.55, light: 0.5, elongation: 0.7 },
    tips: 'Scheu! Vorsichtig anpirschen, gegen die Strömung anwerfen.',
  },
  {
    id: 'aal',
    name: 'Aal',
    latin: 'Anguilla anguilla',
    emoji: '🐍',
    habitat: 'Weiche Böden in Seen & Flüssen',
    bestMonths: [5, 6, 7, 8],
    bestTimes: ['nacht', 'daemmerung'],
    baits: ['Tauwurm', 'Köderfisch', 'Fischfetzen'],
    minSize: 50,
    signature: { hue: 50, sat: 0.3, light: 0.25, elongation: 1.0 },
    tips: 'Nachtjäger. Warme Sommernächte nach Regen sind ideal.',
  },
  {
    id: 'rotauge',
    name: 'Rotauge',
    latin: 'Rutilus rutilus',
    emoji: '🐟',
    habitat: 'Nahezu überall, ruhige Bereiche',
    bestMonths: [4, 5, 6, 7, 8, 9],
    bestTimes: ['morgen', 'tag', 'abend'],
    baits: ['Made', 'Mais', 'Brot', 'Teig'],
    minSize: 0,
    signature: { hue: 200, sat: 0.15, light: 0.7, elongation: 0.55 },
    tips: 'Klassischer Friedfisch fürs Posenangeln. Ideal für Einsteiger.',
  },
  {
    id: 'wels',
    name: 'Wels',
    latin: 'Silurus glanis',
    emoji: '🐋',
    habitat: 'Tiefe Löcher in großen Flüssen & Seen',
    bestMonths: [6, 7, 8, 9],
    bestTimes: ['nacht', 'daemmerung', 'abend'],
    baits: ['Großer Köderfisch', 'Tauwurmbündel', 'Kalmar'],
    minSize: 70,
    signature: { hue: 35, sat: 0.25, light: 0.2, elongation: 0.85 },
    tips: 'Kraftvoller Kampf – starkes Gerät! Warme Gewitternächte sind top.',
  },
]

export const TIME_LABELS = {
  daemmerung: 'Dämmerung',
  morgen: 'Morgen',
  tag: 'Tag',
  abend: 'Abend',
  nacht: 'Nacht',
}

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

export function getFishById(id) {
  return FISHES.find((f) => f.id === id) || null
}
