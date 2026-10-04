import type { Edge, Vec } from './geometry'

export type { Edge, Vec }

export type DiffId = 'easy' | 'medium' | 'hard' | 'expert' | 'insane'

export type GameStatus = 'ready' | 'playing' | 'won'

export type Puzzle = {
  id: string
  diffId: DiffId
  n: number
  edges: Edge[]
  start: Vec[]
}

export type BoardState = {
  diffId: DiffId
  puzzleId: string
  n: number
  edges: Edge[]
  start: Vec[]
  pos: Vec[]
  moves: number
  status: GameStatus
}

export type Action =
  | { type: 'move'; index: number; pos: Vec }
  | { type: 'restore'; pos: Vec[]; moves: number; status: GameStatus }
  | { type: 'newGame'; puzzle: Puzzle }
  | { type: 'reset' }
  | { type: 'importBoard'; board: BoardState }

const DIFFS: DiffId[] = ['easy', 'medium', 'hard', 'expert', 'insane']

export function isDiffId(v: unknown): v is DiffId {
  return typeof v === 'string' && DIFFS.includes(v as DiffId)
}

export function isStatus(v: unknown): v is GameStatus {
  return v === 'ready' || v === 'playing' || v === 'won'
}
