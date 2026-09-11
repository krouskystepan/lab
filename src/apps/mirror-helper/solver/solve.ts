import { colOf, indexOf, listAxes, reflect, rowOf } from './axes'
import type {
  AxisId,
  AxisInfo,
  AxisWhy,
  BestProbe,
  SolveInput,
  SolveResult,
  SolverMark,
  UserCell
} from './types'
import { userMark } from './types'

/** First pair of cells that disagree across this axis, if any. */
export function findMarkConflict(
  axis: AxisId,
  width: number,
  height: number,
  cells: UserCell[]
): { a: number; b: number } | null {
  const n = width * height
  for (let i = 0; i < n; i++) {
    const mark = userMark(cells[i])
    if (mark == null) continue
    const r = rowOf(i, width)
    const c = colOf(i, width)
    const img = reflect(axis, r, c, width, height)
    const j = indexOf(img.r, img.c, width)
    if (j < i) continue
    const other = userMark(cells[j])
    if (other != null && other !== mark) return { a: i, b: j }
  }
  return null
}

/** Whether every marked cell’s image matches (or is empty). */
export function marksConsistent(
  axis: AxisId,
  width: number,
  height: number,
  cells: UserCell[]
): boolean {
  return findMarkConflict(axis, width, height, cells) == null
}

/**
 * Min/max mine count still achievable under this axis given current marks.
 * Returns null if marks already contradict the axis.
 */
export function mineCountRange(
  axis: AxisId,
  width: number,
  height: number,
  cells: UserCell[]
): { min: number; max: number } | null {
  if (!marksConsistent(axis, width, height, cells)) return null

  const n = width * height
  const seen = new Uint8Array(n)
  let min = 0
  let max = 0

  for (let i = 0; i < n; i++) {
    if (seen[i]) continue
    const r = rowOf(i, width)
    const c = colOf(i, width)
    const img = reflect(axis, r, c, width, height)
    const j = indexOf(img.r, img.c, width)
    seen[i] = 1
    seen[j] = 1

    if (i === j) {
      const m = userMark(cells[i])
      if (m === 'mine') {
        min += 1
        max += 1
      } else if (m == null) {
        max += 1
      }
      continue
    }

    const a = userMark(cells[i])
    const b = userMark(cells[j])
    if (a === 'mine' || b === 'mine') {
      min += 2
      max += 2
    } else if (a === 'not' || b === 'not') {
      // zero
    } else {
      max += 2
    }
  }

  return { min, max }
}

export function explainAxis(
  axis: AxisId,
  width: number,
  height: number,
  cells: UserCell[],
  totalMines?: number
): AxisWhy | undefined {
  const conflict = findMarkConflict(axis, width, height, cells)
  if (conflict) {
    return { kind: 'conflict', a: conflict.a, b: conflict.b }
  }
  if (totalMines == null) return undefined
  const range = mineCountRange(axis, width, height, cells)
  if (range == null) return undefined
  if (totalMines > range.max) {
    return { kind: 'total_low', max: range.max, total: totalMines }
  }
  if (totalMines < range.min) {
    return { kind: 'total_high', min: range.min, total: totalMines }
  }
  return undefined
}

/** Mark consistency + optional exact total mine count. */
export function axisPossible(
  axis: AxisId,
  width: number,
  height: number,
  cells: UserCell[],
  totalMines?: number
): boolean {
  return explainAxis(axis, width, height, cells, totalMines) == null
}

/**
 * Empty cells forced by reflecting known marks across one axis.
 * Skips fixed points (cell mirrors to itself).
 */
export function forcedByAxis(
  axis: AxisId,
  width: number,
  height: number,
  cells: UserCell[]
): Map<number, 'mine' | 'not'> {
  const forced = new Map<number, 'mine' | 'not'>()
  const n = width * height
  for (let i = 0; i < n; i++) {
    const mark = userMark(cells[i])
    if (mark == null) continue
    const r = rowOf(i, width)
    const c = colOf(i, width)
    const img = reflect(axis, r, c, width, height)
    const j = indexOf(img.r, img.c, width)
    if (j === i) continue
    if (userMark(cells[j]) != null) continue
    const prev = forced.get(j)
    if (prev != null && prev !== mark) {
      continue
    }
    forced.set(j, mark)
  }
  return forced
}

/**
 * Extra forces from an exact total: free orbits that must be all-mine or all-not
 * under every way to hit `totalMines`.
 */
