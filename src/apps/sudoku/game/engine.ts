import { CELL_COUNT, hasNote, noteBit, peersOf, toggleNote } from './board'
import { createPuzzle } from './presets'
import type { Action, BoardState, Cell, DiffId } from './types'

function emptyCell(): Cell {
  return { value: 0, notes: 0, given: false }
}

function cellsFromGivens(givens: number[]): Cell[] {
  return givens.map((v) =>
    v === 0
      ? emptyCell()
      : { value: v, notes: 0, given: true }
  )
}

function countFilled(cells: Cell[]): number {
  let n = 0
  for (const c of cells) {
    if (!c.given && c.value !== 0) n++
  }
  return n
}

function isCompleteCorrect(state: BoardState): boolean {
  for (let i = 0; i < CELL_COUNT; i++) {
    if (state.cells[i].value !== state.solution[i]) return false
  }
  return true
}

/** Strip peer notes that match a newly placed digit. */
function scrubNotes(cells: Cell[], index: number, digit: number): Cell[] {
  const bit = noteBit(digit)
  const next = cells.slice()
  next[index] = { ...next[index], notes: 0 }
  for (const p of peersOf(index)) {
    const cell = next[p]
    if (cell.value !== 0 || cell.notes === 0) continue
    if ((cell.notes & bit) === 0) continue
    next[p] = { ...cell, notes: cell.notes & ~bit }
  }
  return next
}

export function createBoard(diffId: DiffId): BoardState {
  const { givens, solution } = createPuzzle(diffId)
  return {
    diffId,
    cells: cellsFromGivens(givens),
    solution,
    status: 'ready',
    filledCount: 0
  }
}

export function reduce(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'setDiff':
      return createBoard(action.id)
    case 'newGame':
      return createBoard(state.diffId)
    case 'restore':
      return {
        ...state,
        cells: action.cells.map((c) => ({ ...c })),
        status: action.status,
        filledCount: action.filledCount
      }
    case 'importBoard':
      return {
        ...action.board,
        cells: action.board.cells.map((c) => ({ ...c })),
        solution: action.board.solution.slice()
      }
    case 'clearNotes': {
      if (state.status === 'won') return state
      let changed = false
      const cells = state.cells.map((c) => {
        if (c.notes === 0) return c
        changed = true
        return { ...c, notes: 0 }
      })
      if (!changed) return state
      return {
        ...state,
        cells,
        status: state.status === 'ready' ? 'playing' : state.status
      }
    }
    case 'erase': {
      if (state.status === 'won') return state
      const cell = state.cells[action.index]
      if (!cell || cell.given) return state
      if (cell.value === 0 && cell.notes === 0) return state
      const cells = state.cells.slice()
      cells[action.index] = { ...cell, value: 0, notes: 0 }
      const next: BoardState = {
        ...state,
        cells,
        filledCount: countFilled(cells),
        status: state.status === 'ready' ? 'playing' : state.status
      }
      return next
    }
    case 'applyDigit': {
      if (state.status === 'won') return state
      const { index, digit, mode } = action
      if (digit < 1 || digit > 9) return state
      const cell = state.cells[index]
      if (!cell || cell.given) return state

      if (mode === 'notes') {
        if (cell.value !== 0) return state
        const notes = toggleNote(cell.notes, digit)
        if (notes === cell.notes) return state
        const cells = state.cells.slice()
        cells[index] = { ...cell, notes }
        return {
          ...state,
          cells,
          status: state.status === 'ready' ? 'playing' : state.status
        }
      }

      // digit mode — paint only; never toggle-clear (use Erase tool for that)
      if (cell.value === digit) return state

      let cells = state.cells.slice()
      cells[index] = { ...cell, value: digit, notes: 0 }
      cells = scrubNotes(cells, index, digit)
      const next: BoardState = {
        ...state,
        cells,
        filledCount: countFilled(cells),
        status: 'playing'
      }
      if (isCompleteCorrect(next)) {
        return { ...next, status: 'won' }
      }
      return next
    }
    default:
      return state
  }
}

/** True if this cell's value conflicts with a peer. */
export function cellConflicts(state: BoardState, index: number): boolean {
  const v = state.cells[index]?.value
  if (!v) return false
  for (const p of peersOf(index)) {
    if (state.cells[p].value === v) return true
  }
  return false
}

export function hasAnyConflict(state: BoardState): boolean {
  for (let i = 0; i < CELL_COUNT; i++) {
    if (cellConflicts(state, i)) return true
  }
  return false
}

export function remainingEmpty(state: BoardState): number {
  let n = 0
  for (const c of state.cells) {
    if (c.value === 0) n++
  }
  return n
}

export function boardHasNotes(state: BoardState): boolean {
  return state.cells.some((c) => c.notes !== 0)
}

export function noteVisible(state: BoardState, index: number, digit: number): boolean {
  return hasNote(state.cells[index]?.notes ?? 0, digit)
}
