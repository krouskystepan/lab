/** Shared board interchange — game ↔ solver (and round-trip). */

export const BOARD_FORMAT = 'krouskylab.board' as const
export const BOARD_VERSION = 1 as const

export type BoardFamily = 'minesweeper' | 'sudoku'

/** Visible minesweeper knowledge (no hidden mine map). */
export type MineTransferCell =
  | { type: 'empty' }
  | { type: 'flagged' }
  | { type: 'blank' }
  | { type: 'number'; value: number }

export type MinesweeperBoardFile = {
  format: typeof BOARD_FORMAT
  version: typeof BOARD_VERSION
  family: 'minesweeper'
  width: number
  height: number
  /** Total mines / targets among unknowns (optional). */
  totalTargets?: number
  cells: MineTransferCell[]
  /**
   * Present when exported from the playable game.
   * Solvers ignore this; games use it to restore a full session.
   */
  game?: {
    isMine: boolean[]
    status: 'ready' | 'playing' | 'won' | 'lost'
    generated: boolean
    hitIndex: number | null
    diffId: 'beginner' | 'intermediate' | 'expert' | 'crazy'
    seconds?: number
  }
}

export type SudokuBoardFile = {
  format: typeof BOARD_FORMAT
  version: typeof BOARD_VERSION
  family: 'sudoku'
  /** Length 81; 0 = empty, 1–9 = digit. */
  cells: number[]
  /** Present when exported from the playable game. */
  game?: {
    given: boolean[]
    notes: number[]
    solution: number[]
    status: 'ready' | 'playing' | 'won'
    diffId: 'easy' | 'medium' | 'hard' | 'expert'
    seconds?: number
  }
}

export type BoardFile = MinesweeperBoardFile | SudokuBoardFile

export function isBoardFile(data: unknown): data is BoardFile {
  if (!data || typeof data !== 'object') return false
  const o = data as Record<string, unknown>
  return o.format === BOARD_FORMAT && o.version === BOARD_VERSION
}

export function parseBoardFile(text: string): BoardFile {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('invalid_json')
  }
  if (!isBoardFile(data)) throw new Error('invalid_format')
  return data
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsText(file)
  })
}