export function forcedByTotal(
  axis: AxisId,
  width: number,
  height: number,
  cells: UserCell[],
  totalMines: number
): Map<number, 'mine' | 'not'> {
  const out = new Map<number, 'mine' | 'not'>()
  const range = mineCountRange(axis, width, height, cells)
  if (range == null) return out
  if (totalMines < range.min || totalMines > range.max) return out

  const need = totalMines - range.min
  const slack = range.max - range.min
  // Free pair orbits contribute 2 to slack; fixed empties contribute 1.
  // If need === 0 → every free orbit must be not-mine.
  // If need === slack → every free orbit must be mine.
  if (need !== 0 && need !== slack) return out

  const fill: 'mine' | 'not' = need === 0 ? 'not' : 'mine'
  const n = width * height
  const seen = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    if (seen[i]) continue
    const r = rowOf(i, width)
    const c = colOf(i, width)
    const img = reflect(axis, r, c, width, height)
    const j = indexOf(img.r, img.c, width)
    seen[i] = 1
    seen[j] = 1

    if (i === j) {
      if (userMark(cells[i]) == null) out.set(i, fill)
      continue
    }
    const a = userMark(cells[i])
    const b = userMark(cells[j])
    if (a == null && b == null) {
      out.set(i, fill)
      out.set(j, fill)
    }
  }
  return out
}

/** Cells where every possible axis agrees on the same forced mark. */
export function intersectionCertain(
  possibles: AxisId[],
  width: number,
  height: number,
  cells: UserCell[],
  totalMines?: number
): Map<number, 'mine' | 'not'> {
  if (possibles.length === 0) return new Map()

  const maps = possibles.map((a) => {
    const m = new Map(forcedByAxis(a, width, height, cells))
    if (totalMines != null) {
      for (const [i, mark] of forcedByTotal(
        a,
        width,
        height,
        cells,
        totalMines
      )) {
        if (!m.has(i)) m.set(i, mark)
      }
    }
    return m
  })
  const first = maps[0]
  const certain = new Map<number, 'mine' | 'not'>()

  for (const [i, mark] of first) {
    if (maps.every((m) => m.get(i) === mark)) {
      certain.set(i, mark)
    }
  }
  return certain
}

/**
 * Mine Helper–style Total remainder: if leftover mines equal leftover empties,
 * every free empty is a certain mine (or all safe when need is 0).
 * Returns indices filled by this rule (for unclued tip chrome).
 */
export function applyTotalRemainder(
  certain: Map<number, 'mine' | 'not'>,
  cells: UserCell[],
  totalMines: number
): Set<number> {
  const unclued = new Set<number>()
  const known = countMines(cells)
  let forcedMines = 0
  for (const mark of certain.values()) {
    if (mark === 'mine') forcedMines++
  }
  const need = totalMines - known - forcedMines
  if (need < 0) return unclued

  const free: number[] = []
  for (let i = 0; i < cells.length; i++) {
    if (userMark(cells[i]) != null) continue
    if (certain.has(i)) continue
    free.push(i)
  }

  if (need === 0) {
    for (const i of free) {
      certain.set(i, 'not')
      unclued.add(i)
    }
    return unclued
  }

  if (need === free.length && free.length > 0) {
    for (const i of free) {
      certain.set(i, 'mine')
      unclued.add(i)
    }
  }
  return unclued
}

function withMark(
  cells: UserCell[],
  index: number,
  mark: 'mine' | 'not'
): UserCell[] {
  const next = cells.slice()
  next[index] = { type: mark }
  return next
}

/**
 * Pick the empty cell whose mine/not answer most raises the leading-axis %.
 * Uniform prior over still-possible axes; unconstrained cells split 50/50.
 */
