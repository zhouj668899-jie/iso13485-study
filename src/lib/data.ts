import standardJson from '../data/standard.json'
import termsJson from '../data/terms.json'
import type { Clause, Chapter, Term } from './types'

const s = standardJson as unknown as {
  meta: Record<string, unknown>
  chapters: Chapter[]
  clauses: Clause[]
}

export const meta = s.meta
export const chapters: Chapter[] = s.chapters
export const clauses: Clause[] = s.clauses
export const termsList: Term[] = termsJson as unknown as Term[]

export function getClause(id: string): Clause | undefined {
  return clauses.find((c) => c.id === id)
}

export function getClauseIndex(id: string): number {
  return clauses.findIndex((c) => c.id === id)
}

export function clausesByChapter(chapterId: string): Clause[] {
  return clauses.filter((c) => c.chapterId === chapterId)
}

export function clauseChildren(clause: Clause): Clause[] {
  return clauses.filter(
    (c) => c.chapterId === clause.chapterId && c.level === clause.level + 1 && c.number.startsWith(clause.number + '.'),
  )
}
