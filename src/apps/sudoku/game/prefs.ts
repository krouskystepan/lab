import { CELL_COUNT } from './board'
import { createBoard } from './engine'
import type { BoardState, Cell, DiffId, GameStatus } from './types'

const KEY = 'sudoku.game.v1'

export type SavedGame = {
  version: 1
  board: BoardState
  seconds: number
  selected: number | null
  digit: number | null
  eraseMode?: boolean
  mode: 'digit' | 'notes'
}

function isDiffId(v: unknown): v is DiffId {
  return v === 'easy' || v === 'medium' || v === 'hard' || v === 'expert'
}

function isStatus(v: unknown): v is GameStatus {
  return v === 'ready' || v === 'playing' || v === 'won'
}

function isCell(v: unknown): v is Cell {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.value === 'number' &&
    o.value >= 0 &&
    o.value <= 9 &&
    typeof o.notes === 'number' &&
    o.notes >= 0 &&
    o.notes <= 0x1ff &&
    typeof o.given === 'boolean'
  )
}

function parseBoard(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<BoardState>
  if (!isDiffId(o.diffId)) return null
  if (!isStatus(o.status)) return null
  if (typeof o.filledCount !== 'number') return null
  if (!Array.isArray(o.cells) || o.cells.length !== CELL_COUNT) return null
  if (!Array.isArray(o.solution) || o.solution.length !== CELL_COUNT) return null
  if (!o.cells.every(isCell)) return null
  if (!o.solution.every((n) => typeof n === 'number' && n >= 1 && n <= 9))
    return null

  return {
    diffId: o.diffId,
    cells: o.cells.map((c) => ({ ...c })),
    solution: o.solution.slice(),
    status: o.status,
    filledCount: Math.max(0, Math.floor(o.filledCount))
  }
}

export type LoadedGame = {
  board: BoardState
  seconds: number
  selected: number | null
  digit: number | null
  eraseMode: boolean
  mode: 'digit' | 'notes'
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
            typeof parsed.selected === 'number' &&
            parsed.selected >= 0 &&
            parsed.selected < CELL_COUNT
              ? parsed.selected
              : null
          const eraseMode = parsed.eraseMode === true
          const digit = eraseMode
            ? null
            : parsed.digit === null
              ? null
              : typeof parsed.digit === 'number' &&
                  parsed.digit >= 1 &&
                  parsed.digit <= 9
                ? parsed.digit
                : 1
          const mode = parsed.mode === 'notes' ? 'notes' : 'digit'
          return {
            board,
            seconds: board.status === 'ready' ? 0 : seconds,
            selected,
            digit,
            eraseMode,
            mode
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  return {
    board: createBoard('easy'),
    seconds: 0,
    selected: null,
    digit: 1,
    eraseMode: false,
    mode: 'digit'
  }
}

export function saveGame(
  board: BoardState,
  seconds: number,
  selected: number | null,
  digit: number | null,
  eraseMode: boolean,
  mode: 'digit' | 'notes'
): void {
  try {
    const payload: SavedGame = {
      version: 1,
      board: {
        ...board,
        cells: board.cells.map((c) => ({ ...c })),
        solution: board.solution.slice()
      },
      seconds: Math.max(0, Math.floor(seconds)),
      selected,
      digit: eraseMode ? null : digit,
      eraseMode,
      mode
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
