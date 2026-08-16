import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Flag, X } from 'lucide-react'
import type { BoardCell, CellAspect, GoalMode } from '../solver/types'
import { CELL_ASPECTS } from '../solver/types'
import { colLabel } from '../solver/neighbors'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

interface GridProps {
  width: number
  height: number
  cellAspect: CellAspect
  cells: BoardCell[]
  onCellClick: (index: number) => void
  onCellClear?: (index: number) => void
  cursorIndex?: number | null
  /** When false, clicked cell has no sticky outline (hover still shows it). */
  keyboardCursor?: boolean
  showCoords?: boolean
  whyFocus?: number | null
  whyClues?: ReadonlySet<number>
  whyPeers?: ReadonlySet<number>
  /** safe = click safe tiles; mines = find targets */
  goalMode?: GoalMode
}

const LONG_PRESS_MS = 450

export function Grid({
  width,
  height,
  cellAspect,
  cells,
  onCellClick,
  onCellClear,
  cursorIndex = null,
  keyboardCursor = false,
  showCoords = false,
  whyFocus = null,
  whyClues,
  whyPeers,
  goalMode = 'safe'
}: GridProps) {
  const { t } = useI18n()
  const ratio = CELL_ASPECTS.find((a) => a.id === cellAspect)?.ratio ?? 1

  const board = (
    <div
      className="mine-grid"
      style={
        {
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          ['--cols' as string]: width,
          ['--rows' as string]: height,
          ['--cell-ar' as string]: ratio
        } as CSSProperties
      }
      role="grid"
      aria-label={t('grid.aria')}
      aria-colcount={width}
      aria-rowcount={height}
    >
      {cells.map((cell, i) => (
        <CellButton
          key={i}
          index={i}
          cell={cell}
          goalMode={goalMode}
          onCellClick={onCellClick}
          onCellClear={onCellClear}
          whyClass={whyClass(
            i,
            keyboardCursor ? cursorIndex : null,
            whyFocus,
            whyClues,
            whyPeers
          )}
        />
      ))}
    </div>
  )

  if (!showCoords) return board

  return (
    <div
      className="coord-board"
      style={
        {
          ['--cols' as string]: width,
          ['--rows' as string]: height,
          ['--cell-ar' as string]: ratio
        } as CSSProperties
      }
    >
      <div className="col-start-1 row-start-1" aria-hidden />
      <div
        className="col-start-2 row-start-1 grid items-end justify-items-center font-mono text-[0.7rem] font-bold text-muted"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`
        }}
        aria-hidden
      >
        {Array.from({ length: width }, (_, x) => (
          <span key={x}>{colLabel(x)}</span>
        ))}
      </div>
      <div
        className="col-start-1 row-start-2 grid items-center justify-items-end pr-[0.2rem] font-mono text-[0.7rem] font-bold text-muted"
        style={{
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`
        }}
        aria-hidden
      >
        {Array.from({ length: height }, (_, y) => (
          <span key={y}>{y + 1}</span>
        ))}
      </div>
      {board}
    </div>
  )
}

function whyClass(
  index: number,
  cursorIndex: number | null,
  whyFocus: number | null,
  whyClues?: ReadonlySet<number>,
  whyPeers?: ReadonlySet<number>
): string {
  // One ring only - priority: focus → clue → linked → keyboard cursor
  // Clue/linked sets are already filtered to the active Why step.
  if (whyFocus === index) return 'why-hl why-hl-focus'
  if (whyClues?.has(index)) return 'why-hl why-hl-clue'
  if (whyPeers?.has(index)) return 'why-hl why-hl-peer'
  if (cursorIndex === index) return 'why-hl why-hl-cursor'
  return ''
}

