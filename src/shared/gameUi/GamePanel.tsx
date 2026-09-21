import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * Shared panel chrome for game control strips.
 * Padding + radius stay in sync via --panel-* so nested buttons don’t pinch corners.
 */
export const gamePanel = cn(
  'flex min-w-0 w-full max-w-none flex-col gap-2 overflow-visible border border-line bg-panel shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]',
  '[--panel-radius:var(--radius-md)] [--panel-pad:0.5rem] [--panel-btn-r:max(2px,calc(var(--panel-radius)-var(--panel-pad)+2px))]',
  'rounded-[var(--panel-radius)] p-[var(--panel-pad)]',
  'max-[980px]:[--panel-pad:0.375rem]',
  'max-[980px]:landscape:[--panel-pad:0.2rem] max-[980px]:landscape:gap-[0.2rem]',
  'max-[480px]:portrait:[--panel-pad:0.2rem] max-[480px]:portrait:gap-[0.2rem]',
  'max-[980px]:landscape:[&_h2]:hidden max-[480px]:portrait:[&_h2]:hidden'
)

export const gamePanelTitle =
  'm-0 shrink-0 font-mono text-[0.65rem] font-medium tracking-[0.12em] text-muted uppercase max-[980px]:hidden [@media(max-height:700px)]:hidden'

export const gameBtn = cn(
  'rounded-[var(--panel-btn-r)]',
  'cursor-pointer appearance-none border border-line bg-cell font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40'
)

export const gameBtnActive = 'border-accent bg-accent/25 text-on-accent'

export const gameToolBtn = cn(
  gameBtn,
  'inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden px-2 py-1.5 text-sm max-[980px]:min-h-[2.5rem]'
)

export const gameDigitBtn = cn(
  gameBtn,
  'font-mono min-w-0 px-0 text-center',
  'h-9 text-[0.9rem] max-[980px]:h-12 max-[980px]:text-[1.15rem] min-[981px]:h-8 min-[981px]:text-[0.85rem]',
  'max-[980px]:landscape:h-[1.65rem] max-[980px]:landscape:min-h-[1.65rem] max-[980px]:landscape:py-0 max-[980px]:landscape:text-[0.78rem]',
  'max-[480px]:portrait:h-[1.75rem] max-[480px]:portrait:min-h-[1.75rem] max-[480px]:portrait:py-0 max-[480px]:portrait:text-[0.8rem]'
)

type GamePanelProps = {
  children?: ReactNode
  className?: string
  title?: string
  /** Extra header content (help, stats) beside optional title */
  headerRight?: ReactNode
}

export function GamePanel({
  children,
  className,
  title,
  headerRight
}: GamePanelProps) {
  const showHeader = title != null || headerRight != null
  return (
    <section className={cn(gamePanel, className)}>
      {showHeader ? (
        <div className="flex w-full min-w-0 items-center justify-between gap-2 leading-none">
          {title ? <h2 className={gamePanelTitle}>{title}</h2> : <span />}
          {headerRight}
        </div>
      ) : null}
      {children}
    </section>
  )
}
