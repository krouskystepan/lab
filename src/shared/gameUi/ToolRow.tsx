import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

type ToolRowProps = {
  children: ReactNode
  className?: string
  /** Default / phone columns. */
  mobileCols?: 2 | 3 | 4 | 5
  /** Desktop columns from 981px up. */
  desktopCols?: 4 | 5 | 6 | 8 | 10
}

/**
 * Equal-width tool button grid.
 * Base `grid-cols-*` always applies; desktop only widens the track count.
 */
export function ToolRow({
  children,
  className,
  mobileCols = 5,
  desktopCols = 8
}: ToolRowProps) {
  return (
    <div
      className={cn(
        'grid w-full min-w-0 gap-1.5',
        mobileCols === 2 && 'grid-cols-2',
        mobileCols === 3 && 'grid-cols-3',
        mobileCols === 4 && 'grid-cols-4',
        mobileCols === 5 && 'grid-cols-5',
        desktopCols === 4 && 'min-[981px]:grid-cols-4',
        desktopCols === 5 && 'min-[981px]:grid-cols-5',
        desktopCols === 6 && 'min-[981px]:grid-cols-6',
        desktopCols === 8 && 'min-[981px]:grid-cols-8',
        desktopCols === 10 && 'min-[981px]:grid-cols-10',
        className
      )}
    >
      {children}
    </div>
  )
}
