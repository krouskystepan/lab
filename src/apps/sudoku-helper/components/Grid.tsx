import type { CSSProperties, ReactNode } from 'react'
import { boxOf, colOf, rowOf } from '../../sudoku/game/board'
import type { BoardCell } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

type GridProps = {
  cells: BoardCell[]
  selected: number | null
  highlightDigit: number | null
  onSelect: (index: number) => void
}

export function Grid({
  cells,
  selected,
  highlightDigit,
  onSelect
}: GridProps) {
  const { t } = useI18n()
  const selectedValue =
    selected != null ? cells[selected]?.user.value || 0 : 0
  const selectedBox = selected != null ? boxOf(selected) : -1
  const selectedRow = selected != null ? rowOf(selected) : -1
  const selectedCol = selected != null ? colOf(selected) : -1

  return (
    <div
      className="mine-grid sudoku-grid"
      style={
        {
          gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
          ['--cols' as string]: 9,
          ['--rows' as string]: 9,
          ['--cell-ar' as string]: 1
        } as CSSProperties
      }
      role="grid"
      aria-label={t('sudokuHelper.gridAria')}
      aria-colcount={9}
      aria-rowcount={9}
    >
      {cells.map((cell, i) => (
        <CellButton
          key={i}
          index={i}
          cell={cell}
          selected={selected === i}
          peerHighlight={
            selected != null &&
            (rowOf(i) === selectedRow ||
              colOf(i) === selectedCol ||
              boxOf(i) === selectedBox)
          }
          sameDigit={
            cell.user.value !== 0 &&
            (cell.user.value === selectedValue ||
              cell.user.value === highlightDigit)
          }
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function CellButton({
  index,
  cell,
  selected,
  peerHighlight,
  sameDigit,
  onSelect
}: {
  index: number
  cell: BoardCell
  selected: boolean
  peerHighlight: boolean
  sameDigit: boolean
  onSelect: (index: number) => void
}) {
  const r = rowOf(index)
  const c = colOf(index)
  const mark = cell.solver
  const isSingle = mark?.single != null
  const isConflict = mark?.conflict === true

  return (
    <button
      type="button"
      className={cn(
        'cell relative flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border border-line bg-cell p-0 font-mono font-semibold leading-none touch-manipulation select-none focus:outline-none focus-visible:outline-none',
        // Internal 3×3 band lines only (outer edge is .sudoku-grid border)
        r > 0 && r % 3 === 0 && 'border-t-2 border-t-[#5c6a7a]',
        c > 0 && c % 3 === 0 && 'border-l-2 border-l-[#5c6a7a]',
        peerHighlight && !selected && 'bg-[#323c48]',
        sameDigit && !selected && 'bg-accent/20',
        selected && 'bg-accent/35 shadow-[inset_0_0_0_2px_var(--color-accent)]',
        isConflict && 'bg-danger/30 text-[#ffb0b0]',
        isSingle &&
          !isConflict &&
          'bg-accent/25 shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--color-accent)_55%,transparent)]',
        cell.user.value !== 0 && !isConflict && 'text-ink'
      )}
      aria-selected={selected}
      role="gridcell"
      onClick={() => onSelect(index)}
    >
      {cellContent(cell)}
    </button>
  )
}

function cellContent(cell: BoardCell): ReactNode {
  if (cell.user.value !== 0) {
    return <span className="cell-glyph">{cell.user.value}</span>
  }
  const mark = cell.solver
  if (!mark) return null
  if (mark.single) {
    return (
      <span className="cell-glyph text-accent">{mark.single.digit}</span>
    )
  }
  if (mark.candidates.length === 0) return null
  const set = new Set(mark.candidates)
  return (
    <span className="sudoku-notes" aria-hidden>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <span key={d} className={cn(!set.has(d) && 'invisible')}>
          {d}
        </span>
      ))}
    </span>
  )
}
