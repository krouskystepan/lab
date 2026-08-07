import type { BoardConfig, BoardState, Cell, DiffId, GameStatus } from './types'
import {
  PRESETS,
  clampGrid,
  clampMines,
  minesForDensity,
  presetById
} from './presets'

const KEY = 'minesweeper.game.v1'
const LEGACY_CONFIG = 'minesweeper.config.v2'
const LEGACY_DIFF = 'minesweeper.diff'

export type SavedGame = {
  version: 1
  board: BoardState
  seconds: number
}

function isDiffId(v: unknown): v is DiffId {
  return (
    v === 'beginner' ||
    v === 'intermediate' ||
    v === 'expert' ||
    v === 'crazy'
  )
}

function isCell(v: unknown): v is Cell {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  const viewOk =
    o.view === 'hidden' || o.view === 'flagged' || o.view === 'revealed'
  return (
    viewOk &&
    typeof o.isMine === 'boolean' &&
    typeof o.adjacent === 'number' &&
    o.adjacent >= 0 &&
    o.adjacent <= 8
  )
}

function isStatus(v: unknown): v is GameStatus {
  return v === 'ready' || v === 'playing' || v === 'won' || v === 'lost'
}

function parseBoard(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<BoardState>
  if (!isDiffId(o.diffId)) return null
  if (typeof o.width !== 'number' || typeof o.height !== 'number') return null
  if (typeof o.mines !== 'number') return null
  if (!isStatus(o.status)) return null
  if (typeof o.generated !== 'boolean') return null
  if (o.hitIndex != null && typeof o.hitIndex !== 'number') return null
  if (typeof o.revealedSafe !== 'number') return null
  if (typeof o.flagCount !== 'number') return null
  if (!Array.isArray(o.cells) || o.cells.length !== o.width * o.height)
    return null
  if (!o.cells.every(isCell)) return null

  const width = clampGrid(o.width)
  const height = clampGrid(o.height)
  if (width !== o.width || height !== o.height) return null

  return {
    width,
    height,
    mines: clampMines(o.mines, width, height),
    diffId: o.diffId,
    cells: o.cells.map((c) => ({ ...c })),
    status: o.status,
    generated: o.generated,
    hitIndex: o.hitIndex ?? null,
    revealedSafe: Math.max(0, Math.floor(o.revealedSafe)),
    flagCount: Math.max(0, Math.floor(o.flagCount))
  }
}

function configOnlyBoard(config: BoardConfig): BoardState {
  const width = clampGrid(config.width)
  const height = clampGrid(config.height)
  const mines = clampMines(config.mines, width, height)
  return {
    width,
    height,
    mines,
    diffId: config.diffId,
    cells: Array.from({ length: width * height }, () => ({
      view: 'hidden' as const,
      isMine: false,
      adjacent: 0
    })),
    status: 'ready',
    generated: false,
    hitIndex: null,
    revealedSafe: 0,
    flagCount: 0
  }
}

function loadLegacyConfig(): BoardConfig | null {
  try {
    const raw = localStorage.getItem(LEGACY_CONFIG)
    if (raw) {
      const o = JSON.parse(raw) as Partial<BoardConfig>
      const diffId = isDiffId(o.diffId) ? o.diffId : 'beginner'
      const width = clampGrid(Number(o.width) || PRESETS[0].width)
      const height = clampGrid(Number(o.height) || PRESETS[0].height)
      const mines = clampMines(
        Number(o.mines) || minesForDensity(width, height, diffId),
        width,
        height
      )
      return { width, height, mines, diffId }
    }
  } catch {
    /* ignore */
  }

  try {
    const old = localStorage.getItem(LEGACY_DIFF)
    if (old && isDiffId(old)) {
      const p = presetById(old)
      return {
        width: p.width,
        height: p.height,
        mines: p.mines,
        diffId: p.id
      }
    }
  } catch {
    /* ignore */
  }

  return null
}

/** Load the single in-progress game (or a fresh board from legacy config). */
export function loadGame(): { board: BoardState; seconds: number } {
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

  const legacy = loadLegacyConfig()
  if (legacy) return { board: configOnlyBoard(legacy), seconds: 0 }

  const p = PRESETS[0]
  return {
    board: configOnlyBoard({
      width: p.width,
      height: p.height,
      mines: p.mines,
      diffId: p.id
    }),
    seconds: 0
  }
}

export function saveGame(board: BoardState, seconds: number): void {
  try {
    const payload: SavedGame = {
      version: 1,
      board: {
        ...board,
        cells: board.cells.map((c) => ({ ...c }))
      },
      seconds: Math.max(0, Math.floor(seconds))
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
    // Drop legacy keys once the new save is written
    localStorage.removeItem(LEGACY_CONFIG)
    localStorage.removeItem(LEGACY_DIFF)
  } catch {
    /* ignore */
  }
}
