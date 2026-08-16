import { CELL_COUNT } from '../../sudoku/game/board'
import type { BoardCell, EditMode } from '../solver/types'

const KEY = 'sudoku-helper.board.v1'

export type SavedBoard = {
  version: 1
  cells: BoardCell[]
  digit: number | null
  eraseMode: boolean
  mode: EditMode
  autoSolve: boolean
}

function emptyCells(): BoardCell[] {
  return Array.from({ length: CELL_COUNT }, () => ({
    user: { value: 0 }
  }))
}

function isCell(v: unknown): v is BoardCell {
  if (!v || typeof v !== 'object') return false
  const o = v as { user?: { value?: unknown } }
  return (
    typeof o.user?.value === 'number' &&
    o.user.value >= 0 &&
    o.user.value <= 9
  )
}

export function emptyBoard(): SavedBoard {
  return {
    version: 1,
    cells: emptyCells(),
    digit: 1,
    eraseMode: false,
    mode: 'digit',
    autoSolve: false
  }
}

export function loadBoard(): SavedBoard {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyBoard()
    const parsed = JSON.parse(raw) as Partial<SavedBoard>
    if (parsed.version !== 1) return emptyBoard()
    if (!Array.isArray(parsed.cells) || parsed.cells.length !== CELL_COUNT)
      return emptyBoard()
    if (!parsed.cells.every(isCell)) return emptyBoard()
    return {
      version: 1,
      cells: parsed.cells.map((c) => ({
        user: { value: c.user.value },
        solver: undefined
      })),
      digit:
        parsed.digit === null
          ? null
          : typeof parsed.digit === 'number' &&
              parsed.digit >= 1 &&
              parsed.digit <= 9
            ? parsed.digit
            : 1,
      eraseMode: parsed.eraseMode === true,
      mode: parsed.mode === 'erase' ? 'erase' : 'digit',
      autoSolve: parsed.autoSolve === true
    }
  } catch {
    return emptyBoard()
  }
}

export function saveBoard(saved: Omit<SavedBoard, 'version'>): void {
  try {
    const payload: SavedBoard = {
      version: 1,
      cells: saved.cells.map((c) => ({
        user: { value: c.user.value }
      })),
      digit: saved.digit,
      eraseMode: saved.eraseMode,
      mode: saved.mode,
      autoSolve: saved.autoSolve
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
