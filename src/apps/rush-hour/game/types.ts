export const PRIMARY = 'A'

export type Dir = 'h' | 'v'
export type DiffId = 'easy' | 'medium' | 'hard' | 'expert' | 'insane'
export type GameStatus = 'ready' | 'playing' | 'won'

export type Vehicle = {
  id: string
  row: number
  col: number
  len: 2 | 3
  dir: Dir
}

export type Slide = {
  id: string
  row: number
  col: number
}

export type Lot = {
  size: number
  walls: number[]
}

export type Puzzle = {
  id: string
  diffId: DiffId
  /** Square row-major grid. `o` empty, `x` wall, `A` red car, `B`–`Z` others. */
  grid: string
  minMoves: number
}

export type BoardState = {
  size: number
  walls: number[]
  vehicles: Vehicle[]
  start: Vehicle[]
  puzzleId: string
  diffId: DiffId
  minMoves: number
  moves: number
  status: GameStatus
}

export type Action =
  | { type: 'slide'; id: string; row: number; col: number }
  | { type: 'restore'; vehicles: Vehicle[]; moves: number; status: GameStatus }
  | { type: 'newGame'; puzzle: Puzzle }
  | { type: 'reset' }
  | { type: 'importBoard'; board: BoardState }

export function exitRow(size: number): number {
  return Math.floor((size - 1) / 2)
}

export function visCols(size: number): number {
  return size + 1
}

export function isBoardSize(n: number): n is 6 | 7 | 8 {
  return n === 6 || n === 7 || n === 8
}
