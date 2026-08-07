import type { ReactNode } from 'react'
import { cn } from '../../../shared/lib/cn'

export type LegendMarkKind =
  | 'sure'
  | 'best'
  | 'safest'
  | 'surestTarget'
  | 'chance'
  | 'mine'
  | 'info'
  | 'flag'
  | 'safe'

const MARK_CLASS: Record<LegendMarkKind, string> = {
  sure: 'inline font-bold text-[color-mix(in_srgb,var(--color-accent)_85%,white)]',
  best: 'inline font-bold text-[color-mix(in_srgb,var(--color-best)_88%,white)]',
  safest: 'inline font-bold text-[color-mix(in_srgb,var(--color-safest)_88%,white)]',
  surestTarget:
    'inline font-bold text-[color-mix(in_srgb,var(--color-safest)_88%,white)]',
  chance: 'inline font-bold text-[color-mix(in_srgb,var(--color-accent)_70%,white)]',
  mine: 'inline font-bold text-[color-mix(in_srgb,var(--color-mine)_80%,white)]',
  info: 'inline font-bold text-[color-mix(in_srgb,var(--color-info)_80%,white)]',
  flag: 'inline font-bold text-[color-mix(in_srgb,var(--color-flag)_80%,white)]',
  safe: 'inline font-bold text-[#b8c4d4]'
}

/** Colored inline label matching a legend swatch. */
export function LegendMark({
  kind,
  children
}: {
  kind: LegendMarkKind
  children: ReactNode
}) {
  return <span className={cn(MARK_CLASS[kind])}>{children}</span>
}

export const LEGEND_TITLE_CLASS: Partial<Record<string, string>> = {
  mine: MARK_CLASS.mine,
  info: MARK_CLASS.info,
  flag: MARK_CLASS.flag,
  blank: MARK_CLASS.safe,
  sure: MARK_CLASS.sure,
  chance: MARK_CLASS.chance,
  best: MARK_CLASS.best,
  safest: MARK_CLASS.safest,
  surestTarget: MARK_CLASS.surestTarget
}
