import type { CSSProperties, ReactNode } from 'react'
import { boxOf, colOf, hasNote, notesFromMask, rowOf } from '../game/board'
import { cellConflicts } from '../game/engine'
import type { BoardState, Cell } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  CELL_GLYPH,
  CELL_GLYPH_INNER,
  SUDOKU_CELL,
  SUDOKU_NOTES
} from '../../../shared/lib/cellChrome'

type GridProps = {
  board: BoardState
  selected: number | null
  highlightDigit: number | null
  /** Indices flagged by Check as wrong vs the solution. */
  mistakes?: ReadonlySet<number>
  onSelect: (index: number) => void
}

export function Grid({
  board,
  selected,
  highlightDigit,
  mistakes,
  onSelect
}: GridProps) {
  const { t } = useI18n()
  const selectedValue =
    selected != null ? board.cells[selected]?.value || 0 : 0
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
      aria-label={t('sudoku.gridAria')}
      aria-colcount={9}
      aria-rowcount={9}
    >
      {board.cells.map((cell, i) => (
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
            (cell.value !== 0 && cell.value === selectedValue) ||
            (highlightDigit != null &&
              cell.value !== 0 &&
              cell.value === highlightDigit) ||
            (highlightDigit != null &&
              cell.value === 0 &&
              hasNote(cell.notes, highlightDigit))
          }
          conflict={cellConflicts(board, i)}
          mistake={mistakes?.has(i) === true}
          ended={board.status === 'won'}
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
  conflict,
  mistake,
  ended,
  onSelect
}: {
  index: number
  cell: Cell
  selected: boolean
  peerHighlight: boolean
  sameDigit: boolean
  conflict: boolean
  mistake: boolean
  ended: boolean
  onSelect: (index: number) => void
}) {
  const r = rowOf(index)
  const c = colOf(index)

  return (
    <button
      type="button"
      className={cn(
        'cell relative flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border border-line bg-cell p-0 font-mono font-semibold leading-none touch-manipulation select-none focus:outline-none focus-visible:outline-none',
        SUDOKU_CELL,
        // Internal 3×3 band lines only (outer edge is .sudoku-grid border)
        r > 0 && r % 3 === 0 && 'border-t-2 border-t-[#5c6a7a]',
        c > 0 && c % 3 === 0 && 'border-l-2 border-l-[#5c6a7a]',
        peerHighlight && !selected && 'bg-[#323c48]',
        sameDigit && !selected && cell.value !== 0 && 'bg-accent/20',
        sameDigit && !selected && cell.value === 0 && 'bg-accent/10',
        selected && 'bg-accent/35 shadow-[inset_0_0_0_2px_var(--color-accent)]',
        (conflict || mistake) && 'text-[#ffb0b0]',
        mistake &&
          'bg-danger/30 shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--color-danger)_70%,transparent)]',
        cell.given && !conflict && !mistake && 'text-ink',
        !cell.given &&
          cell.value !== 0 &&
          !conflict &&
          !mistake &&
          'text-[#8ec5ff]',
        ended && 'cursor-default'
      )}
      aria-selected={selected}
      role="gridcell"
      onClick={() => onSelect(index)}
    >
      {cellContent(cell)}
    </button>
  )
}

function cellContent(cell: Cell): ReactNode {
  if (cell.value !== 0) {
    return (
      <span className={CELL_GLYPH}>
        <span className={CELL_GLYPH_INNER}>{cell.value}</span>
      </span>
    )
  }
  if (cell.notes === 0) return null
  const notes = notesFromMask(cell.notes)
  return (
    <span className={SUDOKU_NOTES} aria-hidden>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <span key={d} className={cn(!notes.includes(d) && 'invisible')}>
          {d}
        </span>
      ))}
    </span>
  )
}
