export interface Clause {
  id: string
  number: string
  title: string
  level: number
  chapterId: string | null
  chapterTitle: string | null
  body: string[]
}

export interface Chapter {
  id: string
  number: string
  title: string
}

export interface Term {
  term: string
  definition: string
  number: string
  chapter: string
}

export interface Question {
  id: string
  chapter: string
  chapterTitle: string
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface QuizResult {
  score: number
  total: number
  wrong: string[]
  date: string
}