export function findBestProbe(
  possibles: AxisId[],
  width: number,
  height: number,
  cells: UserCell[],
  certain: Map<number, 'mine' | 'not'>,
  totalMines?: number
): BestProbe | null {
  const n = possibles.length
  if (n < 2) return null

  const currentPercent = 100 / n
  const forcedMaps = possibles.map((a) => {
    const m = new Map(forcedByAxis(a, width, height, cells))
    if (totalMines != null) {
      for (const [i, mark] of forcedByTotal(
        a,
        width,
        height,
        cells,
        totalMines
      )) {
        if (!m.has(i)) m.set(i, mark)
      }
    }
    return m
  })
  const total = width * height

  let best: BestProbe | null = null

  for (let i = 0; i < total; i++) {
    if (userMark(cells[i]) != null) continue
    if (certain.has(i)) continue

    let massMine = 0
    let massNot = 0
    for (let a = 0; a < n; a++) {
      const forced = forcedMaps[a].get(i)
      if (forced === 'mine') massMine += 1
      else if (forced === 'not') massNot += 1
      else {
        massMine += 0.5
        massNot += 0.5
      }
    }

    const trialMine = withMark(cells, i, 'mine')
    const trialNot = withMark(cells, i, 'not')
    let survMine = 0
    let survNot = 0
    for (const axis of possibles) {
      if (axisPossible(axis, width, height, trialMine, totalMines)) survMine++
      if (axisPossible(axis, width, height, trialNot, totalMines)) survNot++
    }

    if (survMine >= n && survNot >= n) continue
    if (survMine === 0 && survNot === 0) continue

    const pMine = massMine / n
    const pNot = massNot / n
    const pctMine = survMine > 0 ? 100 / survMine : 0
    const pctNot = survNot > 0 ? 100 / survNot : 0
    const expectedPercent = pMine * pctMine + pNot * pctNot

    if (expectedPercent <= currentPercent + 1e-6) continue
    if (
      best == null ||
      expectedPercent > best.expectedPercent + 1e-6 ||
      (Math.abs(expectedPercent - best.expectedPercent) < 1e-6 &&
        i < best.index)
    ) {
      best = {
        index: i,
        expectedPercent,
        currentPercent
      }
    }
  }

  return best
}

export function solve(input: SolveInput): SolveResult {
  const { width, height, cells, enabled, totalMines } = input
  const candidates = listAxes(width, height, enabled)

  const axes: AxisInfo[] = candidates.map((c) => {
    const why = explainAxis(c.id, width, height, cells, totalMines)
    const possible = why == null
    return {
      id: c.id,
      family: c.family,
      status: possible ? ('possible' as const) : ('impossible' as const),
      percent: 0,
      why
    }
  })

  const possibleIds = axes
    .filter((a) => a.status === 'possible')
    .map((a) => a.id)

  const axisPercent = possibleIds.length > 0 ? 100 / possibleIds.length : 0
  for (const a of axes) {
    if (a.status === 'possible') a.percent = axisPercent
  }

  // Axis pairing only - Total-only forces are "unclued" (Mine Helper style).
  const certainAxis = intersectionCertain(possibleIds, width, height, cells)
  const certain = intersectionCertain(
    possibleIds,
    width,
    height,
    cells,
    totalMines
  )

  const unclued = new Set<number>()
  if (totalMines != null && possibleIds.length > 0) {
    for (const i of certain.keys()) {
      if (!certainAxis.has(i)) unclued.add(i)
    }
    for (const i of applyTotalRemainder(certain, cells, totalMines)) {
      unclued.add(i)
    }
  }

  // Mirror hints only when exactly one axis remains
  let mirrorHints = new Map<number, 'mine' | 'not'>()
  if (possibleIds.length === 1) {
    const only = possibleIds[0]
    mirrorHints = new Map(forcedByAxis(only, width, height, cells))
    if (totalMines != null) {
      for (const [i, mark] of forcedByTotal(
        only,
        width,
        height,
        cells,
        totalMines
      )) {
        if (!mirrorHints.has(i)) mirrorHints.set(i, mark)
      }
    }
  }

  const bestProbe = findBestProbe(
    possibleIds,
    width,
    height,
    cells,
    certain,
    totalMines
  )

  const marks = new Map<number, SolverMark>()
  for (const [i, mark] of certain) {
    marks.set(i, {
      kind: 'certain',
      mark,
      unclued: unclued.has(i) || undefined
    })
  }
  for (const [i, mark] of mirrorHints) {
    if (marks.has(i)) continue
    const isProbe = bestProbe?.index === i
    marks.set(i, { kind: 'hint', mark, probe: isProbe || undefined })
  }
  if (bestProbe != null && !marks.has(bestProbe.index)) {
    marks.set(bestProbe.index, {
      kind: 'probe',
      expectedPercent: Math.round(bestProbe.expectedPercent)
    })
  }

  return {
    axes,
    mirrorHints,
    certain,
    bestProbe,
    marks,
    possibleCount: possibleIds.length
  }
}

export function countMines(cells: UserCell[]): number {
  let n = 0
  for (const c of cells) {
    if (c.type === 'mine') n++
  }
  return n
}
