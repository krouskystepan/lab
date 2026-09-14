/** Paint tools for the mirror board. */
export type EditMode = 'mine' | 'not'

/** User-editable cell content */
export type UserCell =
  | { type: 'empty' }
  | { type: 'mine' }
  | { type: 'not' }

/** Solver overlay on a cell (only on empty cells). */
export type SolverMark =
  | { kind: 'certain'; mark: 'mine' | 'not'; unclued?: boolean }
  | { kind: 'hint'; mark: 'mine' | 'not'; probe?: boolean }
  | {
      kind: 'probe'
      /** Expected leading-axis % after learning mine vs not here */
      expectedPercent: number
    }
  | { kind: 'conflict' }

export interface BoardCell {
  user: UserCell
  solver?: SolverMark
}

export type AxisId = 'v' | 'h' | 'd-main' | 'd-anti'
export type AxisFamily = 'vertical' | 'horizontal' | 'diagonal'
export type AxisStatus = 'possible' | 'impossible'

export type AxisInfo = {
  id: AxisId
  family: AxisFamily
  status: AxisStatus
  /** Uniform prior over still-possible axes (0 when impossible). */
  percent: number
  /** Why this axis is ruled out (when impossible). */
  why?: AxisWhy
}

export type AxisWhy =
  | {
      kind: 'conflict'
      /** Cell index that is mine/not */
      a: number
      /** Its mirror with the opposite mark */
      b: number
    }
  | {
      kind: 'total_low'
      /** Max mines this axis can still place */
      max: number
      total: number
    }
  | {
      kind: 'total_high'
      /** Min mines this axis already forces */
      min: number
      total: number
    }

export type BestProbe = {
  index: number
  /** Expected max axis % after learning this cell’s mark */
  expectedPercent: number
  /** Current leading-axis % before the ask */
  currentPercent: number
}

export type EnabledFamilies = {
  vertical: boolean
  horizontal: boolean
  diagonal: boolean
}

export interface SolveInput {
  width: number
  height: number
  cells: UserCell[]
  enabled: EnabledFamilies
  /** When set, an axis must be able to reach exactly this many mine cards. */
  totalMines?: number
}

export type SolveResult = {
  axes: AxisInfo[]
  /** Empty cells implied when exactly one possible axis remains */
  mirrorHints: Map<number, 'mine' | 'not'>
  /** Empty cells agreed by every still-possible axis */
  certain: Map<number, 'mine' | 'not'>
  /** Empty cell that best splits remaining axes (when ≥2 possibles) */
  bestProbe: BestProbe | null
  /** Sparse marks for painting the board */
  marks: Map<number, SolverMark>
  possibleCount: number
}

export const MIN_GRID = 3
export const MAX_GRID = 15

export type CellAspect = 'square' | 'card'

export const CELL_ASPECTS = [
  { id: 'square' as const, label: '1×1', ratio: 1 },
  { id: 'card' as const, label: 'Card', ratio: 3 / 2 }
] as const

export const PRESETS = [
  { label: '6×6', width: 6, height: 6 },
  { label: '6×7', width: 6, height: 7 },
  { label: '7×7', width: 7, height: 7 }
] as const

export function familyOf(id: AxisId): AxisFamily {
  if (id === 'v') return 'vertical'
  if (id === 'h') return 'horizontal'
  return 'diagonal'
}

export function userMark(cell: UserCell): 'mine' | 'not' | null {
  if (cell.type === 'mine') return 'mine'
  if (cell.type === 'not') return 'not'
  return null
}
