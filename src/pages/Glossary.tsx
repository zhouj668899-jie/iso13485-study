import { useMemo, useState } from 'react'
import { termsList } from '../lib/data'
import { useStore } from '../store/useStore'
import { SectionLabel, SurfaceCard } from '../components/ui'

type Mode = 'list' | 'cards'

export default function Glossary() {
  const [mode, setMode] = useState<Mode>('list')
  const [filter, setFilter] = useState<'all' | 'unknown'>('all')
  const flashcardState = useStore((s) => s.flashcardState)
  const setKnown = useStore((s) => s.setFlashcardKnown)

  const knownCount = useMemo(
    () => Object.values(flashcardState).filter((v) => v.known).length,
    [flashcardState],
  )

  const pool = useMemo(() => {
    if (filter === 'unknown') return termsList.filter((t) => !flashcardState[t.term]?.known)
    return termsList
  }, [filter, flashcardState])

  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = pool[idx] ?? pool[0]

  function nextCard() {
    setFlipped(false)
    setIdx((i) => (i + 1) % Math.max(1, pool.length))
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">
      <SectionLabel>术语表 · 第 3 章</SectionLabel>
      <div className="flex flex-wrap items-end justify-between gap-4 mt-3 mb-8">
        <h1 className="display-h2">关键术语 {termsList.length} 条</h1>
        <div className="flex items-center gap-3">
          <span className="eyebrow">已掌握 {knownCount}/{termsList.length}</span>
          <div className="flex rounded-md overflow-hidden border border-liquid-kelp">
            <button
              onClick={() => setMode('list')}
              className={`px-4 py-2 text-sm ${mode === 'list' ? 'bg-liquid-kelp text-platinum' : 'text-silver-mist'}`}
            >
              列表
            </button>
            <button
              onClick={() => setMode('cards')}
              className={`px-4 py-2 text-sm ${mode === 'cards' ? 'bg-liquid-kelp text-platinum' : 'text-silver-mist'}`}
            >
              闪卡
            </button>
          </div>
        </div>
      </div>

      {mode === 'list' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {termsList.map((t) => {
            const known = flashcardState[t.term]?.known
            return (
              <SurfaceCard key={t.number} className="!p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-liquid-mist/70 text-[12px]">{t.number}</div>
                    <h3 className="text-xl font-medium text-platinum mt-1">{t.term}</h3>
                  </div>
                  <button
                    onClick={() => setKnown(t.term, !known)}
                    className={`shrink-0 text-[12px] px-2 py-1 rounded ${known ? 'bg-lavender-phosphor text-liquid-abyss' : 'bg-liquid-deep text-silver-mist'}`}
                  >
                    {known ? '已掌握' : '标记掌握'}
                  </button>
                </div>
                <p className="text-silver-mist text-[14px] mt-3 leading-relaxed whitespace-pre-line line-clamp-4">
                  {t.definition}
                </p>
              </SurfaceCard>
            )
          })}
        </div>
      )}

      {mode === 'cards' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unknown' : 'all')}
              className="btn-kelp !py-2 !px-3 text-[13px]"
            >
              {filter === 'all' ? '仅看未掌握' : '查看全部'}
            </button>
            <span className="eyebrow">
              {pool.length === 0 ? '全部掌握 🎉' : `${idx + 1} / ${pool.length}`}
            </span>
          </div>

          {pool.length === 0 ? (
            <div className="surface-card text-center py-16">
              <p className="text-lavender-phosphor text-2xl">全部术语已掌握 🎉</p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <button
                onClick={() => setFlipped((f) => !f)}
                className="w-full surface-card min-h-[260px] flex flex-col items-center justify-center text-center !p-10 hover:!bg-[#004a45] transition-colors"
              >
                {!flipped ? (
                  <>
                    <div className="text-liquid-mist/60 text-[12px] mb-3">{card.number}</div>
                    <div className="text-3xl font-medium text-platinum">{card.term}</div>
                    <div className="text-silver-mist text-[13px] mt-6">点击查看定义 ↻</div>
                  </>
                ) : (
                  <p className="text-silver-mist text-[16px] leading-relaxed whitespace-pre-line">
                    {card.definition}
                  </p>
                )}
              </button>

              <div className="flex justify-between gap-3 mt-5">
                <button
                  onClick={() => {
                    setKnown(card.term, true)
                    nextCard()
                  }}
                  className="btn-aurora !py-2 !px-4 text-[13px]"
                >
                  我记住了 ✓
                </button>
                <button onClick={nextCard} className="btn-kelp !py-2 !px-4 text-[13px]">
                  下一张 →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
