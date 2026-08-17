import type { CSSProperties } from 'react'
import type { BoardState, TileMark } from '../game/types'
import { LAYOUT_ROWS } from '../game/words'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

type GridProps = {
  board: BoardState
  shake: boolean
}

export function Grid({ board, shake }: GridProps) {
  const { t } = useI18n()
  const rows = board.maxGuesses
  const cols = board.wordLen
  const currentRow = board.guesses.length
  const ended = board.status === 'won' || board.status === 'lost'

  return (
    <div
      className="mine-grid wordle-grid"
      style={
        {
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          ['--cols' as string]: cols,
          ['--rows' as string]: rows,
          ['--layout-rows' as string]: LAYOUT_ROWS,
          ['--cell-ar' as string]: 1
        } as CSSProperties
      }
      role="grid"
      aria-label={t('wordle.gridAria')}
      aria-colcount={cols}
      aria-rowcount={rows}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const guess = board.guesses[r]
        const isCurrent = !ended && r === currentRow
        const rowShake = shake && isCurrent
        let letter = ''
        let mark: TileMark | 'tbd' | 'empty' | 'hint' = 'empty'
        if (guess) {
          letter = guess.word[c] ?? ''
          mark = guess.marks[c] ?? 'absent'
        } else if (isCurrent) {
          if (c < board.current.length) {
            letter = board.current[c]
            mark = 'tbd'
          } else if (board.hinted[c]) {
            letter = board.answer[c]
            mark = 'hint'
          }
        }
        return (
          <Tile
            key={`${r}-${c}`}
            letter={letter}
            mark={mark}
            shake={rowShake}
            row={r}
            col={c}
          />
        )
      })}
    </div>
  )
}

function Tile({
  letter,
  mark,
  shake,
  row,
  col
}: {
  letter: string
  mark: TileMark | 'tbd' | 'empty' | 'hint'
  shake: boolean
  row: number
  col: number
}) {
  const filled = letter.length > 0
  return (
    <div
      className={cn(
        'cell relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden border p-0 font-bold uppercase leading-none select-none',
        mark === 'correct' && 'wordle-mark-correct',
        mark === 'present' && 'wordle-mark-present',
        mark === 'absent' && 'wordle-mark-absent',
        mark === 'tbd' && 'wordle-mark-tbd',
        mark === 'hint' && 'wordle-mark-hint',
        mark === 'empty' && 'wordle-mark-empty',
        shake && 'wordle-row-shake'
      )}
      role="gridcell"
      aria-rowindex={row + 1}
      aria-colindex={col + 1}
    >
      {filled ? (
        <span className="cell-glyph">
          <span>{letter}</span>
        </span>
      ) : null}
    </div>
  )
}
