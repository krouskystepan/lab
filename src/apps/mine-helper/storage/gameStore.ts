import type {
  BoardCell,
  CellAspect,
  EditMode,
  NumberRole,
  UserCell
} from '../solver/types'
import { MAX_GRID, MIN_GRID } from '../solver/types'

const STORAGE_KEY = 'mine-solver:v2'

/** Single board snapshot - only one game kept in localStorage. */
export type SavedBoard = {
  width: number
  height: number
  cellAspect: CellAspect
  cells: BoardCell[]
  useTotal: boolean
  totalTargets: number
  mode: EditMode
  numberValue: number | null
}

export function emptyBoard(width: number, height: number): BoardCell[] {
  return Array.from({ length: width * height }, () => ({
    user: { type: 'empty' } satisfies UserCell
  }))
}

export function createDefaultBoard(width = 6, height = 6): SavedBoard {
  return {
    width,
    height,
    cellAspect: 'card',
    cells: emptyBoard(width, height),
    useTotal: false,
    totalTargets: 13,
    mode: 'number',
    numberValue: 1
  }
}

function isNumberRole(v: unknown): v is NumberRole {
  return v === 'mine' || v === 'info'
}

function isUserCell(v: unknown): v is UserCell {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (o.type === 'empty') return true
  if (o.type === 'flagged') return true
  if (o.type === 'blank') return true
  if (
    o.type === 'number' &&
    isNumberRole(o.role) &&
    (o.value === null
      ? o.role === 'mine'
      : typeof o.value === 'number' && o.value >= 0 && o.value <= 8)
  ) {
    return true
  }
  return false
}

function isBoardCell(v: unknown): v is BoardCell {
  if (!v || typeof v !== 'object') return false
  return isUserCell((v as BoardCell).user)
}

function parseBoard(raw: unknown): SavedBoard | null {
  if (!raw || typeof raw !== 'object') return null
  const g = raw as Partial<SavedBoard>
  if (typeof g.width !== 'number' || typeof g.height !== 'number') return null
  if (!Array.isArray(g.cells) || g.cells.length !== g.width * g.height)
    return null
  if (!g.cells.every(isBoardCell)) return null

  const width = Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(g.width)))
  const height = Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(g.height)))
  if (width !== g.width || height !== g.height) return null

  return {
    width,
    height,
    cellAspect: g.cellAspect === 'square' ? 'square' : 'card',
    cells: g.cells.map((c) => ({
      user: c.user,
      solver: c.solver
    })),
    useTotal: Boolean(g.useTotal),
    totalTargets:
      typeof g.totalTargets === 'number'
        ? Math.max(0, Math.floor(g.totalTargets))
        : 13,
    mode:
      g.mode === 'blank' ||
      g.mode === 'erase' ||
      g.mode === 'number' ||
      g.mode === 'info'
        ? g.mode
        : 'number',
    numberValue:
      g.numberValue === null
        ? null
        : typeof g.numberValue === 'number' &&
            g.numberValue >= 0 &&
            g.numberValue <= 8
          ? Math.floor(g.numberValue)
          : 1
  }
}

/** Load the single board (migrates old multi-game store → active game). */
export function loadBoard(): SavedBoard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultBoard()
    const parsed = JSON.parse(raw) as Record<string, unknown>

    // New single-board shape
    if (parsed.version === 3) {
      const board = parseBoard(parsed.board)
      return board ?? createDefaultBoard()
    }

    // Legacy multi-game v2 → keep only the active (or first) game
    if (parsed.version === 2 && Array.isArray(parsed.games)) {
      const games = parsed.games
        .map(parseBoard)
        .filter((g): g is SavedBoard => g !== null)
      if (games.length === 0) return createDefaultBoard()
      const activeId = parsed.activeId
      if (typeof activeId === 'string') {
        const match = (parsed.games as { id?: string }[]).findIndex(
          (g) => g?.id === activeId
        )
        if (match >= 0 && games[match]) return games[match]
      }
      return games[0]
    }

    // Bare board object
    const bare = parseBoard(parsed)
    return bare ?? createDefaultBoard()
  } catch {
    return createDefaultBoard()
  }
}

export function saveBoard(board: SavedBoard): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 3,
        board: {
          ...board,
          cells: board.cells.map((c) => ({
            user: c.user,
            solver: c.solver
          }))
        }
      })
    )
  } catch {
    // quota / private mode
  }
}
