import { CELL_COUNT } from '../../apps/sudoku/game/board'
import { fillComplete, hasUniqueSolution } from '../../apps/sudoku/game/generate'
import type {
  BoardState as SudokuGameBoard,
  Cell as SudokuGameCell
} from '../../apps/sudoku/game/types'
import type { BoardCell as SudokuHelperCell } from '../../apps/sudoku-helper/solver/types'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type SudokuBoardFile
} from './types'

export function exportSudokuGame(
  board: SudokuGameBoard,
  seconds?: number
): SudokuBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'sudoku',
    cells: board.cells.map((c) => c.value),
    game: {
      given: board.cells.map((c) => c.given),
      notes: board.cells.map((c) => c.notes),
      solution: board.solution.slice(),
      status: board.status,
      diffId: board.diffId,
      seconds
    }
  }
}

export function exportSudokuHelperBoard(
  cells: SudokuHelperCell[]
): SudokuBoardFile {
  if (cells.length !== CELL_COUNT) throw new Error('invalid_board')
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'sudoku',
    cells: cells.map((c) => c.user.value)
  }
}

export function importSudokuToHelper(file: SudokuBoardFile): number[] {
  if (!Array.isArray(file.cells) || file.cells.length !== CELL_COUNT) {
    throw new Error('invalid_board')
  }
  return file.cells.map((v) => {
    const n = Number(v)
    if (!Number.isInteger(n) || n < 0 || n > 9) throw new Error('invalid_board')
    return n
  })
}

export function importSudokuToGame(
  file: SudokuBoardFile,
  fallbackDiffId: SudokuGameBoard['diffId'] = 'easy'
): { board: SudokuGameBoard; seconds: number } {
  const values = importSudokuToHelper(file)

  if (file.game && file.game.solution.length === CELL_COUNT) {
    const cells: SudokuGameCell[] = values.map((value, i) => ({
      value,
      notes: file.game!.notes[i] ?? 0,
      given: file.game!.given[i] ?? value !== 0
    }))
    let filledCount = 0
    for (const c of cells) {
      if (!c.given && c.value !== 0) filledCount++
    }
    return {
      board: {
        diffId: file.game.diffId ?? fallbackDiffId,
        cells,
        solution: file.game.solution.slice(),
        status: file.game.status,
        filledCount
      },
      seconds: file.game.seconds ?? 0
    }
  }

  // From helper / bare file: treat filled digits as givens; solve for solution
  const seed = values.slice()
  if (!fillComplete(seed)) throw new Error('unsolvable')
  // Prefer unique when possible (warn path is caller's job via uniqueness check)
  const solution = seed
  const unique = hasUniqueSolution(values.slice())
  if (!unique) {
    // Still allow play with one found solution
  }

  const cells: SudokuGameCell[] = values.map((value) => ({
    value,
    notes: 0,
    given: value !== 0
  }))

  return {
    board: {
      diffId: fallbackDiffId,
      cells,
      solution,
      status: 'ready',
      filledCount: 0
    },
    seconds: 0
  }
}
