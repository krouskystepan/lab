export type DiffId = 'easy' | 'medium' | 'hard' | 'expert'

export type GameStatus = 'ready' | 'playing' | 'won'

export type PointerMode = 'digit' | 'notes'

/** Bitmask: bit (d-1) set means note d is present (d = 1..9). */
export type NotesMask = number

export type Cell = {
  /** 0 = empty, 1–9 = filled */
  value: number
  notes: NotesMask
  /** Clue from the puzzle — not editable. */
  given: boolean
}

export type BoardState = {
  diffId: DiffId
  cells: Cell[]
  /** Full solved grid (length 81, values 1–9). */
  solution: number[]
  status: GameStatus
  /** Cells filled by the player (not givens). */
  filledCount: number
}

export type SetDiff = { type: 'setDiff'; id: DiffId }
export type NewGame = { type: 'newGame' }
export type SelectApply = {
  type: 'applyDigit'
  index: number
  digit: number
  mode: PointerMode
}
export type Erase = { type: 'erase'; index: number }
export type ClearNotes = { type: 'clearNotes' }
export type Restore = {
  type: 'restore'
  cells: Cell[]
  status: GameStatus
  filledCount: number
}
export type ImportBoard = { type: 'importBoard'; board: BoardState }

export type Action =
  | SetDiff
  | NewGame
  | SelectApply
  | Erase
  | ClearNotes
  | Restore
  | ImportBoard