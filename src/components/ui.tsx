import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CountUp } from '../lib/motion'

export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`eyebrow ${className}`}>{children}</span>
}

export function SurfaceCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`surface-card ${className}`}>{children}</div>
}

export function RecessedCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`recessed-card ${className}`}>{children}</div>
}

export function ArrowIconButton({
  to,
  onClick,
  className = '',
  title,
}: {
  to?: string
  onClick?: () => void
  className?: string
  title?: string
}) {
  const cls =
    'w-8 h-8 rounded-md flex items-center justify-center bg-[rgba(3,81,75,0.5)] text-white hover:bg-[rgba(3,81,75,0.85)] transition-colors ' +
    className
  const inner = <span className="text-base leading-none">↗</span>
  if (to)
    return (
      <Link to={to} className={cls} title={title} aria-label={title}>
        {inner}
      </Link>
    )
  if (onClick)
    return (
      <button onClick={onClick} className={cls} title={title} aria-label={title}>
        {inner}
      </button>
    )
  // 既无 to 也无 onClick 时作为纯装饰元素（避免在 Link 内嵌套 Link/button）
  return (
    <span className={cls} title={title} aria-label={title}>
      {inner}
    </span>
  )
}

export function GradientPillButton({
  to,
  onClick,
  children,
  className = '',
  type = 'button',
}: {
  to?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
}) {
  if (to)
    return (
      <Link to={to} className={`btn-aurora ${className}`}>
        {children}
      </Link>
    )
  return (
    <button type={type} onClick={onClick} className={`btn-aurora ${className}`}>
      {children}
    </button>
  )
}

export function StatisticCounter({
  value,
  label,
  className = '',
}: {
  value: string | number
  label: string
  className?: string
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className="text-lavender-phosphor font-matter"
        style={{ fontSize: 'clamp(3.2rem, 6.5vw, 5.4rem)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 600 }}
      >
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </span>
      <span
        className="mt-4 uppercase text-liquid-mist"
        style={{ fontSize: '13px', letterSpacing: '0.055em', fontWeight: 400 }}
      >
        {label}
      </span>
    </div>
  )
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  const off = c * (1 - v)
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#011d1c" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#00827c"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={off}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset .6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lavender-phosphor font-matter" style={{ fontSize: size * 0.22, fontWeight: 500 }}>
            {Math.round(v * 100)}%
          </span>
        </div>
      </div>
      {label && <span className="eyebrow">{label}</span>}
    </div>
  )
}
