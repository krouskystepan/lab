import { useEffect, useState } from 'react'
import { PRESETS, clampDots } from '../game/generate'
import type { DiffId } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel, gameBtn, gameBtnActive } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const dotInput = cn(
  gameBtn,
  'w-12 shrink-0 cursor-text px-0 text-center font-mono text-[0.85rem] text-ink tabular-nums outline-none',
  'min-h-[2.35rem] max-[980px]:min-h-[2.35rem] max-[980px]:text-[0.9rem]',
  'active:scale-100 focus:border-accent',
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
)

const DIFF_LABEL: Record<
  DiffId,
  | 'untangle.diff.easy'
  | 'untangle.diff.medium'
  | 'untangle.diff.hard'
  | 'untangle.diff.expert'
  | 'untangle.diff.insane'
> = {
  easy: 'untangle.diff.easy',
  medium: 'untangle.diff.medium',
  hard: 'untangle.diff.hard',
  expert: 'untangle.diff.expert',
  insane: 'untangle.diff.insane'
}

type DiffBarProps = {
  count: number
  onDiffChange: (id: DiffId) => void
  onCount: (n: number) => void
}

export function DiffBar({ count, onDiffChange, onCount }: DiffBarProps) {
  const { t } = useI18n()
  const [draft, setDraft] = useState(String(count))

  useEffect(() => {
    setDraft(String(count))
  }, [count])

  const commit = () => {
    const parsed = Number(draft)
    if (!Number.isFinite(parsed)) {
      setDraft(String(count))
      return
    }
    const next = clampDots(parsed)
    setDraft(String(next))
    if (next !== count) onCount(next)
  }

  return (
    <GamePanel
      title={t('untangle.diff.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('untangle.diff.helpTitle')}>
          <p className="m-0">{t('untangle.diff.helpBody')}</p>
        </HelpTip>
      }
    >
      <div className="flex w-full min-w-0 items-stretch gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              gameBtn,
              'min-w-0 flex-1 truncate px-1 py-[0.4rem] text-center text-[0.8rem] max-[980px]:min-h-[2.35rem] max-[980px]:text-[0.9rem]',
              p.id === 'insane' &&
                'border-danger/45 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/20',
              count === p.n && gameBtnActive,
              count === p.n && p.id === 'insane' && 'border-danger bg-danger/25 text-[#ffd0d0]'
            )}
            title={t('untangle.diff.applyTitle')}
            onClick={() => onDiffChange(p.id)}
          >
            {t(DIFF_LABEL[p.id])}
          </button>
        ))}
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          className={cn(dotInput, !PRESETS.some((p) => p.n === count) && gameBtnActive)}
          aria-label={t('untangle.diff.dotsTitle')}
          title={t('untangle.diff.dotsTitle')}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
              return
            }
            const dir =
              e.key === 'ArrowUp' || e.key === 'ArrowRight'
                ? 1
                : e.key === 'ArrowDown' || e.key === 'ArrowLeft'
                  ? -1
                  : 0
            if (!dir) return
            e.preventDefault()
            const base = Number(draft)
            const next = clampDots((Number.isFinite(base) ? base : count) + dir)
            setDraft(String(next))
            if (next !== count) onCount(next)
          }}
        />
      </div>
    </GamePanel>
  )
}
