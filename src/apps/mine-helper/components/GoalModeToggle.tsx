import { Shield, Target } from 'lucide-react'
import type { GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

interface GoalModeToggleProps {
  value: GoalMode
  onChange: (mode: GoalMode) => void
}

const chip =
  'inline-flex cursor-pointer appearance-none items-center gap-1 rounded-none border-0 px-[0.5rem] py-[0.28rem] text-[0.68rem] font-bold tracking-[0.02em] transition-[background,color] duration-100'

/** Segmented control: find safe tiles vs find targets. */
export function GoalModeToggle({ value, onChange }: GoalModeToggleProps) {
  const { t } = useI18n()

  return (
    <div
      className="inline-flex overflow-hidden rounded-sm border border-line bg-cell"
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
        <Shield className="h-3 w-3 shrink-0" aria-hidden />
        {t('goal.safe')}
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
        <Target className="h-3 w-3 shrink-0" aria-hidden />
        {t('goal.hunt')}
      </button>
    </div>
  )
}
