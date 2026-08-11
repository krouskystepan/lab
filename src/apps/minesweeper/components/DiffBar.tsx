import { PRESETS, matchingDiff } from '../game/presets'
import type { DiffId } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell font-mono font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] max-[720px]:min-h-[2.35rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const DIFF_LABEL: Record<
  DiffId,
  | 'minesweeper.diff.beginner'
  | 'minesweeper.diff.intermediate'
  | 'minesweeper.diff.expert'
  | 'minesweeper.diff.crazy'
> = {
  beginner: 'minesweeper.diff.beginner',
  intermediate: 'minesweeper.diff.intermediate',
  expert: 'minesweeper.diff.expert',
  crazy: 'minesweeper.diff.crazy'
}

type DiffBarProps = {
  width: number
  height: number
  mines: number
  diffId: DiffId
  onDiffChange: (id: DiffId) => void
}

/** Single full-width strip - title + chips (like Helper NumberPad). */
export function DiffBar({
  width,
  height,
  mines,
  diffId,
  onDiffChange
}: DiffBarProps) {
  const { t } = useI18n()
  const activeDiff = matchingDiff(width, height, mines) ?? diffId
  const densityMatches = matchingDiff(width, height, mines) != null

  return (
    <section className="flex h-full min-w-0 w-full flex-1 flex-row items-center gap-2 overflow-visible rounded-md border border-line bg-panel px-2.5 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-[0.45rem]">
      <h2 className="m-0 shrink-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden">
        {t('minesweeper.diff.title')}
      </h2>
      <HelpTip title={t('minesweeper.diff.helpTitle')}>
        <p className="m-0">{t('minesweeper.diff.helpBody')}</p>
      </HelpTip>
      <div className="flex min-w-0 w-full flex-1 flex-nowrap items-center gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              btn,
              'min-w-0 flex-1 basis-0 px-1 py-[0.28rem] text-[0.72rem] max-[720px]:text-[0.9rem]',
              p.id === 'crazy' && 'uppercase tracking-[0.04em]',
              densityMatches && activeDiff === p.id && btnActive
            )}
            title={t('minesweeper.diff.applyTitle')}
            onClick={() => onDiffChange(p.id)}
          >
            {t(DIFF_LABEL[p.id])}
          </button>
        ))}
      </div>
    </section>
  )
}
