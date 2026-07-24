import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import ParticleSphere from '../components/ParticleSphere'
import { SectionLabel, StatisticCounter, GradientPillButton, ArrowIconButton } from '../components/ui'
import { Reveal } from '../lib/motion'
import { chapters, clauses, termsList } from '../lib/data'

const mainChapters = chapters.filter((c) => /^[1-8]$/.test(c.number))
const appendices = chapters.filter((c) => c.number.startsWith('附录'))

const features = [
  { to: '/standard', title: '按条款学习', desc: '以官方标准结构逐条研读，自动记录阅读进度与书签，条款树随读随定位。', label: '标准浏览', num: '01' },
  { to: '/search', title: '全文检索', desc: '跨全部条款与术语即时搜索，命中片段高亮，一键直跳原文。', label: '搜索', num: '02' },
  { to: '/quiz', title: '自测题库', desc: '分章与全套测验，即时判分与解析，错题自动归集可重练。', label: '自测', num: '03' },
  { to: '/glossary', title: '术语闪卡', desc: '第 3 章 20 个关键术语翻卡记忆，逐个标记掌握状态。', label: '术语', num: '04' },
]

function Molecule() {
  const nodes: [number, number][] = [
    [40, 40], [120, 30], [180, 90], [110, 130], [50, 120], [150, 170], [200, 40], [70, 180],
  ]
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [3, 5], [2, 6], [1, 6], [5, 7], [4, 7],
  ]
  return (
    <svg viewBox="0 0 240 220" className="w-full max-w-sm opacity-70 molecule-float" fill="none">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#bbc7c6" strokeOpacity="0.3" strokeWidth="1" />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 8 : 5} fill={i % 2 === 0 ? '#edfffe' : '#bbc7c6'} fillOpacity={i % 3 === 0 ? 0.9 : 0.6}>
          <animate attributeName="fill-opacity" values={`${i % 3 === 0 ? 0.9 : 0.6};${i % 3 === 0 ? 0.5 : 0.25};${i % 3 === 0 ? 0.9 : 0.6}`} dur={`${2.4 + (i % 5) * 0.7}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  )
}

/** 巨型文字随滚动横向漂移 */
function KineticBand() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        // 元素从视口底进到顶出，progress 0→1
        const p = Math.max(0, Math.min(1, 1 - (rect.top + rect.height) / (vh + rect.height)))
        el.style.setProperty('--kx', `${(0.5 - p) * 220}px`)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div ref={ref} className="kinetic-track">
      <div className="kinetic-text pl-6 opacity-[0.92]">
        ISO&nbsp;13485<span className="text-lavender-phosphor">.</span>
      </div>
    </div>
  )
}

/** Hero 鼠标视差容器：文字栈与背景球以不同深度轻移 */
function ParallaxHero() {
  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let tx = 0, ty = 0, cx = 0, cy = 0
    let raf = 0
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const tick = () => {
      cx += (tx - cx) * 0.05
      cy += (ty - cy) * 0.05
      el.style.setProperty('--px', String(cx))
      el.style.setProperty('--py', String(cy))
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const layer = (depth: number): CSSProperties => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth * 0.6}px), 0)`,
    willChange: 'transform',
  })

  return (
    <section ref={wrapRef} className="relative min-h-screen flex items-center justify-center">
      <div className="abyss-glow" />
      {/* 数据球：背景层，深度视差最大 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90" style={layer(-22)}>
        <ParticleSphere size={640} />
      </div>
      <div className="relative max-w-[1440px] mx-auto px-6 w-full pt-20 text-center" style={layer(10)}>
        <div className="enter-up" style={{ '--enter-delay': '80ms' } as CSSProperties}>
          <SectionLabel className="text-liquid-mist">ISO 13485:2016 — Medical Devices QMS</SectionLabel>
        </div>
        <h1 className="display-h1 mt-8 mx-auto max-w-5xl enter-up" style={{ '--enter-delay': '220ms' } as CSSProperties}>
          深入医疗器械
          <br />
          <span className="shimmer-text">法规要求的每一条</span>
        </h1>
        <p
          className="text-silver-mist text-lg mt-9 max-w-xl mx-auto leading-relaxed enter-up"
          style={{ '--enter-delay': '400ms' } as CSSProperties}
        >
          以官方中文标准全文为底 — 逐条研读、全文检索、术语闪卡与自测评估，
          在深海般的专注界面中把标准学透、记牢、用得上。
        </p>
        <div
          className="flex flex-wrap items-center justify-center gap-4 mt-12 enter-up"
          style={{ '--enter-delay': '560ms' } as CSSProperties}
        >
          <GradientPillButton to="/standard">开始学习</GradientPillButton>
          <Link to="/quiz" className="btn-kelp">自测评估</Link>
        </div>
      </div>
      {/* 底部滚动提示 */}
      <div className="absolute bottom-10 inset-x-0 flex justify-center">
        <span className="eyebrow text-[10px] tracking-[0.15em] float-hint">Scroll to explore ↓</span>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* ============ HERO —— 鼠标视差 + 交错入场 ============ */}
      <ParallaxHero />

      {/* ============ STATS —— 粉色大数字滚动计数 ============ */}
      <section className="max-w-[1440px] mx-auto px-6 py-[68px]">
        <div className="hairline pt-[48px] grid grid-cols-2 md:grid-cols-4 gap-y-14">
          {[
            { v: mainChapters.length, l: '核心章节' },
            { v: clauses.length, l: '结构化条款' },
            { v: termsList.length, l: '关键术语' },
            { v: appendices.length, l: '资料性附录' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 110}>
              <StatisticCounter value={s.v} label={s.l} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ KINETIC TEXT —— 随滚动漂移的巨型文字 ============ */}
      <section className="relative py-[80px]" aria-hidden>
        <div className="absolute right-[-6%] top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">
          <ParticleSphere size={380} density={520} interactive={false} />
        </div>
        <KineticBand />
      </section>

      {/* ============ EXPLORE —— 非对称双栏 + 逐行进场 ============ */}
      <section className="max-w-[1440px] mx-auto px-6 pt-[68px] pb-[120px]">
        <Reveal>
          <SectionLabel>Explore — 探索功能</SectionLabel>
          <h2 className="display-h2 mt-6 mb-16 max-w-2xl">为深度学习而设计的四个入口</h2>
        </Reveal>
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-16 items-start">
          <div>
            {features.map((f, i) => (
              <Reveal key={f.to} delay={i * 90}>
                <Link
                  to={f.to}
                  className={`group block py-10 px-2 md:px-6 rounded-3xl lift-card hover:bg-liquid-kelp/50 ${i > 0 ? 'hairline' : ''}`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-baseline gap-6">
                      <span className="eyebrow text-[10px] tracking-[0.15em] opacity-50 transition-opacity group-hover:opacity-100 group-hover:text-lavender-phosphor">
                        {f.num}
                      </span>
                      <div>
                        <h3 className="text-platinum text-2xl md:text-[32px] font-semibold leading-tight tracking-tight transition-transform duration-500 group-hover:translate-x-1.5">
                          {f.title}
                        </h3>
                        <p className="text-silver-mist mt-3 leading-relaxed text-[15px] max-w-md">{f.desc}</p>
                      </div>
                    </div>
                    <ArrowIconButton
                      to={f.to}
                      title={f.label}
                      className="shrink-0 group-hover:bg-[rgba(3,81,75,0.9)] transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="hidden md:flex items-center justify-center pt-16">
            <Reveal delay={200}>
              <Molecule />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CTA —— 深池井 ============ */}
      <section className="max-w-[1440px] mx-auto px-6 pb-[68px]">
        <Reveal>
          <div className="bg-liquid-deep rounded-3xl py-[120px] px-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(0,130,124,0.14) 0%, transparent 70%)',
            }} />
            <div className="relative">
              <SectionLabel>Begin — 开始你的学习路径</SectionLabel>
              <h2 className="display-h2 mt-6">从第一条要求读起</h2>
              <p className="text-silver-mist mt-6 max-w-md mx-auto">
                123 条结构化条款按官方章节排布，读过的每一条都会被记住。
              </p>
              <div className="mt-10">
                <GradientPillButton to="/standard">进入标准 ↗</GradientPillButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-liquid-deep">
        <div className="max-w-[1440px] mx-auto px-6 py-[64px] flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-medium tracking-tight text-platinum">
            ISO <span className="text-lavender-phosphor">13485</span>
            <span className="text-silver-mist font-normal ml-3 text-sm">学习终端</span>
          </span>
          <span className="eyebrow text-[10px] tracking-[0.15em] opacity-60">
            Medical Devices — Quality Management Systems · 2016
          </span>
        </div>
      </footer>
    </div>
  )
}
