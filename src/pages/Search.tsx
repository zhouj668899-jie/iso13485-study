import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { search, snippet } from '../lib/search'
import { SectionLabel } from '../components/ui'

export default function Search() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const results = useMemo(() => search(q), [q])

  return (
    <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">
      <SectionLabel>全文检索</SectionLabel>
      <h1 className="display-h2 mt-3 mb-8">搜索标准与术语</h1>

      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="输入关键词，如：风险管理、无菌、设计开发、纠正措施…"
        className="w-full bg-liquid-kelp text-platinum rounded-md px-5 py-4 text-[16px] outline-none focus:ring-1 focus:ring-lavender-phosphor placeholder:text-silver-mist/60"
      />

      <div className="mt-8 space-y-3">
        {q.trim() === '' && (
          <p className="text-silver-mist/70 text-sm">输入关键词开始检索全部 {results.length === 0 ? '' : ''}条款与术语。</p>
        )}
        {q.trim() !== '' && results.length === 0 && (
          <div className="surface-card">
            <p className="text-silver-mist">未找到与「{q}」相关的内容，换个关键词试试。</p>
          </div>
        )}
        {results.map((r) => (
          <button
            key={r.id}
            onClick={() => navigate(r.type === 'clause' ? `/standard/${r.id}` : '/glossary')}
            className="w-full text-left surface-card hover:!bg-[#004a45] transition-colors flex items-start gap-4"
          >
            <span className="shrink-0 mt-1 text-[11px] uppercase tracking-wider px-2 py-1 rounded bg-liquid-deep text-liquid-mist">
              {r.type === 'clause' ? r.chapterTitle ?? '条款' : '术语'}
            </span>
            <div className="min-w-0">
              <div className="text-platinum text-[16px]">
                <span className="text-lavender-phosphor mr-2">{r.number}</span>
                {r.title}
              </div>
              <p className="text-silver-mist text-[14px] mt-1 leading-relaxed whitespace-pre-line">
                {snippet(r.body, q)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
