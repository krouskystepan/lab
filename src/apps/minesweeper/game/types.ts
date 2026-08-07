export type DiffId = 'beginner' | 'intermediate' | 'expert' | 'crazy'

export type CellView = 'hidden' | 'flagged' | 'revealed'

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export type PointerMode = 'dig' | 'flag'

export type Cell = {
  view: CellView
  isMine: boolean
  adjacent: number
}

/** Classic boards - also used as size shortcuts. */
export type DiffPreset = {
  id: DiffId
  width: number
  height: number
  mines: number
}

export type BoardConfig = {
  width: number
  height: number
  mines: number
  diffId: DiffId
}

export type BoardState = BoardConfig & {
  cells: Cell[]
  status: GameStatus
  /** True once mines have been placed (after first reveal). */
  generated: boolean
  /** Cell that caused the loss (mine hit), if any. */
  hitIndex: number | null
  revealedSafe: number
  flagCount: number
}

export type SetDiff = { type: 'setDiff'; id: DiffId }
export type SetSize = { type: 'setSize'; width: number; height: number }
export type SetMines = { type: 'setMines'; mines: number }
/** Snap to classic board size + mine count for that difficulty. */
export type ApplyClassic = { type: 'applyClassic'; id: DiffId }
export type NewGame = { type: 'newGame' }
export type Reveal = { type: 'reveal'; index: number }
export type ToggleFlag = { type: 'toggleFlag'; index: number }
/** Chord: open neighbors of a revealed number when flag count matches. */
export type Chord = { type: 'chord'; index: number }
export type ClearFlags = { type: 'clearFlags' }
export type Restore = {
  type: 'restore'
  cells: Cell[]
  status: GameStatus
  generated: boolean
  hitIndex: number | null
  revealedSafe: number
  flagCount: number
}

export type Action =
  | SetDiff
  | SetSize
  | SetMines
  | ApplyClassic
  | NewGame
  | Reveal
  | ToggleFlag
  | Chord
  | ClearFlags
  | Restore
