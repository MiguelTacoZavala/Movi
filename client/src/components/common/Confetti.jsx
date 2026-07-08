import { useMemo } from 'react'

const COLORS = ['#E74C3C', '#27AE60', '#F39C12', '#3498DB', '#9B59B6', '#E91E63', '#FF9800', '#00BCD4']

export default function Confetti({ duration = 3000 }) {
  const pieces = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.5,
      animDuration: 1.5 + Math.random() * 1.5,
      rotate: Math.random() * 360,
    }))
  }, [])

  return (
    <div className="confetti-container" key={duration}>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.animDuration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
