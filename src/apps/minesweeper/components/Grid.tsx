import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Bomb, Flag } from 'lucide-react'
import type { Cell, PointerMode } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { cellCornerClass } from '../../../shared/lib/cellCorner'

const LONG_PRESS_MS = 450

const NUMBER_COLORS: Record<number, string> = {
  1: '#6eb6ff',
  2: '#5fd68a',
  3: '#ff7b7b',
  4: '#b794f4',
  5: '#f0a060',
  6: '#5ecfcf',
  7: '#e8e8e8',
  8: '#a0a8b4'
}

type GridProps = {
  width: number
  height: number
  cells: Cell[]
  status: 'ready' | 'playing' | 'won' | 'lost'
  hitIndex: number | null
  mode: PointerMode
  onReveal: (index: number) => void
  onFlag: (index: number) => void
  onChord: (index: number) => void
}

export function Grid({
  width,
  height,
  cells,
  status,
  hitIndex,
  mode,
  onReveal,
  onFlag,
  onChord
}: GridProps) {
  const { t } = useI18n()
  const ended = status === 'won' || status === 'lost'

  return (
    <div
      className="mine-grid"
      style={
        {
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          ['--cols' as string]: width,
          ['--rows' as string]: height,
          ['--cell-ar' as string]: 1
        } as CSSProperties
      }
      role="grid"
      aria-label={t('minesweeper.gridAria')}
      aria-colcount={width}
      aria-rowcount={height}
    >
      {cells.map((cell, i) => (
        <CellButton
          key={i}
          index={i}
          cell={cell}
          ended={ended}
          isHit={hitIndex === i}
          mode={mode}
          cornerClass={cellCornerClass(i, width, height)}
          onReveal={onReveal}
          onFlag={onFlag}
          onChord={onChord}
        />
      ))}
    </div>
  )
}

function CellButton({
  index,
  cell,
  ended,
  isHit,
  mode,
  cornerClass,
  onReveal,
  onFlag,
  onChord
}: {
  index: number
  cell: Cell
  ended: boolean
  isHit: boolean
  mode: PointerMode
  cornerClass?: string
  onReveal: (index: number) => void
  onFlag: (index: number) => void
  onChord: (index: number) => void
}) {
  const timerRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const primary = mode === 'flag' ? onFlag : onReveal
  const secondary = mode === 'flag' ? onReveal : onFlag
  const canChord =
    !ended &&
    cell.view === 'revealed' &&
    !cell.isMine &&
    cell.adjacent > 0
  const canInteract = !ended && cell.view !== 'revealed'

  return (
    <button
      type="button"
      className={cn(cellClass(cell, isHit), cornerClass)}
      style={cellStyle(cell)}
      disabled={ended && cell.view !== 'revealed' && !cell.isMine}
      onPointerDown={(e) => {
        if (!canInteract) return
        if (e.pointerType === 'mouse' && e.button !== 0) return
        suppressClickRef.current = false
        clearTimer()
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null
          suppressClickRef.current = true
          secondary(index)
          try {
            navigator.vibrate?.(12)
          } catch {
            /* ignore */
          }
        }, LONG_PRESS_MS)
      }}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
      onClick={() => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false
          return
        }
        if (canChord) {
          onChord(index)
          return
        }
        if (!canInteract) return
        primary(index)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        if (!canInteract) return
        suppressClickRef.current = true
        secondary(index)
      }}
      role="gridcell"
    >
      {cellLabel(cell, isHit)}
    </button>
  )
}

function cellClass(cell: Cell, isHit: boolean): string {
  const base =
    'cell relative flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border border-line bg-cell p-0 font-mono font-semibold leading-none touch-manipulation select-none focus:outline-none focus-visible:outline-none'

  if (cell.view === 'flagged') {
    return cn(
      base,
      'border-[color-mix(in_srgb,var(--color-flag)_65%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_22%,#2a1520)] text-flag shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-flag)_35%,transparent)]'
    )
  }

  if (cell.view === 'hidden') {
    return cn(
      base,
      'border-[#5c6775] bg-[#3a424c] text-transparent shadow-[inset_0_0_0_1px_color-mix(in_srgb,#5c6775_40%,transparent)] hover:bg-cell-hover'
    )
  }

  // revealed
  if (cell.isMine) {
    return cn(
      base,
      'cursor-default border-danger/55 bg-danger/25 text-[#ffb0b0]',
      isHit && 'bg-danger/55 border-danger'
    )
  }

  return cn(
    base,
    'cursor-pointer border-line/60 bg-[#2a323c] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]',
    cell.adjacent === 0 && 'cursor-default'
  )
}

function cellStyle(cell: Cell): CSSProperties | undefined {
  if (cell.view === 'revealed' && !cell.isMine && cell.adjacent > 0) {
    return { color: NUMBER_COLORS[cell.adjacent] ?? '#e8eef5' }
  }
  return undefined
}

function cellLabel(cell: Cell, isHit: boolean): ReactNode {
  if (cell.view === 'flagged') {
    return (
      <span className="cell-glyph">
        <Flag
          className="h-[55%] w-[55%]"
          fill="currentColor"
          strokeWidth={1.5}
          aria-hidden
        />
      </span>
    )
  }
  if (cell.view !== 'revealed') return null
  if (cell.isMine) {
    return (
      <span className="cell-glyph">
        <Bomb
          className={cn('h-[55%] w-[55%]', isHit && 'text-white')}
          strokeWidth={2.25}
          aria-hidden
        />
      </span>
    )
  }
  if (cell.adjacent === 0) return null
  return <span className="cell-glyph">{cell.adjacent}</span>
}
