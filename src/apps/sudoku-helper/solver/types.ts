export type EditMode = 'digit' | 'erase'

export type Cell = {
  /** 0 = empty, 1–9 = filled clue/entry */
  value: number
}

export type SingleKind = 'naked' | 'hidden'

/** Overlay from Solve — candidates and optional forced single. */
export type SolverMark = {
  candidates: number[]
  single?: { digit: number; kind: SingleKind }
  conflict?: boolean
}

export type BoardCell = {
  user: Cell
  solver?: SolverMark
}

export type NextMove = {
  index: number
  digit: number
  kind: SingleKind
}

export type SolveResult =
  | {
      ok: true
      marks: Map<number, SolverMark>
      next: NextMove | null
      notice?: string
    }
  | {
      ok: false
      conflictCells: number[]
      message: string
    }
