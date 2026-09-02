import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { HelpTip } from '../HelpTip'
import { cn } from '../lib/cn'
import { GamePanel } from './GamePanel'

export type MobileHelpSection = {
  title: string
  body: ReactNode
}

type MobileHelpCardProps = {
  /** Sections merged under one ? on phone/tablet. */
  sections: MobileHelpSection[]
  /**
   * `card` - full-width panel (default).
   * `inline` - just the ? control (e.g. header next to Legend).
   */
  variant?: 'card' | 'inline'
  className?: string
}

/**
 * One help control with all tips for ≤980px.
 * Desktop keeps the per-control HelpTips.
 */
export function MobileHelpCard({
  sections,
  variant = 'card',
  className
}: MobileHelpCardProps) {
  const { t } = useI18n()
  if (sections.length === 0) return null

  const label = t('help.menu')

  const tip = (
    <HelpTip title={label} show="always">
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <div key={section.title}>
            <strong className="mb-1 block text-[0.78rem] font-bold text-ink">
              {section.title}
            </strong>
            <div className="text-[0.72rem] font-medium leading-[1.4] text-muted">
              {section.body}
            </div>
          </div>
        ))}
      </div>
    </HelpTip>
  )

  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex min-[981px]:hidden h-[1.7rem] items-center',
          className
        )}
      >
        {tip}
      </span>
    )
  }

  return (
    <GamePanel className={cn('min-[981px]:hidden', className)}>
      <div className="flex w-full min-w-0 items-center gap-2">
        {tip}
        <span className="text-[0.85rem] font-semibold text-muted">{label}</span>
      </div>
    </GamePanel>
  )
}
