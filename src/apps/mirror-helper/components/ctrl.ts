import { cn } from '../../../shared/lib/cn'
import { gameBtn, gameBtnActive } from '../../../shared/gameUi'

/** One control height everywhere in Mirror Helper panels. */
export const ctrl = cn(
  gameBtn,
  'inline-flex h-9 min-h-9 shrink-0 items-center justify-center gap-1.5 px-2.5 text-[0.8125rem] leading-none',
  'max-[980px]:h-10 max-[980px]:min-h-10'
)

export const ctrlActive = gameBtnActive

export const ctrlIcon = 'h-3.5 w-3.5 shrink-0'

/** Number inputs match `ctrl` height. */
export const ctrlInput = cn(
  'h-9 min-h-9 w-[3.25rem] shrink-0 rounded-[var(--panel-btn-r)] border border-line bg-cell px-1.5',
  'font-mono text-[0.8125rem] font-medium leading-none text-ink',
  'disabled:opacity-45 focus:outline focus:outline-offset-1 focus:outline-accent/70',
  'max-[980px]:h-10 max-[980px]:min-h-10'
)
