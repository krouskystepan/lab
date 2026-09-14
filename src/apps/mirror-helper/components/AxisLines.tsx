import type { AxisId, AxisInfo } from '../solver/types'
import { cn } from '../../../shared/lib/cn'

type AxisLinesProps = {
  axes: AxisInfo[]
  onExplainAxis?: (id: AxisId) => void
}

/** SVG mirror lines: bright = possible, alone when unique, muted dashed = impossible. */
export function AxisLines({ axes, onExplainAxis }: AxisLinesProps) {
  if (axes.length === 0) return null

  const possibleCount = axes.filter((a) => a.status === 'possible').length

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-4 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {axes.map((a) => {
        const possible = a.status === 'possible'
        const alone = possible && possibleCount === 1
        const pts = linePoints(a.id)
        const clickable = !possible && onExplainAxis != null
        return (
          <line
            key={a.id}
            x1={pts.x1}
            y1={pts.y1}
            x2={pts.x2}
            y2={pts.y2}
            className={cn(
              'transition-[stroke,stroke-opacity,stroke-width] duration-150',
              clickable && 'cursor-pointer',
              alone
                ? 'stroke-[color-mix(in_srgb,var(--color-accent)_92%,white)]'
                : possible
                  ? 'stroke-[color-mix(in_srgb,var(--color-accent)_78%,#fff)]'
                  : 'stroke-[color-mix(in_srgb,var(--color-muted)_55%,transparent)]'
            )}
            style={{ pointerEvents: clickable ? 'stroke' : 'none' }}
            strokeWidth={alone ? 2.4 : possible ? 1.6 : 1.1}
            strokeOpacity={alone ? 1 : possible ? 0.92 : 0.28}
            strokeDasharray={possible ? undefined : '3 2.5'}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            onClick={
              clickable
                ? (e) => {
                    e.stopPropagation()
                    onExplainAxis?.(a.id)
                  }
                : undefined
            }
          />
        )
      })}
    </svg>
  )
}

function linePoints(id: AxisId): {
  x1: number
  y1: number
  x2: number
  y2: number
} {
  switch (id) {
    case 'v':
      return { x1: 50, y1: 1, x2: 50, y2: 99 }
    case 'h':
      return { x1: 1, y1: 50, x2: 99, y2: 50 }
    case 'd-main':
      return { x1: 2, y1: 2, x2: 98, y2: 98 }
    case 'd-anti':
      return { x1: 98, y1: 2, x2: 2, y2: 98 }
  }
}