function CellButton({
  index,
  cell,
  goalMode,
  onCellClick,
  onCellClear,
  whyClass
}: {
  index: number
  cell: BoardCell
  goalMode: GoalMode
  onCellClick: (index: number) => void
  onCellClear?: (index: number) => void
  whyClass: string
}) {
  const { t } = useI18n()
  const timerRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const hint =
    cell.solver && 'whyHint' in cell.solver && cell.solver.whyHint
      ? cell.solver.whyHint
      : undefined

  return (
    <button
      type="button"
      className={cn(cellClass(cell, goalMode), whyClass)}
      style={cellStyle(cell, goalMode)}
      title={hint}
      onPointerDown={(e) => {
        if (!onCellClear) return
        if (e.pointerType === 'mouse' && e.button !== 0) return
        suppressClickRef.current = false
        clearTimer()
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null
          suppressClickRef.current = true
          onCellClear(index)
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
        onCellClick(index)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        if (!onCellClear) return
        suppressClickRef.current = true
        onCellClear(index)
      }}
      role="gridcell"
    >
      {cellLabel(cell, goalMode, {
        best: t('grid.best'),
        safest: t(goalMode === 'hunt' ? 'grid.surestTarget' : 'grid.safest')
      })}
    </button>
  )
}

const greenFill =
  'cell-solver-fill border-[rgba(45,180,110,0.95)] bg-[rgba(45,180,110,0.92)] font-bold text-white'
const flagFill =
  'border-[color-mix(in_srgb,var(--color-flag)_65%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_22%,#2a1520)] text-flag opacity-[0.92] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-flag)_35%,transparent)]'

function cellClass(cell: BoardCell, goalMode: GoalMode): string {
  const certainSafe = cell.solver?.kind === 'flagged'
  const certainMine = cell.solver?.kind === 'target'
  const user = cell.user
  const isNumber = user.type === 'number'
  // Avoid: Safe # (info role) uses primary blue. Hunt: Moje blue, Info teal.
  const primaryNumber =
    isNumber && (goalMode === 'safe' || user.role !== 'info')
  const infoNumber = isNumber && goalMode === 'hunt' && user.role === 'info'

  return cn(
    'cell relative flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border border-line bg-cell p-0 font-mono font-semibold leading-none touch-manipulation select-none focus:outline-none focus-visible:outline-none',
    isNumber && 'bg-[#364352] text-ink',
    infoNumber &&
      'border-info bg-[#0f4a48] font-bold text-[#e8fffc] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-info)_50%,transparent)]',
    primaryNumber &&
      'border-mine bg-[#2a4580] font-bold text-[#eef3ff] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-mine)_45%,transparent)]',
    cell.user.type === 'flagged' &&
      'border-[color-mix(in_srgb,var(--color-flag)_65%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_22%,#2a1520)] text-flag shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-flag)_35%,transparent)]',
    cell.user.type === 'blank' &&
      'border-[#5c6775] bg-[#3a424c] text-transparent shadow-[inset_0_0_0_1px_color-mix(in_srgb,#5c6775_40%,transparent)]',
    // Goal: safe → green=safe, flag=mine. Goal: mines → green=target, flag=do-not-click (safe).
    certainSafe && (goalMode === 'safe' ? greenFill : flagFill),
    certainMine && (goalMode === 'hunt' ? greenFill : flagFill),
    cell.solver?.kind === 'chance' &&
      'cell-solver-fill font-semibold [text-shadow:none]',
    cell.solver?.kind === 'chance' && cell.solver.best && 'cell-best',
    cell.solver?.kind === 'chance' &&
      cell.solver.safest &&
      !cell.solver.best &&
      'cell-safest',
    cell.solver?.kind === 'conflict' && 'cell-conflict'
  )
}

