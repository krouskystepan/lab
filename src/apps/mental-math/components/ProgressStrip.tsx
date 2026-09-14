import { useEffect, useRef } from 'react'
import { formatExpr } from '../game/generate'
import type { Question } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

type ProgressStripProps = {
  questions: Question[]
  index: number
  picked: (string | null)[]
  misses: string[][]
  roundId: string
  onGoto: (index: number) => void
}

export function ProgressStrip({
  questions,
  index,
  picked,
  misses,
  roundId,
  onGoto
}: ProgressStripProps) {
  const { t } = useI18n()
  const listRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLButtonElement>(null)
  const done = picked.filter((p) => p != null).length
  const open = questions.length - done

  useEffect(() => {
    const root = listRef.current
    const el = currentRef.current
    if (!root) return
    root.scrollLeft = 0
    if (!el) return
    const rootRect = root.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - rootRect.top + root.scrollTop
    const bottom = top + elRect.height
    if (top < root.scrollTop) root.scrollTop = top
    else if (bottom > root.scrollTop + root.clientHeight) {
      root.scrollTop = bottom - root.clientHeight
    }
  }, [index, roundId])

  if (questions.length === 0) return null

  return (
    <div className="flex w-full shrink-0 flex-col gap-1 border-t border-line px-1 pt-1.5">
      <p className="m-0 text-center text-[0.72rem] font-semibold text-muted">
        {t('mentalMath.progress.summary', { done, open, n: questions.length })}
      </p>
      <div
        key={roundId}
        ref={listRef}
        className="grid max-h-36 grid-cols-[repeat(auto-fill,minmax(2.35rem,1fr))] items-start gap-1 overflow-x-hidden overflow-y-auto p-0.5 min-[520px]:max-h-40"
        role="list"
        aria-label={t('mentalMath.progress.aria')}
      >
        {questions.map((q, i) => {
          const expr = formatExpr(q.expr)
          const ok = picked[i] != null
          const tried = (misses[i] ?? []).length > 0
          const current = i === index
          return (
            <button
              key={`${roundId}-${i}`}
              ref={current ? currentRef : undefined}
              type="button"
              role="listitem"
              title={t('mentalMath.progress.itemTitle', {
                n: i + 1,
                expr,
                state: ok
                  ? t('mentalMath.progress.done')
                  : tried
                    ? t('mentalMath.progress.tried')
                    : t('mentalMath.progress.open')
              })}
              aria-current={current ? 'true' : undefined}
              aria-label={`${i + 1}`}
              className={cn(
                'relative flex aspect-square w-full items-center justify-center self-start overflow-hidden border bg-elevated p-0 font-mono text-[0.72rem] font-bold leading-none tabular-nums disabled:cursor-default disabled:opacity-100',
                ok
                  ? 'border-2 border-[#4cbe6a] text-[#c8f5d4]'
                  : tried
                    ? 'border-danger/80 text-ink'
                    : 'border-line text-ink',
                current && 'ring-2 ring-accent/70',
                !ok && !tried && !current && 'opacity-70'
              )}
              disabled={ok}
              onClick={() => {
                if (ok) return
                onGoto(i)
              }}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
