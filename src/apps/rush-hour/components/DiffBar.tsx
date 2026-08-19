import { PRESETS } from '../game/puzzles'
import type { DiffId } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell font-mono font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] max-[720px]:min-h-[2.35rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const DIFF_LABEL: Record<
  DiffId,
  | 'rushHour.diff.easy'
  | 'rushHour.diff.medium'
  | 'rushHour.diff.hard'
  | 'rushHour.diff.expert'
  | 'rushHour.diff.insane'
> = {
  easy: 'rushHour.diff.easy',
  medium: 'rushHour.diff.medium',
  hard: 'rushHour.diff.hard',
  expert: 'rushHour.diff.expert',
  insane: 'rushHour.diff.insane'
}

type DiffBarProps = {
  diffId: DiffId
  busy?: boolean
  onDiffChange: (id: DiffId) => void
}

export function DiffBar({ diffId, busy, onDiffChange }: DiffBarProps) {
  const { t } = useI18n()

  return (
    <section className="flex min-w-0 w-full flex-col gap-2 overflow-visible rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-2">
      <div className="flex items-center gap-2">
        <h2 className="m-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden">
          {t('rushHour.diff.title')}
        </h2>
        <HelpTip title={t('rushHour.diff.helpTitle')}>
          <p className="m-0">{t('rushHour.diff.helpBody')}</p>
        </HelpTip>
      </div>
      <div className="grid w-full grid-cols-5 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              btn,
              'min-w-0 truncate px-1 py-[0.4rem] text-center text-[0.75rem] max-[720px]:text-[0.82rem]',
              p.id === 'insane' &&
                'border-danger/45 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/20',
              diffId === p.id && btnActive,
              diffId === p.id &&
                p.id === 'insane' &&
                'border-danger bg-danger/25 text-[#ffd0d0]'
            )}
            title={t('rushHour.diff.applyTitle')}
            aria-busy={busy && diffId === p.id}
            onClick={() => onDiffChange(p.id)}
          >
            {t(DIFF_LABEL[p.id])}
          </button>
        ))}
      </div>
    </section>
  )
}
