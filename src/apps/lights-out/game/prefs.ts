import { allOff, cloneLights } from './board'
import { createBoard } from './engine'
import { generate } from './generate'
import {
  isBoardSize,
  isDiffId,
  isStatus,
  type BoardState,
  type GameStatus
} from './types'

const KEY = 'lights-out.game.v1'

export type SavedGame = {
  version: 1
  board: BoardState
  seconds: number
}

function parseLights(raw: unknown, n: number): boolean[] | null {
  if (!Array.isArray(raw) || raw.length !== n) return null
  const lights: boolean[] = []
  for (const v of raw) {
    if (typeof v !== 'boolean') return null
    lights.push(v)
  }
  return lights
}

function parseBoard(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<BoardState>
  if (!isDiffId(o.diffId)) return null
  if (!isStatus(o.status)) return null
  if (typeof o.puzzleId !== 'string') return null
  if (typeof o.moves !== 'number' || o.moves < 0) return null
  if (typeof o.minMoves !== 'number' || o.minMoves < 0) return null
  if (typeof o.size !== 'number' || !isBoardSize(o.size)) return null
  const n = o.size * o.size
  const lights = parseLights(o.lights, n)
  const start = parseLights(o.start, n)
  if (!lights || !start) return null
  let status: GameStatus = o.status
  if (allOff(lights)) status = 'won'
  else if (status === 'won') status = 'playing'
  return {
    size: o.size,
    lights,
    start,
    puzzleId: o.puzzleId,
    diffId: o.diffId,
    minMoves: Math.floor(o.minMoves),
    moves: Math.floor(o.moves),
    status
  }
}

export type LoadedGame = {
  board: BoardState
  seconds: number
}

export function loadGame(): LoadedGame {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedGame>
      if (parsed.version === 1) {
        const board = parseBoard(parsed.board)
        if (board) {
          const seconds =
            typeof parsed.seconds === 'number'
              ? Math.max(0, Math.floor(parsed.seconds))
              : 0
          return {
            board,
            seconds: board.status === 'ready' ? 0 : seconds
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  return {
    board: createBoard(generate('easy')),
    seconds: 0
  }
}

export function saveGame(board: BoardState, seconds: number): void {
  try {
    const payload: SavedGame = {
      version: 1,
      board: {
        ...board,
        lights: cloneLights(board.lights),
        start: cloneLights(board.start)
      },
      seconds: Math.max(0, Math.floor(seconds))
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
