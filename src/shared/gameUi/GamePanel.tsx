import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * Shared panel chrome for game control strips.
 * Padding + radius stay in sync via --panel-* so nested buttons don’t pinch corners.
 */
export const gamePanel = cn(
  'game-panel',
  'flex min-w-0 w-full max-w-none flex-col gap-2 overflow-visible border border-line bg-panel shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]'
)

export const gamePanelTitle =
  'm-0 shrink-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[980px]:hidden [@media(max-height:700px)]:hidden'

export const gameBtn = cn(
  'game-panel-btn',
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
  'h-9 text-[0.9rem] max-[980px]:h-12 max-[980px]:text-[1.15rem] min-[981px]:h-8 min-[981px]:text-[0.85rem]'
)

type GamePanelProps = {
  children: ReactNode
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
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          {title ? <h2 className={gamePanelTitle}>{title}</h2> : <span />}
          {headerRight}
        </div>
      ) : null}
      {children}
    </section>
  )
}
