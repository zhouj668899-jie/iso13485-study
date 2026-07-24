import { Link } from 'react-router-dom'
import { getClause } from '../lib/data'
import { useStore } from '../store/useStore'
import { SectionLabel, SurfaceCard } from '../components/ui'

export default function Notes() {
  const notes = useStore((s) => s.notes)
  const setNote = useStore((s) => s.setNote)

  const entries = Object.entries(notes)
    .map(([id, text]) => ({ id, text }))
    .filter((e) => e.text?.trim())
    .sort((a, b) => a.id.localeCompare(b.id))

  return (
    <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">
      <SectionLabel>学习笔记</SectionLabel>
      <h1 className="display-h2 mt-3 mb-8">我的笔记 {entries.length} 条</h1>

      {entries.length === 0 ? (
        <div className="surface-card text-center py-16">
          <p className="text-silver-mist">还没有笔记。在阅读条款时点击「笔记」即可记录要点。</p>
          <Link to="/standard" className="btn-aurora mt-6 inline-flex">去阅读标准</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((e) => {
            const c = getClause(e.id)
            return (
              <SurfaceCard key={e.id} className="!p-6">
                <div className="flex items-start justify-between gap-4">
                  <Link to={`/standard/${e.id}`} className="text-platinum text-[16px] hover:text-lavender-phosphor">
                    <span className="text-liquid-mist/70 mr-2">{c?.number}</span>
                    {c?.title ?? e.id}
                  </Link>
                  <button
                    onClick={() => setNote(e.id, '')}
                    className="text-silver-mist text-[12px] hover:text-lavender-phosphor shrink-0"
                  >
                    删除
                  </button>
                </div>
                <p className="text-silver-mist text-[14px] mt-3 leading-relaxed whitespace-pre-line">{e.text}</p>
              </SurfaceCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
