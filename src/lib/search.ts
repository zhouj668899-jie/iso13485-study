import MiniSearch from 'minisearch'
import { clauses, termsList } from './data'

export interface SearchDoc {
  id: string
  type: 'clause' | 'term'
  number: string
  title: string
  body: string
  chapterTitle: string | null
}

const docs: SearchDoc[] = [
  ...clauses.map((c) => ({
    id: c.id,
    type: 'clause' as const,
    number: c.number,
    title: c.title,
    body: c.body.join(' '),
    chapterTitle: c.chapterTitle,
  })),
  ...termsList.map((t) => ({
    id: 'term-' + t.number,
    type: 'term' as const,
    number: t.number,
    title: t.term,
    body: t.definition,
    chapterTitle: '术语',
  })),
]

export const mini = new MiniSearch<SearchDoc>({
  fields: ['title', 'body', 'number'],
  storeFields: ['type', 'number', 'title', 'body', 'chapterTitle'],
  searchOptions: { boost: { title: 3, number: 2 }, prefix: true, fuzzy: 0.2 },
})
mini.addAll(docs)

export interface SearchHit {
  id: string
  type: 'clause' | 'term'
  number: string
  title: string
  body: string
  chapterTitle: string | null
  score: number
}

export function search(q: string): SearchHit[] {
  if (!q.trim()) return []
  return mini.search(q).map((r) => ({
    id: r.id as string,
    type: r.type as 'clause' | 'term',
    number: r.number as string,
    title: r.title as string,
    body: r.body as string,
    chapterTitle: r.chapterTitle as string | null,
    score: r.score,
  }))
}

export function snippet(body: string, query: string, len = 120): string {
  const q = query.trim()
  if (!q) return body.slice(0, len)
  const idx = body.indexOf(q)
  if (idx < 0) return body.slice(0, len)
  const start = Math.max(0, idx - 30)
  return (start > 0 ? '…' : '') + body.slice(start, start + len) + (start + len < body.length ? '…' : '')
}
