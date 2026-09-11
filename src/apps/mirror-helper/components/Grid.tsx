import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Circle, X } from 'lucide-react'
import type { AxisId, AxisInfo, BoardCell, CellAspect } from '../solver/types'
import { CELL_ASPECTS } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { cellCornerClass } from '../../../shared/lib/cellCorner'
import {
  CELL_CONFLICT,
  CELL_SIZE_HOST,
  CELL_TIP_BEST,
  CELL_TIP_UNCLUED,
  MARK_CHANCE_TIP,
  WHY_HL
} from '../../../shared/lib/cellChrome'
import { AxisLines } from './AxisLines'

interface GridProps {
  width: number
  height: number
  cellAspect: CellAspect
  cells: BoardCell[]
  axes: AxisInfo[]
  onExplainAxis?: (id: AxisId) => void
  whyCells?: ReadonlySet<number>
  onCellClick: (index: number) => void
  onCellClear?: (index: number) => void
  cursorIndex?: number | null
  keyboardCursor?: boolean
}

const LONG_PRESS_MS = 450

export function Grid({
  width,
  height,
  cellAspect,
  cells,
  axes,
  onExplainAxis,
  whyCells,
  onCellClick,
  onCellClear,
  cursorIndex = null,
  keyboardCursor = false
}: GridProps) {
  const { t } = useI18n()
  const ratio = CELL_ASPECTS.find((a) => a.id === cellAspect)?.ratio ?? 1

  return (
    <div className="relative w-fit max-w-full">
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
        aria-label={t('mirrorHelper.grid.aria')}
        aria-colcount={width}
        aria-rowcount={height}
      >
        {cells.map((cell, i) => (
          <CellButton
            key={i}
            index={i}
            cell={cell}
            whyHighlight={whyCells?.has(i) ?? false}
            cornerClass={cellCornerClass(i, width, height)}
            onCellClick={onCellClick}
            onCellClear={onCellClear}
            cursorClass={
              keyboardCursor && cursorIndex === i ? WHY_HL.cursor : ''
            }
          />
        ))}
      </div>
      <AxisLines axes={axes} onExplainAxis={onExplainAxis} />
    </div>
  )
}

function CellButton({
  index,
  cell,
  whyHighlight,
  cornerClass,
  onCellClick,
  onCellClear,
  cursorClass
}: {
  index: number
  cell: BoardCell
  whyHighlight: boolean
  cornerClass?: string
  onCellClick: (index: number) => void
  onCellClear?: (index: number) => void
  cursorClass: string
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

  const title =
    cell.solver?.kind === 'probe'
      ? t('mirrorHelper.legend.probeBody')
      : cell.solver?.kind === 'hint' && cell.solver.probe
        ? t('mirrorHelper.legend.probeBody')
        : undefined

  return (
    <button
      type="button"
      className={cn(cellClass(cell), whyHighlight && CELL_CONFLICT, cursorClass, cornerClass)}
      title={title}
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
      {cellLabel(
        cell,
        t('mirrorHelper.legend.probeTag'),
        t('mirrorHelper.legend.uncluedTag')
      )}
    </button>
  )
}

const mineFill =
  'border-[color-mix(in_srgb,var(--color-mine)_70%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-mine)_32%,#1a2433)] font-bold text-[#dce6ff] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-mine)_40%,transparent)]'

const notFill =
  'border-[color-mix(in_srgb,var(--color-flag)_65%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_22%,#2a1520)] text-flag shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-flag)_35%,transparent)]'

const certainMine =
  'cell-solver-fill border-[rgba(45,180,110,0.95)] bg-[rgba(45,180,110,0.92)] font-bold text-white'

const certainNot =
  'cell-solver-fill border-[color-mix(in_srgb,var(--color-flag)_70%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_40%,#2a1520)] font-bold text-flag'

const hintMine =
  'border-[color-mix(in_srgb,var(--color-mine)_55%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-mine)_18%,var(--color-cell))] text-[#c8d6ff] opacity-90 [border-style:dashed]'

const hintNot =
  'border-[color-mix(in_srgb,var(--color-flag)_55%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_14%,var(--color-cell))] text-flag opacity-90 [border-style:dashed]'

function MineGlyph({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-[42%] w-[42%] items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]',
        className
      )}
      aria-hidden
    >
      <Circle className="block h-full w-full" fill="currentColor" strokeWidth={0} />
    </span>
  )
}

