import { useEffect, useState } from 'react'
import { useApp } from './state.jsx'
import DayPlanner from './components/DayPlanner.jsx'
import TaskList from './components/TaskList.jsx'
import FocusRoom from './components/FocusRoom.jsx'
import Rewards from './components/Rewards.jsx'
import Insights from './components/Insights.jsx'
import Onboarding from './components/Onboarding.jsx'
import ProfileSheet from './components/ProfileSheet.jsx'
import Confetti from './components/Confetti.jsx'

const TABS = [
  { id: 'day', label: 'Tag', ico: '📅', comp: DayPlanner },
  { id: 'todo', label: 'To-do', ico: '✅', comp: TaskList },
  { id: 'focus', label: 'Fokus', ico: '🦊', comp: FocusRoom },
  { id: 'rewards', label: 'Belohnung', ico: '🎁', comp: Rewards },
  { id: 'insights', label: 'Einblick', ico: '📈', comp: Insights },
]

const THEME_MAP = { theme_sunset: 'sunset', theme_mint: 'mint' }

export default function App() {
  const { state, profile, data } = useApp()
  const [tab, setTab] = useState('focus')
  const [profileOpen, setProfileOpen] = useState(false)

  // Freigeschaltetes Farbthema anwenden
  useEffect(() => {
    const theme = THEME_MAP[data.equipped.theme]
    const root = document.documentElement
    if (theme) root.setAttribute('data-theme', theme)
    else root.removeAttribute('data-theme')
  }, [data.equipped.theme])

  if (!state.onboarded) {
    return (
      <div className="app">
        <Onboarding />
      </div>
    )
  }

  const Active = TABS.find((t) => t.id === tab)?.comp || FocusRoom

  return (
    <div className="app">
      <Confetti />

      <header className="topbar">
        <div>
          <h1>🦊 Fokusfuchs</h1>
          <div className="sub">Hallo {profile.name} · ein Schritt nach dem anderen</div>
        </div>
        <button className="profile-chip" onClick={() => setProfileOpen(true)}>
          <span className="avatar" style={{ background: (profile.color || '#7c6ff0') + '33' }}>{profile.avatar}</span>
          <span>🔥 {data.streak.count} · {data.coins} 🪙</span>
        </button>
      </header>

      <main className="content">
        <Active />
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="ico">{t.ico}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {profileOpen && <ProfileSheet onClose={() => setProfileOpen(false)} />}
    </div>
  )
}
