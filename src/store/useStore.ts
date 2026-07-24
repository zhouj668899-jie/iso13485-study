import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizResult } from '../lib/types'

interface ProgressEntry {
  read: boolean
  readRatio: number
}

interface AppState {
  progress: Record<string, ProgressEntry>
  bookmarks: string[]
  notes: Record<string, string>
  quizResults: Record<string, QuizResult>
  flashcardState: Record<string, { known: boolean }>
  streak: { lastDate: string; count: number }

  markRead: (clauseId: string, ratio?: number) => void
  toggleBookmark: (clauseId: string) => void
  setNote: (clauseId: string, text: string) => void
  saveQuizResult: (quizId: string, result: QuizResult) => void
  setFlashcardKnown: (term: string, known: boolean) => void
  touchStreak: () => void
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      progress: {},
      bookmarks: [],
      notes: {},
      quizResults: {},
      flashcardState: {},
      streak: { lastDate: '', count: 0 },

      markRead: (clauseId, ratio = 1) =>
        set((state) => {
          const prev = state.progress[clauseId] ?? { read: false, readRatio: 0 }
          return {
            progress: {
              ...state.progress,
              [clauseId]: { read: true, readRatio: Math.max(prev.readRatio, ratio) },
            },
          }
        }),

      toggleBookmark: (clauseId) =>
        set((state) => {
          const has = state.bookmarks.includes(clauseId)
          return {
            bookmarks: has
              ? state.bookmarks.filter((b) => b !== clauseId)
              : [...state.bookmarks, clauseId],
          }
        }),

      setNote: (clauseId, text) =>
        set((state) => ({ notes: { ...state.notes, [clauseId]: text } })),

      saveQuizResult: (quizId, result) =>
        set((state) => ({
          quizResults: { ...state.quizResults, [quizId]: result },
        })),

      setFlashcardKnown: (term, known) =>
        set((state) => ({
          flashcardState: { ...state.flashcardState, [term]: { known } },
        })),

      touchStreak: () =>
        set((state) => {
          const t = todayStr()
          if (state.streak.lastDate === t) return {}
          const count = state.streak.lastDate === yesterdayStr() ? state.streak.count + 1 : 1
          return { streak: { lastDate: t, count } }
        }),
    }),
    { name: 'iso13485-learning-store' },
  ),
)