function NotGlyph({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-[48%] w-[48%] items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]',
        className
      )}
      aria-hidden
    >
      <X className="block h-full w-full" strokeWidth={3} />
    </span>
  )
}

function roleGlyph(mark: 'mine' | 'not', className?: string): ReactNode {
  if (mark === 'mine') return <MineGlyph className={className} />
  return <NotGlyph className={className} />
}

function cellClass(cell: BoardCell): string {
  const s = cell.solver
  const isProbe =
    s?.kind === 'probe' || (s?.kind === 'hint' && s.probe === true)
  return cn(
    'cell relative flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border border-line bg-cell p-0 font-mono font-semibold leading-none touch-manipulation select-none focus:outline-none focus-visible:outline-none',
    CELL_SIZE_HOST,
    cell.user.type === 'mine' && mineFill,
    cell.user.type === 'not' && notFill,
    s?.kind === 'certain' && s.mark === 'mine' && certainMine,
    s?.kind === 'certain' && s.mark === 'not' && certainNot,
    s?.kind === 'certain' && s.unclued && CELL_TIP_UNCLUED,
    s?.kind === 'hint' && s.mark === 'mine' && hintMine,
    s?.kind === 'hint' && s.mark === 'not' && hintNot,
    s?.kind === 'probe' &&
      'border-[color-mix(in_srgb,var(--color-best)_55%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-best)_14%,var(--color-cell))]',
    isProbe && CELL_TIP_BEST
  )
}

function cellLabel(
  cell: BoardCell,
  probeTag: string,
  uncluedTag: string
): ReactNode {
  if (cell.user.type === 'mine') return <MineGlyph />
  if (cell.user.type === 'not') return <NotGlyph />

  if (cell.solver?.kind === 'certain') {
    if (cell.solver.unclued) {
      return (
        <span className={MARK_CHANCE_TIP}>
          {roleGlyph(cell.solver.mark, 'h-[36%] w-[36%]')}
          <span className="px-[0.05em] text-center text-[0.4em] font-extrabold uppercase leading-[1.05] tracking-[0.01em] text-[#e0c4ff] min-[981px]:text-[0.55em]">
            {uncluedTag}
          </span>
        </span>
      )
    }
    return roleGlyph(cell.solver.mark)
  }
  if (cell.solver?.kind === 'hint') {
    const glyph = roleGlyph(cell.solver.mark, 'opacity-70 h-[42%] w-[42%]')
    if (!cell.solver.probe) return glyph
    return (
      <span className={MARK_CHANCE_TIP}>
        {glyph}
        <span className="px-[0.05em] text-center text-[0.4em] font-extrabold uppercase leading-[1.05] tracking-[0.01em] text-[#ffe566] min-[981px]:text-[0.55em]">
          {probeTag}
        </span>
      </span>
    )
  }
  if (cell.solver?.kind === 'probe') {
    return (
      <span className={MARK_CHANCE_TIP}>
        <span className="font-extrabold text-[#ffe566] [text-shadow:0_0_3px_rgba(0,0,0,0.85),0_1px_0_#000]">
          {cell.solver.expectedPercent}%
        </span>
        <span className="px-[0.05em] text-center text-[0.4em] font-extrabold uppercase leading-[1.05] tracking-[0.01em] text-[#ffe566] min-[981px]:text-[0.55em]">
          {probeTag}
        </span>
      </span>
    )
  }
  return ''
}
