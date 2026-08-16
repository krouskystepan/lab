import {
  CELL_COUNT,
  canPlaceValues
} from '../../sudoku/game/board'
import { candidatesAt } from '../../sudoku/game/generate'
import type { BoardCell, NextMove, SolveResult, SolverMark } from './types'

function valuesOf(cells: BoardCell[]): number[] {
  return cells.map((c) => c.user.value)
}

function findConflicts(values: number[]): number[] {
  const bad = new Set<number>()
  for (let i = 0; i < CELL_COUNT; i++) {
    const v = values[i]
    if (v === 0) continue
    // Temporarily clear to test peers
    values[i] = 0
    if (!canPlaceValues(values, i, v)) bad.add(i)
    values[i] = v
  }
  return [...bad]
}

function findNakedSingles(
  values: number[]
): NextMove[] {
  const out: NextMove[] = []
  for (let i = 0; i < CELL_COUNT; i++) {
    if (values[i] !== 0) continue
    const cands = candidatesAt(values, i)
    if (cands.length === 1) {
      out.push({ index: i, digit: cands[0], kind: 'naked' })
    }
  }
  return out
}

function hiddenInUnit(
  values: number[],
  at: (k: number) => number
): NextMove[] {
  const positions: number[][] = Array.from({ length: 10 }, () => [])
  for (let k = 0; k < 9; k++) {
    const i = at(k)
    if (values[i] !== 0) continue
    for (const d of candidatesAt(values, i)) {
      positions[d].push(i)
    }
  }
  const out: NextMove[] = []
  for (let d = 1; d <= 9; d++) {
    if (positions[d].length === 1) {
      out.push({ index: positions[d][0], digit: d, kind: 'hidden' })
    }
  }
  return out
}

function findHiddenSingles(values: number[]): NextMove[] {
  const out: NextMove[] = []
  for (let r = 0; r < 9; r++) {
    out.push(...hiddenInUnit(values, (c) => r * 9 + c))
  }
  for (let c = 0; c < 9; c++) {
    out.push(...hiddenInUnit(values, (r) => r * 9 + c))
  }
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3
    const bc = (b % 3) * 3
    out.push(
      ...hiddenInUnit(values, (k) => {
        const rr = br + Math.floor(k / 3)
        const cc = bc + (k % 3)
        return rr * 9 + cc
      })
    )
  }
  // Dedupe by index (prefer naked if both)
  const byIndex = new Map<number, NextMove>()
  for (const m of out) {
    const prev = byIndex.get(m.index)
    if (!prev || prev.kind === 'hidden') byIndex.set(m.index, m)
  }
  return [...byIndex.values()]
}

/** Candidates + naked/hidden singles for the current user grid. */
export function solve(cells: BoardCell[]): SolveResult {
  const values = valuesOf(cells)
  const conflicts = findConflicts(values)
  if (conflicts.length > 0) {
    return {
      ok: false,
      conflictCells: conflicts,
      message: 'conflict'
    }
  }

  const naked = findNakedSingles(values)
  const hidden = findHiddenSingles(values)
  const singles = new Map<number, NextMove>()
  for (const m of hidden) singles.set(m.index, m)
  for (const m of naked) singles.set(m.index, m) // naked wins

  const marks = new Map<number, SolverMark>()
  for (let i = 0; i < CELL_COUNT; i++) {
    if (values[i] !== 0) continue
    const candidates = candidatesAt(values, i)
    const single = singles.get(i)
    marks.set(i, {
      candidates,
      single: single
        ? { digit: single.digit, kind: single.kind }
        : undefined
    })
  }

  const nextList = [...singles.values()]
  const next = nextList[0] ?? null

  return { ok: true, marks, next }
}

export function clearSolver(cells: BoardCell[]): BoardCell[] {
  return cells.map((c) => ({ user: { ...c.user } }))
}

export function paintSolve(cells: BoardCell[]): {
  cells: BoardCell[]
  next: NextMove | null
  ok: boolean
  conflictCells: number[]
} {
  const result = solve(cells)
  if (!result.ok) {
    const base = clearSolver(cells)
    for (const i of result.conflictCells) {
      if (i < 0 || i >= base.length) continue
      base[i] = {
        ...base[i],
        solver: { candidates: [], conflict: true }
      }
    }
    return {
      cells: base,
      next: null,
      ok: false,
      conflictCells: result.conflictCells
    }
  }

  const base = clearSolver(cells)
  for (const [i, mark] of result.marks) {
    base[i] = { ...base[i], solver: mark }
  }
  return {
    cells: base,
    next: result.next,
    ok: true,
    conflictCells: []
  }
}