function cellStyle(
  cell: BoardCell,
  goalMode: GoalMode
): CSSProperties | undefined {
  if (cell.solver?.kind === 'chance') {
    const mineP = Math.min(1, Math.max(0, cell.solver.percent / 100))
    const fill = goalMode === 'hunt' ? mineP : 1 - mineP
    const borderAlpha = 0.2 + fill * 0.75
    const isBest = Boolean(cell.solver.best)
    const isSafest = Boolean(cell.solver.safest)

    if (isBest || isSafest) {
      return {
        backgroundColor: `rgba(45, 180, 110, ${fill * 0.92})`,
        borderColor: isBest ? 'var(--color-best)' : 'var(--color-safest)'
      }
    }

    return {
      backgroundColor: `rgba(45, 180, 110, ${fill * 0.92})`,
      color: `rgba(210, 245, 225, ${0.4 + fill * 0.45})`,
      borderColor: `rgba(45, 180, 110, ${borderAlpha})`
    }
  }
  return undefined
}

function cellLabel(
  cell: BoardCell,
  goalMode: GoalMode,
  tags: { best: string; safest: string }
): ReactNode {
  const avoidIcon = (
    <span
      className="flex h-[48%] w-[48%] items-center justify-center text-flag drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
      aria-hidden
    >
      {goalMode === 'hunt' ? (
        <X className="block h-full w-full" strokeWidth={3} />
      ) : (
        <Flag
          className="block h-full w-full"
          fill="currentColor"
          strokeWidth={1.5}
        />
      )}
    </span>
  )
  const ruledOutIcon = (
    <span className="cell-glyph font-bold text-[#c5ced8] drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]">
      <span>?</span>
    </span>
  )
  const mineIcon = (
    <span
      className="flex h-[48%] w-[48%] items-center justify-center text-flag drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
      aria-hidden
    >
      <Flag
        className="block h-full w-full"
        fill="currentColor"
        strokeWidth={1.5}
      />
    </span>
  )
  const sure100 = (
    <span className="mark-sure font-bold tracking-[-0.02em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
      100%
    </span>
  )

  // Certain SAFE - hunt mode: × = not your card
  if (cell.solver?.kind === 'flagged') {
    return goalMode === 'safe' ? sure100 : avoidIcon
  }
  // Certain MINE / target
  if (cell.solver?.kind === 'target') {
    return goalMode === 'hunt' ? sure100 : mineIcon
  }
  if (cell.solver?.kind === 'chance') {
    const showPercent =
      goalMode === 'hunt'
        ? Math.max(0, Math.min(100, cell.solver.percent))
        : Math.max(0, Math.min(100, 100 - cell.solver.percent))
    if (showPercent <= 0) return ''
    if (showPercent >= 100) return sure100
    // Prefer Interesting over Safest/Surest when both apply
    const isBest = Boolean(cell.solver.best)
    const isSafest = Boolean(cell.solver.safest) && !isBest
    const tag = isBest ? tags.best : isSafest ? tags.safest : null

    return (
      <span
        className={cn(
          'mark-chance relative flex flex-col items-center justify-center gap-[0.05em] tracking-[-0.02em] font-semibold opacity-[0.72]',
          (isBest || isSafest) && 'opacity-100'
        )}
      >
        <span
          className={cn(
            isBest &&
              'font-extrabold text-[#ffe566] [text-shadow:0_0_3px_rgba(0,0,0,0.85),0_1px_0_#000]',
            isSafest &&
              'font-extrabold text-[#ffb078] [text-shadow:0_0_3px_rgba(0,0,0,0.85),0_1px_0_#000]'
          )}
        >
          {showPercent}%
        </span>
        {tag && (
          <span
            className={cn(
              'px-[0.1em] text-center text-[0.48em] font-extrabold uppercase leading-[1.05] tracking-[0.02em]',
              isBest && 'text-[#ffe566]',
              isSafest && 'text-[#ffb078]'
            )}
          >
            {tag}
          </span>
        )}
      </span>
    )
  }
  if (cell.user.type === 'number') {
    return (
      <span className="cell-glyph">
        <span>{cell.user.value == null ? '?' : cell.user.value}</span>
      </span>
    )
  }
  if (cell.user.type === 'blank') {
    return goalMode === 'hunt' ? ruledOutIcon : ''
  }
  if (cell.user.type === 'flagged') {
    return avoidIcon
  }
  return ''
}
