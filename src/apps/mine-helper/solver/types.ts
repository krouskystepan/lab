export type EditMode = 'number' | 'info' | 'flag' | 'blank' | 'erase'

/**
 * What the solver highlights for the player:
 * - safe (Avoid): classic Minesweeper - find safe cells to click.
 *   Safe # / Bezpečné # = revealed safe with digit; Flag/Vlajka = mine;
 *   Safe / Bezpečné = revealed safe with no digit. No Info tool.
 * - hunt: find your cards - Moje # = your card; Info # = clue only (not yours);
 *   Označené = not your card (opposite of Avoid’s flag!).
 */
export type GoalMode = 'safe' | 'hunt'

/**
 * Mine = counts as a target (Hunt: your card). Info = clue only, not a target.
 * In Avoid, the primary Safe # tool places `info` (classic revealed number).
 */
export type NumberRole = 'mine' | 'info'

/** Primary # tool role: Avoid = classic revealed (info); Hunt = your card (mine). */
export function primaryNumberRole(goalMode: GoalMode): NumberRole {
  return goalMode === 'safe' ? 'info' : 'mine'
}

/** User-editable cell content */
export type UserCell =
  | { type: 'empty' }
  | {
      type: 'number'
      /** Neighbor-count clue; null = known mine/target without a known count (?) */
      value: number | null
      role: NumberRole
    }
  | { type: 'flagged' }
  /** Safe field - not a mine. No clue number. */
  | { type: 'blank' }

/** Solver overlay on a cell */
export type SolverMark =
  | { kind: 'target'; whyHint?: string }
  | { kind: 'flagged'; whyHint?: string }
  | { kind: 'conflict' }
  | {
      kind: 'chance'
      percent: number
      groupId: number
      p?: number
      best?: boolean
      safest?: boolean
      /** Short hover/title text explaining the % */
      whyHint?: string
    }

export interface BoardCell {
  user: UserCell
  solver?: SolverMark
}

export interface SolveInput {
  width: number
  height: number
  cells: UserCell[]
  /** When set, exactly this many targets among all unknown (empty) cells */
  totalTargets?: number
  /** How to tag “safest” / tip rings among chance cells */
  goalMode?: GoalMode
}

export type SolveResult =
  | {
      ok: true
      /** Sparse marks keyed by cell index */
      marks: Map<number, SolverMark>
      notice?: string
      /** How to present notice in the toast UI */
      noticeTone?: 'info' | 'warn'
    }
  | {
      ok: false
      error: 'contradiction' | 'too_large'
      message: string
      /** Clue (and sometimes empty) cells involved in the contradiction */
      conflictCells?: number[]
    }

export const MAX_ENUMERATION = 20

/** Inclusive board size limits (W and H). Matches playable Minesweeper (up to 50). */
export const MIN_GRID = 2
export const MAX_GRID = 50

export type CellAspect = 'square' | 'card'

export const CELL_ASPECTS = [
  { id: 'square' as const, label: '1×1', ratio: 1 },
  { id: 'card' as const, label: 'Card', ratio: 3 / 2 }
] as const

export const PRESETS = [
  { label: '6×6', width: 6, height: 6 },
  { label: '7×6', width: 7, height: 6 },
  { label: '9×9', width: 9, height: 9 },
  { label: '16×16', width: 16, height: 16 }
] as const
