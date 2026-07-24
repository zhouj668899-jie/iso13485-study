import { Link } from 'react-router-dom'
import { chapters, clausesByChapter } from '../lib/data'
import { useStore } from '../store/useStore'
import { SectionLabel, StatisticCounter, ProgressRing, RecessedCard } from '../components/ui'

const mainChapters = chapters.filter((c) => /^[1-8]$/.test(c.number))

const scopeLabel: Record<string, string> = {
  all: '全套测验',
  wrong: '错题重练',
}
function labelFor(scope: string): string {
  if (scopeLabel[scope]) return scopeLabel[scope]
  const m = scope.match(/^ch(.+)$/)
  if (m) {
    const ch = chapters.find((c) => c.number === m[1])
    return ch ? `${m[1]} ${ch.title}` : scope
  }
  return scope
}

export default function Dashboard() {
  const progress = useStore((s) => s.progress)
  const bookmarks = useStore((s) => s.bookmarks)
  const notes = useStore((s) => s.notes)
  const quizResults = useStore((s) => s.quizResults)
  const flashcardState = useStore((s) => s.flashcardState)
  const streak = useStore((s) => s.streak)

  const readCount = Object.values(progress).filter((p) => p.read).length
  const knownCount = Object.values(flashcardState).filter((v) => v.known).length
  const noteCount = Object.keys(notes).filter((k) => notes[k]?.trim()).length

  const quizEntries = Object.entries(quizResults).sort((a, b) => (a[1].date < b[1].date ? 1 : -1))

  return (
    <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">
      <SectionLabel>学习仪表盘</SectionLabel>
      <h1 className="display-h2 mt-3 mb-10">你的学习全景</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-liquid-deep rounded-2xl overflow-hidden mb-12">
        {[
          { v: streak.count, l: '连续学习(天)' },
          { v: readCount, l: '已读条款' },
          { v: bookmarks.length, l: '收藏条款' },
          { v: knownCount, l: '已掌握术语' },
        ].map((s) => (
          <div key={s.l} className="bg-liquid-abyss p-8 flex items-center justify-center">
            <StatisticCounter value={s.v} label={s.l} />
          </div>
        ))}
      </div>

      <SectionLabel>各章进度</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 mb-14">
        {mainChapters.map((ch) => {
          const items = clausesByChapter(ch.id)
          const total = items.length
          const read = items.filter((c) => progress[c.id]?.read).length
          const ratio = total > 0 ? read / total : 0
          return (
            <div key={ch.id} className="flex flex-col items-center">
              <ProgressRing value={ratio} size={120} stroke={10} label={`${ch.number}`} />
              <div className="text-platinum text-[14px] mt-2 text-center">{ch.title}</div>
              <div className="text-silver-mist text-[12px]">{read}/{total}</div>
            </div>
          )
        })}
      </div>

      <SectionLabel>测验历史</SectionLabel>
      <RecessedCard className="mt-6">
        {quizEntries.length === 0 ? (
          <p className="text-silver-mist text-[14px]">
            还没有测验记录。去 <Link to="/quiz" className="text-lavender-phosphor underline">自测</Link> 检验一下吧。
          </p>
        ) : (
          <div className="space-y-3">
            {quizEntries.map(([scope, r]) => (
              <div key={scope} className="flex items-center justify-between border-b border-liquid-kelp/40 pb-3 last:border-0">
                <div>
                  <div className="text-platinum text-[15px]">{labelFor(scope)}</div>
                  <div className="text-silver-mist text-[12px]">{r.date.slice(0, 10)}</div>
                </div>
                <div className="text-lavender-phosphor" style={{ fontWeight: 500 }}>
                  {r.score} / {r.total}
                  {r.wrong.length > 0 && <span className="text-silver-mist text-[12px] ml-2">错 {r.wrong.length}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </RecessedCard>

      {noteCount > 0 && (
        <div className="mt-10">
          <SectionLabel>最近笔记</SectionLabel>
          <div className="mt-4">
            <Link to="/notes" className="btn-kelp">
              查看全部 {noteCount} 条笔记 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
