import { useState } from 'react'
import './App.css'
import FishRecognition from './components/FishRecognition.jsx'
import BiteForecast from './components/BiteForecast.jsx'
import FishGuide from './components/FishGuide.jsx'
import SpotManager from './components/SpotManager.jsx'

const TABS = [
  { id: 'erkennung', label: '📷 Erkennung', comp: FishRecognition },
  { id: 'prognose', label: '🕐 Beißprognose', comp: BiteForecast },
  { id: 'guide', label: '📖 Guide', comp: FishGuide },
  { id: 'plaetze', label: '📍 Plätze', comp: SpotManager },
]

export default function App() {
  const [active, setActive] = useState('erkennung')
  const ActiveComp = TABS.find((t) => t.id === active).comp

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">🎣</span>
        <h1>Angel-App</h1>
        <p>KI-Fischerkennung &amp; Beißprognose – wann und wo du am besten angelst</p>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={active === t.id ? 'active' : ''}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        <ActiveComp />
      </main>

      <footer className="footer">
        <p>Petri Heil! 🐟</p>
      </footer>
    </div>
  )
}
