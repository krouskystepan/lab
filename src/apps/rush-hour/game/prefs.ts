import { cloneVehicles, parseLot } from './board'
import { createBoard } from './engine'
import { pickPuzzle, puzzleById } from './puzzles'
import type { BoardState, DiffId, GameStatus, Vehicle } from './types'

const KEY = 'rush-hour.game.v2'

export type SavedGame = {
  version: 1
  board: BoardState
  seconds: number
  selected: string | null
}

function isDiffId(v: unknown): v is DiffId {
  return v === 'easy' || v === 'medium' || v === 'hard' || v === 'expert' || v === 'insane'
}

function isStatus(v: unknown): v is GameStatus {
  return v === 'ready' || v === 'playing' || v === 'won'
}

function isVehicle(v: unknown): v is Vehicle {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    o.id.length === 1 &&
    typeof o.row === 'number' &&
    typeof o.col === 'number' &&
    (o.len === 2 || o.len === 3) &&
    (o.dir === 'h' || o.dir === 'v')
  )
}

function parseBoard(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<BoardState>
  if (!isDiffId(o.diffId)) return null
  if (!isStatus(o.status)) return null
  if (typeof o.puzzleId !== 'string') return null
  if (typeof o.moves !== 'number' || o.moves < 0) return null
  if (!Array.isArray(o.vehicles) || !o.vehicles.every(isVehicle)) return null
  if (!Array.isArray(o.start) || !o.start.every(isVehicle)) return null
  const known = puzzleById(o.puzzleId)
  if (!known) return null
  let parsed
  try {
    parsed = parseLot(known.grid)
  } catch {
    return null
  }
  const byId = new Map(parsed.vehicles.map((v) => [v.id, v]))
  if (o.start.length !== parsed.vehicles.length) return null
  for (const v of o.start) {
    const p = byId.get(v.id)
    if (!p || p.dir !== v.dir || p.len !== v.len || p.row !== v.row || p.col !== v.col) {
      return null
    }
  }
  for (const v of o.vehicles) {
    const p = byId.get(v.id)
    if (!p || p.dir !== v.dir || p.len !== v.len) return null
  }
  return {
    size: parsed.size,
    walls: parsed.walls,
    vehicles: cloneVehicles(o.vehicles),
    start: cloneVehicles(o.start),
    puzzleId: o.puzzleId,
    diffId: o.diffId,
    minMoves: known.minMoves,
    moves: Math.floor(o.moves),
    status: o.status
  }
}

export type LoadedGame = {
  board: BoardState
  seconds: number
  selected: string | null
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
          const selected =
            typeof parsed.selected === 'string' ? parsed.selected : null
          return {
            board,
            seconds: board.status === 'ready' ? 0 : seconds,
            selected
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  return {
    board: createBoard(pickPuzzle('easy')),
    seconds: 0,
    selected: null
  }
}

export function saveGame(
  board: BoardState,
  seconds: number,
  selected: string | null
): void {
  try {
    const payload: SavedGame = {
      version: 1,
      board: {
        ...board,
        vehicles: cloneVehicles(board.vehicles),
        start: cloneVehicles(board.start)
      },
      seconds: Math.max(0, Math.floor(seconds)),
      selected
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
