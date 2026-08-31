import { type CSSProperties } from 'react'
import { Lightbulb } from 'lucide-react'
import type { BoardSize, GameStatus } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { cellCornerClass } from '../../../shared/lib/cellCorner'
import { CELL_SIZE_HOST } from '../../../shared/lib/cellChrome'

type GridProps = {
  size: BoardSize
  lights: boolean[]
  status: GameStatus
  selected: number | null
  hintIndex: number | null
  onPress: (index: number) => void
}

export function Grid({
  size,
  lights,
  status,
  selected,
  hintIndex,
  onPress
}: GridProps) {
  const { t } = useI18n()
  const ended = status === 'won'

  return (
    <div
      className="mine-grid"
      style={
        {
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          ['--cols' as string]: size,
          ['--rows' as string]: size,
          ['--cell-ar' as string]: 1
        } as CSSProperties
      }
      role="grid"
      aria-label={t('lightsOut.gridAria')}
      aria-colcount={size}
      aria-rowcount={size}
    >
      {lights.map((on, i) => (
        <button
          key={i}
          id={`lo-cell-${i}`}
          type="button"
          role="gridcell"
          aria-selected={selected === i}
          aria-pressed={on}
          aria-label={t(on ? 'lightsOut.cellOn' : 'lightsOut.cellOff', {
            r: Math.floor(i / size) + 1,
            c: (i % size) + 1
          })}
          disabled={ended}
          tabIndex={selected === i ? 0 : -1}
          className={cn(
            'cell relative flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border p-0 touch-manipulation select-none focus:outline-none focus-visible:outline-none',
            CELL_SIZE_HOST,
            cellCornerClass(i, size, size),
            on
              ? 'border-[#f0d45e]/70 bg-[#e8c84a] text-[#1a1808] shadow-[inset_0_0_0_1px_rgba(255,255,220,0.45),0_0_14px_color-mix(in_srgb,#e8c84a_55%,transparent)]'
              : 'border-[#5c6775] bg-[#2a323c] text-[#6a7380] shadow-[inset_0_0_0_1px_color-mix(in_srgb,#5c6775_40%,transparent)] hover:bg-cell-hover',
            selected === i &&
              'z-2 shadow-[inset_0_0_0_2px_#fff,0_0_10px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]',
            hintIndex === i &&
              'z-3 border-2! border-white! shadow-[inset_0_0_0_2px_#fff,0_0_16px_var(--color-accent)]',
            ended && 'cursor-default'
          )}
          onClick={(e) => {
            onPress(i)
            e.currentTarget.blur()
          }}
        >
          <Lightbulb
            className="h-[46%] w-[46%]"
            strokeWidth={on ? 0 : 2}
            fill={on ? 'currentColor' : 'none'}
            aria-hidden
          />
        </button>
      ))}
    </div>
  )
}
