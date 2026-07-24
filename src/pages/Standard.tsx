import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { chapters, clauses, clausesByChapter, getClause, getClauseIndex } from '../lib/data'
import { useStore } from '../store/useStore'
import { SectionLabel, ArrowIconButton } from '../components/ui'

function Toc() {
  const { clauseId } = useParams()
  const active = clauseId ?? clauses[0]?.id
  return (
    <nav className="space-y-5">
      {chapters.map((ch) => {
        const items = clausesByChapter(ch.id)
        return (
          <div key={ch.id}>
            <div className="eyebrow mb-2">{ch.number} · {ch.title}</div>
            <ul className="space-y-1">
              {items.map((c) => {
                const indent = (c.level - 1) * 14
                const isActive = c.id === active
                return (
                  <li key={c.id}>
                    <Link
                      to={`/standard/${c.id}`}
                      className={`block rounded-md px-3 py-1.5 text-[14px] transition-colors ${
                        isActive
                          ? 'bg-liquid-kelp text-platinum'
                          : 'text-silver-mist hover:bg-liquid-kelp/60 hover:text-platinum'
                      }`}
                      style={{ paddingLeft: 12 + indent }}
                    >
                      <span className="text-liquid-mist/70 mr-2">{c.number}</span>
                      {c.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

export default function Standard() {
  const { clauseId } = useParams()
  const navigate = useNavigate()
  const current = getClause(clauseId ?? clauses[0]?.id) ?? clauses[0]
  const idx = getClauseIndex(current.id)

  const progress = useStore((s) => s.progress)
  const bookmarks = useStore((s) => s.bookmarks)
  const notes = useStore((s) => s.notes)
  const markRead = useStore((s) => s.markRead)
  const toggleBookmark = useStore((s) => s.toggleBookmark)
  const setNote = useStore((s) => s.setNote)
  const touchStreak = useStore((s) => s.touchStreak)

  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  const isBookmarked = bookmarks.includes(current.id)
  const isRead = progress[current.id]?.read

  useEffect(() => {
    markRead(current.id, 1)
    touchStreak()
    setNoteText(notes[current.id] ?? '')
    setNoteOpen(false)
    window.scrollTo({ top: 0 })
  }, [current.id])

  const prev = idx > 0 ? clauses[idx - 1] : null
  const next = idx < clauses.length - 1 ? clauses[idx + 1] : null

  const children = useMemo(
    () =>
      clauses.filter(
        (c) =>
          c.chapterId === current.chapterId &&
          c.level === current.level + 1 &&
          c.number.startsWith(current.number + '.'),
      ),
    [current],
  )

  return (
    <div className="max-w-[1440px] mx-auto px-6 pt-28 pb-24">
      <div className="grid lg:grid-cols-[300px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <Toc />
          </div>
        </aside>

        {/* Mobile chapter jump */}
        <div className="lg:hidden mb-6">
          <select
            className="w-full bg-liquid-kelp text-platinum rounded-md px-3 py-2 text-sm"
            value={current.id}
            onChange={(e) => navigate(`/standard/${e.target.value}`)}
          >
            {chapters.map((ch) => (
              <optgroup key={ch.id} label={`${ch.number} ${ch.title}`}>
                {clausesByChapter(ch.id).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number} {c.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Main */}
        <article>
          <SectionLabel>{current.chapterTitle}</SectionLabel>
          <div className="flex items-start justify-between gap-4 mt-3">
            <h1 className="display-h2">
              <span className="text-lavender-phosphor mr-3">{current.number}</span>
              {current.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => markRead(current.id, 1)}
                className={`btn-kelp !py-2 !px-3 text-[13px] ${isRead ? 'opacity-60' : ''}`}
                title="标记已读"
              >
                {isRead ? '✓ 已读' : '标记已读'}
              </button>
              <button
                onClick={() => toggleBookmark(current.id)}
                className={`btn-kelp !py-2 !px-3 text-[13px] ${isBookmarked ? '!bg-lavender-phosphor !text-liquid-abyss' : ''}`}
                title="书签"
              >
                {isBookmarked ? '★ 已收藏' : '☆ 收藏'}
              </button>
              <button
                onClick={() => {
                  setNoteText(notes[current.id] ?? '')
                  setNoteOpen((v) => !v)
                }}
                className="btn-kelp !py-2 !px-3 text-[13px]"
                title="笔记"
              >
                笔记
              </button>
            </div>
          </div>

          {current.body.length > 0 ? (
            <div className="mt-8 space-y-4">
              {current.body.map((p, i) => (
                <p key={i} className="text-silver-mist leading-relaxed text-[15px] whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <div className="mt-8 surface-card">
              <p className="text-silver-mist text-[15px] mb-4">本条为分节标题，内容见其子条款：</p>
              <div className="flex flex-wrap gap-3">
                {children.map((c) => (
                  <Link
                    key={c.id}
                    to={`/standard/${c.id}`}
                    className="btn-kelp !py-2 !px-3 text-[13px]"
                  >
                    {c.number} {c.title} ↗
                  </Link>
                ))}
              </div>
            </div>
          )}

          {noteOpen && (
            <div className="mt-8 surface-card">
              <SectionLabel>学习笔记 · {current.number} {current.title}</SectionLabel>
              <textarea
                className="mt-3 w-full h-32 bg-liquid-deep text-silver-mist rounded-md p-3 text-[14px] outline-none focus:ring-1 focus:ring-liquid-kelp resize-none"
                value={noteText}
                placeholder="写下你的理解、疑问或记忆要点…"
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex gap-3 mt-3">
                <button className="btn-aurora !py-2 !px-4 text-[13px]" onClick={() => { setNote(current.id, noteText); setNoteOpen(false) }}>
                  保存笔记
                </button>
                <button className="btn-kelp !py-2 !px-4 text-[13px]" onClick={() => setNoteOpen(false)}>
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Prev / Next */}
          <div className="flex justify-between gap-4 mt-12 pt-8 border-t border-liquid-kelp/60">
            {prev ? (
              <button onClick={() => navigate(`/standard/${prev.id}`)} className="text-left group">
                <div className="eyebrow">← 上一条</div>
                <div className="text-platinum mt-1 group-hover:text-lavender-phosphor">{prev.number} {prev.title}</div>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button onClick={() => navigate(`/standard/${next.id}`)} className="text-right group">
                <div className="eyebrow">下一条 →</div>
                <div className="text-platinum mt-1 group-hover:text-lavender-phosphor">{next.number} {next.title}</div>
              </button>
            ) : (
              <span />
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
