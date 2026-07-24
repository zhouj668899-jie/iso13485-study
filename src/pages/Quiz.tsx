import { useMemo, useState } from 'react'
import quizzes from '../data/quizzes.json'
import type { Question } from '../lib/types'
import { useStore } from '../store/useStore'
import { SectionLabel, GradientPillButton, ProgressRing } from '../components/ui'

const all = quizzes as Question[]
const chapterMap = new Map<string, string>()
all.forEach((q) => chapterMap.set(q.chapter, q.chapterTitle))

type Step = 'select' | 'play' | 'result'

export default function Quiz() {
  const [step, setStep] = useState<Step>('select')
  const [scope, setScope] = useState<string>('all')
  const [pool, setPool] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, { sel: number; correct: boolean }>>({})
  const [result, setResult] = useState<{ score: number; total: number; wrong: string[] } | null>(null)

  const saveQuizResult = useStore((s) => s.saveQuizResult)
  const touchStreak = useStore((s) => s.touchStreak)

  const chapters = useMemo(() => Array.from(chapterMap.entries()), [])

  function start(scopeKey: string, qs: Question[]) {
    setScope(scopeKey)
    setPool(qs)
    setIdx(0)
    setSelected(null)
    setAnswers({})
    setResult(null)
    setStep('play')
  }

  function submitAnswer() {
    if (selected === null) return
    const q = pool[idx]
    const correct = selected === q.answer
    setAnswers((a) => ({ ...a, [q.id]: { sel: selected, correct } }))
  }

  function finish() {
    const total = pool.length
    const wrong: string[] = []
    let score = 0
    pool.forEach((q) => {
      const a = answers[q.id]
      if (a?.correct) score++
      else if (a) wrong.push(q.id)
    })
    const res = { score, total, wrong, date: new Date().toISOString() }
    setResult(res)
    saveQuizResult(scope, res)
    touchStreak()
    setStep('result')
  }

  function next() {
    if (idx < pool.length - 1) {
      setIdx(idx + 1)
      setSelected(null)
    } else {
      finish()
    }
  }

  if (step === 'select') {
    return (
      <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">
        <SectionLabel>自测评估</SectionLabel>
        <h1 className="display-h2 mt-3 mb-8">选择测验范围</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => start('all', all)} className="surface-card text-left hover:!bg-[#004a45] transition-colors">
            <h3 className="text-xl font-medium text-platinum">全套测验</h3>
            <p className="text-silver-mist text-[14px] mt-2">全部 {all.length} 题，覆盖标准 8 章核心要求。</p>
          </button>
          {chapters.map(([num, title]) => {
            const qs = all.filter((q) => q.chapter === num)
            return (
              <button
                key={num}
                onClick={() => start('ch' + num, qs)}
                className="surface-card text-left hover:!bg-[#004a45] transition-colors"
              >
                <div className="text-liquid-mist/70 text-[12px]">{num}</div>
                <h3 className="text-xl font-medium text-platinum mt-1">{title}</h3>
                <p className="text-silver-mist text-[14px] mt-2">{qs.length} 题</p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (step === 'play') {
    const q = pool[idx]
    const answered = answers[q.id] !== undefined
    const pct = (idx + (answered ? 1 : 0)) / pool.length
    return (
      <div className="max-w-[820px] mx-auto px-6 pt-28 pb-24">
        <SectionLabel>自测 · {q.chapterTitle}</SectionLabel>
        <div className="flex items-center justify-between mb-6">
          <span className="eyebrow">第 {idx + 1} / {pool.length} 题</span>
          <div className="w-40 h-1.5 bg-liquid-deep rounded-full overflow-hidden">
            <div className="h-full bg-[#00827c]" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>

        <div className="surface-card !p-8">
          <h2 className="text-2xl font-medium text-platinum leading-snug">{q.question}</h2>
          <div className="mt-6 space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'border border-liquid-deep bg-liquid-deep/40'
              if (answered) {
                if (i === q.answer) cls = 'border-[#00827c] bg-[#00827c]/20'
                else if (i === selected) cls = 'border-[#fde9ff] bg-[#fde9ff]/10'
              } else if (i === selected) cls = 'border-lavender-phosphor bg-liquid-kelp'
              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left px-4 py-3 rounded-md text-[15px] text-silver-mist transition-colors ${cls}`}
                >
                  <span className="text-liquid-mist/70 mr-3">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          {answered ? (
            <div className="mt-6">
              <div className={`text-[15px] mb-3 ${answers[q.id].correct ? 'text-[#9afff0]' : 'text-lavender-phosphor'}`}>
                {answers[q.id].correct ? '✓ 回答正确' : `✗ 正确答案：${String.fromCharCode(65 + q.answer)}`}
              </div>
              <p className="text-silver-mist text-[14px] leading-relaxed whitespace-pre-line bg-liquid-deep/50 rounded-md p-4">
                {q.explanation}
              </p>
              <GradientPillButton onClick={next} className="mt-5">
                {idx < pool.length - 1 ? '下一题 →' : '查看结果'}
              </GradientPillButton>
            </div>
          ) : (
            <button onClick={submitAnswer} disabled={selected === null} className="btn-kelp mt-6 disabled:opacity-40">
              提交答案
            </button>
          )}
        </div>
      </div>
    )
  }

  // result
  if (result) {
    const passRate = result.total > 0 ? result.score / result.total : 0
    const wrongQs = all.filter((q) => result.wrong.includes(q.id))
    return (
      <div className="max-w-[820px] mx-auto px-6 pt-28 pb-24">
        <SectionLabel>测验结果</SectionLabel>
        <div className="surface-card !p-10 text-center">
          <ProgressRing value={passRate} size={160} stroke={12} />
          <h2 className="display-h2 mt-6">
            得分 {result.score} / {result.total}
          </h2>
          <p className="text-silver-mist mt-3">
            {passRate >= 0.8 ? '掌握扎实，继续保持 🎯' : passRate >= 0.6 ? '基本达标，再巩固薄弱点' : '建议回到对应章节重点复习'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <GradientPillButton onClick={() => start(scope, pool)}>重新测验</GradientPillButton>
            {wrongQs.length > 0 && (
              <button onClick={() => start('wrong', wrongQs)} className="btn-kelp">
                错题重练（{wrongQs.length}）
              </button>
            )}
            <button onClick={() => setStep('select')} className="btn-kelp">
              返回选择
            </button>
          </div>
        </div>

        {wrongQs.length > 0 && (
          <div className="mt-8">
            <h3 className="eyebrow mb-3">错题回顾</h3>
            <div className="space-y-3">
              {wrongQs.map((q) => (
                <div key={q.id} className="surface-card !p-5">
                  <div className="text-platinum text-[15px]">{q.question}</div>
                  <p className="text-silver-mist text-[13px] mt-2 leading-relaxed whitespace-pre-line">{q.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
