import { useEffect, useRef } from 'react'

interface Props {
  size?: number
  className?: string
  density?: number
  /** 是否响应鼠标（视差倾斜 + 指针斥力） */
  interactive?: boolean
}

// 深海生物荧光粒子球 v3：
// - 双轴旋转 + 呼吸缩放
// - 鼠标视差倾斜（惯性缓动）
// - 指针斥力：靠近的粒子被轻轻推开并提亮（生物应激发光）
// - 轮廓 lavender-pink 拾光 + 正面白/aqua 亮点 + 微闪烁
export default function ParticleSphere({ size = 440, className = '', density = 900, interactive = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const N = density
    const pts = Array.from({ length: N }, () => {
      const k = Math.random()
      const phi = Math.acos(2 * k - 1)
      const theta = Math.random() * Math.PI * 2
      return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        j: Math.random() * Math.PI * 2, // 闪烁相位
        ox: 0, // 斥力偏移（屏面）
        oy: 0,
      }
    })

    let raf = 0
    let angle = 0
    let t = 0
    const cx = size / 2
    const cy = size / 2
    const baseR = size * 0.4

    // 鼠标状态（目标值 + 惯性当前值）
    let tiltXT = 0, tiltYT = 0, tiltX = 0, tiltY = 0
    let mx = -9999, my = -9999
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      tiltXT = ny * 0.5
      tiltYT = nx * 0.7
      mx = e.clientX - rect.left
      my = e.clientY - rect.top
    }
    const onLeave = () => {
      tiltXT = 0
      tiltYT = 0
      mx = -9999
      my = -9999
    }
    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave)
    }

    const render = () => {
      angle += 0.0024
      t += 0.02
      // 惯性缓动趋近目标倾斜
      tiltX += (tiltXT - tiltX) * 0.045
      tiltY += (tiltYT - tiltY) * 0.045
      // 呼吸缩放
      const R = baseR * (1 + 0.018 * Math.sin(t * 0.45))

      ctx.clearRect(0, 0, size, size)

      // 双层辉光：内层 teal 核心 + 外层淡粉环境光（随呼吸微涨落）
      const g = 1 + 0.06 * Math.sin(t * 0.45)
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25 * g)
      glow.addColorStop(0, 'rgba(0,140,132,0.28)')
      glow.addColorStop(0.55, 'rgba(0,130,124,0.10)')
      glow.addColorStop(0.85, 'rgba(250,209,255,0.045)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, size, size)

      const ay = angle + tiltY // 水平旋转叠加鼠标
      const ax = tiltX // 俯仰
      const cosY = Math.cos(ay), sinY = Math.sin(ay)
      const cosX = Math.cos(ax), sinX = Math.sin(ax)

      for (const p of pts) {
        // Y 轴旋转
        let x = p.x * cosY - p.z * sinY
        let z = p.x * sinY + p.z * cosY
        let y = p.y
        // X 轴俯仰
        const y2 = y * cosX - z * sinX
        z = y * sinX + z * cosX
        y = y2

        const depth = (z + 1) / 2
        // 轻透视
        const persp = 1 / (1.6 - z * 0.35)
        let sx = cx + x * R * persp * 1.28
        let sy = cy + y * R * persp * 1.28

        // 指针斥力：靠近粒子被推开 + 应激提亮
        let boost = 0
        if (mx > -999) {
          const dx = sx - mx
          const dy = sy - my
          const d2 = dx * dx + dy * dy
          const range = size * 0.16
          if (d2 < range * range) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / range) * 14
            p.ox += ((dx / d) * f - p.ox) * 0.2
            p.oy += ((dy / d) * f - p.oy) * 0.2
            boost = (1 - d / range) * 0.5
          }
        }
        // 斥力回弹衰减
        p.ox *= 0.92
        p.oy *= 0.92
        sx += p.ox
        sy += p.oy

        const rim = Math.sqrt(x * x + y * y)
        const twinkle = 0.85 + 0.15 * Math.sin(t + p.j)
        const rad = (0.7 + depth * 1.8) * twinkle * (1 + boost * 0.8)
        const alpha = Math.min(1, (0.16 + depth * 0.8) * twinkle + boost)

        if (rim > 0.9) {
          ctx.fillStyle = `rgba(250,209,255,${Math.min(1, alpha + 0.25)})`
        } else if (depth > 0.86) {
          ctx.fillStyle = `rgba(255,255,255,${alpha})`
        } else if (depth > 0.55) {
          ctx.fillStyle = `rgba(203,255,252,${alpha})`
        } else {
          ctx.fillStyle = `rgba(0,150,148,${alpha * 0.75})`
        }
        ctx.beginPath()
        ctx.arc(sx, sy, rad, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(render)
    }
    render()
    return () => {
      cancelAnimationFrame(raf)
      if (interactive) {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerleave', onLeave)
      }
    }
  }, [size, density, interactive])

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className={className}
      aria-hidden
    />
  )
}
