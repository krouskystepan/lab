import { useEffect, useRef, useState } from 'react'
import { Delete } from 'lucide-react'
import { formatExpr, parseAnswer } from '../game/generate'
import { drillStats } from '../game/resultStats'
import type { BoardState, GameStatus, Question } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  DigitPad,
  GamePanel,
  gameBtn,
  gameDigitBtn
} from '../../../shared/gameUi'

export function StageStart({
  summary,
  onStart
}: {
  summary: string
  onStart: () => void
}) {
  const { t } = useI18n()
  return (
    <div
      className="flex w-full max-w-xl flex-col items-center gap-4 px-4 py-10"
      role="group"
      aria-label={t('mentalMath.stageAria')}
    >
      <p className="m-0 text-center text-[1.15rem] font-bold tracking-[-0.03em] text-ink">
        {summary}
      </p>
      <p className="m-0 text-center text-[0.9rem] text-muted">
        {t('mentalMath.startHint')}
      </p>
      <button
        type="button"
        className={cn(
          gameBtn,
          'h-11 px-5 text-[0.95rem] border-accent bg-accent font-bold text-on-accent hover:border-accent-hover hover:bg-accent-hover'
        )}
        onClick={onStart}
      >
        {t('mentalMath.start')}
      </button>
    </div>
  )
}

export function StageResult({ board }: { board: BoardState }) {
  const { t } = useI18n()
  const lost = board.status === 'lost'
  const stats = drillStats(board)
  const rows = [
    { n: stats.first, label: t('mentalMath.stats.first') },
    { n: stats.second, label: t('mentalMath.stats.second') },
    { n: stats.third, label: t('mentalMath.stats.third') },
    { n: stats.last, label: t('mentalMath.stats.last') },
    ...(stats.open > 0
      ? [{ n: stats.open, label: t('mentalMath.stats.open') }]
      : []),
    { n: stats.wrong, label: t('mentalMath.stats.wrong') }
  ]
  return (
    <div
      className="flex w-full max-w-[16rem] flex-col items-center gap-6 px-4 py-10"
      role="status"
      aria-label={t('mentalMath.score')}
    >
      <div className="flex flex-col items-center gap-2">
        <p
          className={cn(
            'm-0 text-center text-[0.95rem] font-semibold',
            lost ? 'text-danger' : 'text-[#4cbe6a]'
          )}
        >
          {lost ? t('mentalMath.status.timesUp') : t('mentalMath.status.done')}
        </p>
        <p className="m-0 text-center text-[2.6rem] font-bold tabular-nums leading-none tracking-[-0.04em] text-ink">
          {stats.pct}%
        </p>
        <p className="m-0 text-center text-[0.9rem] tabular-nums text-muted">
          {t('mentalMath.stats.summary', {
            solved: stats.solved,
            n: stats.total
          })}
        </p>
      </div>
      <ul className="m-0 flex w-full list-none flex-col gap-1.5 p-0">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between gap-4 text-[0.9rem]"
          >
            <span className="text-muted">{row.label}</span>
            <span className="font-semibold tabular-nums text-ink">{row.n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type StagePlayProps = {
  question: Question
  status: GameStatus
  onSubmit: (text: string) => void
}

export function StagePlay({ question, status, onSubmit }: StagePlayProps) {
  const { t } = useI18n()
  const locked = status === 'won' || status === 'lost'
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  const applyDraft = (value: string) => {
    setDraft(value)
    if (locked) return
    if (parseAnswer(value) === question.answer) onSubmit(value)
  }

  return (
    <div
      className="flex w-full max-w-xl flex-col items-center gap-4 px-2 py-3 min-[981px]:py-5"
      role="group"
      aria-label={t('mentalMath.stageAria')}
    >
      <p className="m-0 text-center text-[1.65rem] font-bold tabular-nums tracking-[-0.04em] text-ink min-[720px]:text-[2.2rem]">
        {formatExpr(question.expr)} =
      </p>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        disabled={locked}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-autocomplete="none"
        data-1p-ignore="true"
        data-lpignore="true"
        className="box-border mx-auto block h-10 min-h-10 w-full max-w-88 min-w-0 cursor-text appearance-none rounded-(--panel-btn-r) border border-line bg-cell px-3 text-center text-[1.15rem] font-semibold tabular-nums leading-none outline-none focus:border-accent disabled:cursor-text disabled:opacity-100"
        placeholder={t('mentalMath.type.placeholder')}
        aria-label={t('mentalMath.type.aria')}
        onChange={(e) => applyDraft(e.target.value)}
      />
      <div className="w-full min-[981px]:hidden">
        <GamePanel title={t('mentalMath.pad.title')}>
          <DigitPad
            digits={[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]}
            value={null}
            selectionActive={false}
            onSelect={(n) => {
              if (locked) return
              setDraft((prev) => {
                const value = `${prev}${n}`
                if (parseAnswer(value) === question.answer) onSubmit(value)
                return value
              })
            }}
            trailing={
              <button
                type="button"
                className={cn(gameDigitBtn, 'inline-flex items-center justify-center')}
                title={t('mentalMath.pad.back')}
                aria-label={t('mentalMath.pad.back')}
                disabled={locked}
                onClick={() => {
                  if (locked) return
                  setDraft((prev) => prev.slice(0, -1))
                }}
              >
                <Delete className="h-[1em] w-[1em]" aria-hidden />
              </button>
            }
          />
        </GamePanel>
      </div>
    </div>
  )
}
