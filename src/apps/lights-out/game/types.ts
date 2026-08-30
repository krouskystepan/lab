export type DiffId = 'easy' | 'medium' | 'hard' | 'expert' | 'insane'
export type GameStatus = 'ready' | 'playing' | 'won'
export type BoardSize = 3 | 4 | 5 | 6 | 7

export type Puzzle = {
  id: string
  diffId: DiffId
  size: BoardSize
  lights: boolean[]
  minMoves: number
}

export type BoardState = {
  size: BoardSize
  lights: boolean[]
  start: boolean[]
  puzzleId: string
  diffId: DiffId
  minMoves: number
  moves: number
  status: GameStatus
}

export type Action =
  | { type: 'press'; index: number }
  | { type: 'restore'; lights: boolean[]; moves: number; status: GameStatus }
  | { type: 'newGame'; puzzle: Puzzle }
  | { type: 'reset' }
  | { type: 'importBoard'; board: BoardState }

export const DIFF_SIZE: Record<DiffId, BoardSize> = {
  easy: 3,
  medium: 4,
  hard: 5,
  expert: 6,
  insane: 7
}

export function isDiffId(v: unknown): v is DiffId {
  return (
    v === 'easy' ||
    v === 'medium' ||
    v === 'hard' ||
    v === 'expert' ||
    v === 'insane'
  )
}

export function isBoardSize(n: number): n is BoardSize {
  return n === 3 || n === 4 || n === 5 || n === 6 || n === 7
}

export function isStatus(v: unknown): v is GameStatus {
  return v === 'ready' || v === 'playing' || v === 'won'
}
