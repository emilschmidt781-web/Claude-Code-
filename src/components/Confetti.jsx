import { useEffect, useState } from 'react'

// Hört auf ein globales Event und regnet kurz Konfetti.
// Auslösen mit: window.dispatchEvent(new CustomEvent('fokus-celebrate'))
const COLORS = ['#7c6ff0', '#f57ab0', '#5fd0c5', '#f6a94a', '#8bd07a', '#f2c14e']

export function celebrate() {
  window.dispatchEvent(new CustomEvent('fokus-celebrate'))
}

export default function Confetti() {
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    const onCel = () => setBurst((b) => b + 1)
    window.addEventListener('fokus-celebrate', onCel)
    return () => window.removeEventListener('fokus-celebrate', onCel)
  }, [])

  useEffect(() => {
    if (!burst) return
    const t = setTimeout(() => setBurst(0), 2600)
    return () => clearTimeout(t)
  }, [burst])

  if (!burst) return null

  const pieces = Array.from({ length: 70 }, (_, i) => {
    const left = Math.random() * 100
    const delay = Math.random() * 0.5
    const dur = 1.6 + Math.random() * 1.1
    const color = COLORS[i % COLORS.length]
    const rot = Math.random() * 360
    return (
      <i
        key={i}
        style={{
          left: `${left}%`,
          background: color,
          animationDelay: `${delay}s`,
          animationDuration: `${dur}s`,
          transform: `rotate(${rot}deg)`,
        }}
      />
    )
  })

  return <div className="confetti" aria-hidden="true">{pieces}</div>
}
