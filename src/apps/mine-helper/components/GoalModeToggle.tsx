import { Shield, Target } from 'lucide-react'
import type { GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

interface GoalModeToggleProps {
  value: GoalMode
  onChange: (mode: GoalMode) => void
}

const chip =
  'inline-flex min-w-0 cursor-pointer appearance-none items-center justify-center gap-1 rounded-none border-0 px-[0.45rem] py-[0.28rem] text-[0.68rem] font-bold tracking-[0.02em] transition-[background,color] duration-100 max-[980px]:min-h-[2.4rem] max-[980px]:px-1.5 max-[980px]:text-[0.75rem]'

/** Segmented control: find safe tiles vs find targets. */
export function GoalModeToggle({ value, onChange }: GoalModeToggleProps) {
  const { t } = useI18n()

  return (
    <div
      className="grid w-full min-w-0 grid-cols-2 overflow-hidden rounded-sm border border-line bg-cell min-[981px]:inline-flex min-[981px]:w-auto"
      role="group"
      aria-label={t('goal.aria')}
    >
      <button
        type="button"
        className={cn(
          chip,
          value === 'safe'
            ? 'bg-accent/30 text-on-accent'
            : 'text-muted hover:bg-cell-hover hover:text-ink'
        )}
        aria-pressed={value === 'safe'}
        title={t('goal.safeTip')}
        onClick={() => onChange('safe')}
      >
        <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{t('goal.safe')}</span>
      </button>
      <button
        type="button"
        className={cn(
          chip,
          value === 'hunt'
            ? 'bg-accent/30 text-on-accent'
            : 'text-muted hover:bg-cell-hover hover:text-ink'
        )}
        aria-pressed={value === 'hunt'}
        title={t('goal.huntTip')}
        onClick={() => onChange('hunt')}
      >
        <Target className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{t('goal.hunt')}</span>
      </button>
    </div>
  )
}
