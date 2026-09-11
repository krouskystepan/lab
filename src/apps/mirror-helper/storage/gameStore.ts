import type {
  BoardCell,
  CellAspect,
  EditMode,
  EnabledFamilies,
  UserCell
} from '../solver/types'
import { MAX_GRID, MIN_GRID } from '../solver/types'

const STORAGE_KEY = 'mirror-helper:v1'

export type SavedBoard = {
  width: number
  height: number
  cellAspect: CellAspect
  cells: BoardCell[]
  mode: EditMode
  enabled: EnabledFamilies
  autoSolve: boolean
  useTotal: boolean
  totalMines: number
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
    cellAspect: 'square',
    cells: emptyBoard(width, height),
    mode: 'mine',
    enabled: { vertical: true, horizontal: true, diagonal: true },
    autoSolve: true,
    useTotal: false,
    totalMines: 8
  }
}

function isUserCell(v: unknown): v is UserCell {
  if (!v || typeof v !== 'object') return false
  const t = (v as UserCell).type
  return t === 'empty' || t === 'mine' || t === 'not'
}

function isBoardCell(v: unknown): v is BoardCell {
  if (!v || typeof v !== 'object') return false
  return isUserCell((v as BoardCell).user)
}

function parseEnabled(raw: unknown): EnabledFamilies {
  if (!raw || typeof raw !== 'object') {
    return { vertical: true, horizontal: true, diagonal: true }
  }
  const o = raw as Record<string, unknown>
  return {
    vertical: o.vertical !== false,
    horizontal: o.horizontal !== false,
    diagonal: o.diagonal !== false
  }
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

  const mode: EditMode = g.mode === 'not' ? 'not' : 'mine'

  return {
    width,
    height,
    cellAspect: g.cellAspect === 'card' ? 'card' : 'square',
    cells: g.cells.map((c) => ({ user: c.user })),
    mode,
    enabled: parseEnabled(g.enabled),
    autoSolve: g.autoSolve !== false,
    useTotal: Boolean(g.useTotal),
    totalMines:
      typeof g.totalMines === 'number'
        ? Math.max(0, Math.floor(g.totalMines))
        : 8
  }
}

export function loadBoard(): SavedBoard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultBoard()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.version === 1) {
      return parseBoard(parsed.board) ?? createDefaultBoard()
    }
    return parseBoard(parsed) ?? createDefaultBoard()
  } catch {
    return createDefaultBoard()
  }
}

export function saveBoard(board: SavedBoard): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        board: {
          ...board,
          cells: board.cells.map((c) => ({ user: c.user }))
        }
      })
    )
  } catch {
    /* quota / private mode */
  }
}

/** Crop or pad cells when resizing the grid (keeps top-left). */
export function resizeCells(
  cells: BoardCell[],
  oldW: number,
  oldH: number,
  newW: number,
  newH: number
): BoardCell[] {
  const next = emptyBoard(newW, newH)
  const copyW = Math.min(oldW, newW)
  const copyH = Math.min(oldH, newH)
  for (let r = 0; r < copyH; r++) {
    for (let c = 0; c < copyW; c++) {
      next[r * newW + c] = { user: cells[r * oldW + c].user }
    }
  }
  return next
}
