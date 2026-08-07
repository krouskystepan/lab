import { neighborsOf } from './neighbors'
import { t } from '../../../i18n'
import {
  MAX_ENUMERATION,
  type GoalMode,
  type SolveInput,
  type SolveResult,
  type SolverMark,
  type UserCell
} from './types'

interface Constraint {
  /** Absolute board indices (or component-local after toLocalConstraints) */
  cellIdxs: number[]
  count: number
  /** Board index of the clue that produced this constraint (omit for Total) */
  source?: number
}

function isUnknown(cell: UserCell): boolean {
  return cell.type === 'empty'
}

/**
 * Known targets for clue math (mode-dependent):
 * - Safe: flag = mine; Mina # = mine; Info # = not a mine.
 * - Hunt: Moje # = my card (target); Info # = clue only (not my card);
 *   Označené/flag = not my card. Number = how many of my cards among neighbors.
 */
function isKnownTarget(cell: UserCell, goalMode: GoalMode): boolean {
  if (cell.type === 'number' && cell.role === 'mine') return true
  if (cell.type === 'flagged') return goalMode !== 'hunt'
  return false
}

function buildLocalConstraints(
  width: number,
  height: number,
  cells: UserCell[],
  unknownSet: Set<number>,
  goalMode: GoalMode
): {
  constraints: Constraint[]
  contradiction: boolean
  conflictCells?: number[]
} {
  const constraints: Constraint[] = []

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    if (cell.type !== 'number' || cell.value == null) continue

    const neigh = neighborsOf(i, width, height)
    const unknowns: number[] = []
    let knownTargets = 0

    for (const n of neigh) {
      if (unknownSet.has(n)) {
        unknowns.push(n)
      } else if (isKnownTarget(cells[n], goalMode)) {
        knownTargets++
      }
    }

    const need = cell.value - knownTargets
    if (unknowns.length === 0) {
      if (need !== 0) {
        return { constraints: [], contradiction: true, conflictCells: [i] }
      }
      continue
    }
    if (need < 0 || need > unknowns.length) {
      return { constraints: [], contradiction: true, conflictCells: [i] }
    }

    constraints.push({ cellIdxs: unknowns, count: need, source: i })
  }

  return { constraints, contradiction: false }
}

/** Map absolute cell indices → component-local constraints */
function toLocalConstraints(
  constraints: Constraint[],
  componentCells: number[]
): Constraint[] {
  const absToLocal = new Map(componentCells.map((abs, i) => [abs, i]))
  return constraints
    .map((c) => ({
      cellIdxs: c.cellIdxs
        .map((abs) => absToLocal.get(abs))
        .filter((v): v is number => v !== undefined),
      count: c.count,
      source: c.source
    }))
    .filter((c) => c.cellIdxs.length > 0)
}

function uniqueSources(constraints: Constraint[]): number[] {
  const out: number[] = []
  const seen = new Set<number>()
  for (const c of constraints) {
    if (c.source === undefined || seen.has(c.source)) continue
    seen.add(c.source)
    out.push(c.source)
  }
  return out
}

/**
 * Shrink an unsatisfiable constraint set by dropping constraints that are not
 * needed for unsat. `localConstraints` must already use component-local indices.
 * Returns clue board indices (approx. where the conflict is).
 */
function conflictSourcesFromUnsat(
  n: number,
  localConstraints: Constraint[],
  fallbackCells: number[]
): number[] {
  let working = localConstraints.slice()
  for (const c of localConstraints) {
    const without = working.filter((x) => x !== c)
    if (without.length > 0 && enumerate(n, without).length === 0) {
      working = without
    }
  }
  const sources = uniqueSources(working)
  if (sources.length > 0) return sources
  return fallbackCells
}

function connectedComponents(
  unknowns: number[],
  constraints: Constraint[]
): number[][] {
  const cellSet = new Set(unknowns)
  const adj = new Map<number, Set<number>>()
  for (const u of unknowns) adj.set(u, new Set())

  for (const c of constraints) {
    const relevant = c.cellIdxs.filter((i) => cellSet.has(i))
    for (let a = 0; a < relevant.length; a++) {
      for (let b = a + 1; b < relevant.length; b++) {
        adj.get(relevant[a])!.add(relevant[b])
        adj.get(relevant[b])!.add(relevant[a])
      }
    }
  }

  const visited = new Set<number>()
  const components: number[][] = []

  for (const start of unknowns) {
    if (visited.has(start)) continue
    const stack = [start]
    visited.add(start)
    const comp: number[] = []
    while (stack.length) {
      const cur = stack.pop()!
      comp.push(cur)
      for (const n of adj.get(cur) ?? []) {
        if (!visited.has(n)) {
          visited.add(n)
          stack.push(n)
        }
      }
    }
    components.push(comp)
  }

  return components
}

function satisfies(assignment: boolean[], constraints: Constraint[]): boolean {
  for (const c of constraints) {
    let sum = 0
    for (const i of c.cellIdxs) {
      if (assignment[i]) sum++
    }
    if (sum !== c.count) return false
  }
  return true
}

function enumerate(n: number, constraints: Constraint[]): boolean[][] {
  const solutions: boolean[][] = []
  const assignment = new Array<boolean>(n).fill(false)

  function dfs(pos: number): void {
    if (pos === n) {
      if (satisfies(assignment, constraints)) {
        solutions.push(assignment.slice())
      }
      return
    }

    for (const bit of [false, true]) {
      assignment[pos] = bit
      if (partialOk(assignment, pos, constraints)) {
        dfs(pos + 1)
      }
    }
  }

  dfs(0)
  return solutions
}

function partialOk(
  assignment: boolean[],
  lastAssigned: number,
  constraints: Constraint[]
): boolean {
  for (const c of constraints) {
    let sum = 0
    let remaining = 0
    for (const i of c.cellIdxs) {
      if (i <= lastAssigned) {
        if (assignment[i]) sum++
      } else {
        remaining++
      }
    }
    if (sum > c.count) return false
    if (sum + remaining < c.count) return false
  }
  return true
}

function findChanceGroups(
  solutions: boolean[][],
  n: number
): { cells: number[]; percent: number }[] {
  if (solutions.length === 0) return []

  const uncertain: number[] = []
  for (let i = 0; i < n; i++) {
    let hits = 0
    for (const sol of solutions) if (sol[i]) hits++
    if (hits > 0 && hits < solutions.length) uncertain.push(i)
  }

  const used = new Set<number>()
  const groups: { cells: number[]; percent: number }[] = []

  // Exactly 1 of 2 → 50/50
  for (let a = 0; a < uncertain.length; a++) {
    for (let b = a + 1; b < uncertain.length; b++) {
      const i = uncertain[a]
      const j = uncertain[b]
      if (used.has(i) || used.has(j)) continue
      const exactlyOne = solutions.every(
        (sol) => (sol[i] ? 1 : 0) + (sol[j] ? 1 : 0) === 1
      )
      if (exactlyOne) {
        groups.push({ cells: [i, j], percent: 50 })
        used.add(i)
        used.add(j)
      }
    }
  }

  // Exactly 1 of 3 → 33/33/33
  for (let a = 0; a < uncertain.length; a++) {
    for (let b = a + 1; b < uncertain.length; b++) {
      for (let c = b + 1; c < uncertain.length; c++) {
        const i = uncertain[a]
        const j = uncertain[b]
        const k = uncertain[c]
        if (used.has(i) || used.has(j) || used.has(k)) continue
        const exactlyOne = solutions.every(
          (sol) => (sol[i] ? 1 : 0) + (sol[j] ? 1 : 0) + (sol[k] ? 1 : 0) === 1
        )
        if (exactlyOne) {
          groups.push({ cells: [i, j, k], percent: 33 })
          used.add(i)
          used.add(j)
          used.add(k)
        }
      }
    }
  }

  return groups
}

/**
 * Forced moves that are logically guaranteed on the full remaining set:
 * need==0 → all remaining flagged; need==remaining → all targets.
 * Must not be used to strip variables before enumerating a component.
 */
function applyTrivialDeductions(
  constraints: Constraint[],
  marks: Map<number, SolverMark>
): { ok: true } | { ok: false; conflictCells: number[] } {
  let changed = true
  while (changed) {
    changed = false
    for (const c of constraints) {
      const remaining: number[] = []
      let knownTargets = 0
      for (const i of c.cellIdxs) {
        const m = marks.get(i)
        if (m?.kind === 'target') knownTargets++
        else if (m?.kind !== 'flagged') remaining.push(i)
      }
      const need = c.count - knownTargets
      if (need < 0 || need > remaining.length) {
        const conflictCells =
          c.source !== undefined
            ? [c.source]
            : remaining.length > 0
              ? remaining
              : c.cellIdxs
        return { ok: false, conflictCells }
      }
      if (remaining.length === 0) continue

      if (need === 0) {
        for (const i of remaining) {
          marks.set(i, { kind: 'flagged' })
          changed = true
        }
      } else if (need === remaining.length) {
        for (const i of remaining) {
          marks.set(i, { kind: 'target' })
          changed = true
        }
      }
    }
  }
  return { ok: true }
}

function isUndecidedMark(
  marks: Map<number, SolverMark>,
  index: number
): boolean {
  const m = marks.get(index)
  return !m || m.kind === 'chance'
}

/**
 * Project a constraint onto openCells for enumeration.
 * Returns null to skip (no overlap). Returns { contradiction: true } if impossible.
 *
 * Never rewrites A+B+C=1 into C=1 while A/B are still undecided elsewhere -
 * that is the false-certainty bug. Only subtract proven targets; only drop
 * cells that are already flagged (fixed 0) or outside this component after
 * being fixed. If undecided cells lie outside openCells, refuse exact reduce.
 */
function projectConstraint(
  c: Constraint,
  openSet: Set<number>,
  marks: Map<number, SolverMark>
):
  | { kind: 'skip' }
  | { kind: 'contradiction'; source?: number }
  | { kind: 'exact'; cellIdxs: number[]; count: number; source?: number } {
  const open: number[] = []
  let knownTargets = 0
  let undecidedOutside = 0

  for (const i of c.cellIdxs) {
    if (openSet.has(i)) {
      open.push(i)
      continue
    }
    const m = marks.get(i)
    if (m?.kind === 'target') knownTargets++
    else if (m?.kind === 'flagged') {
      /* fixed 0 - drop from equation */
    } else if (isUndecidedMark(marks, i)) {
      undecidedOutside++
    }
  }

  const count = c.count - knownTargets

  if (open.length === 0) {
    if (undecidedOutside > 0) return { kind: 'skip' }
    if (count !== 0) return { kind: 'contradiction', source: c.source }
    return { kind: 'skip' }
  }

  // Undecided vars still outside this open set → do not invent a smaller equation
  if (undecidedOutside > 0) return { kind: 'skip' }

  if (count < 0 || count > open.length) {
    return { kind: 'contradiction', source: c.source }
  }
  return { kind: 'exact', cellIdxs: open, count, source: c.source }
}

/**
 * Enumerate every undecided cell in the component against the original
 * constraints (projected only by subtracting proven marks). Marks come solely
 * from solution frequencies: P=1 target, P=0 flagged, else chance.
 */
function solveComponent(
  componentCells: number[],
  allConstraints: Constraint[],
  marks: Map<number, SolverMark>,
  nextGroupId: { value: number }
): { ok: true } | { ok: false; conflictCells: number[] } {
  const openCells = componentCells.filter((i) => isUndecidedMark(marks, i))
  if (openCells.length === 0) return { ok: true }
  if (openCells.length > MAX_ENUMERATION) return { ok: true }

  const openSet = new Set(openCells)
  const touching: Constraint[] = []

  for (const c of allConstraints) {
    const projected = projectConstraint(c, openSet, marks)
    if (projected.kind === 'skip') continue
    if (projected.kind === 'contradiction') {
      const conflictCells =
        projected.source !== undefined ? [projected.source] : openCells
      return { ok: false, conflictCells }
    }
    touching.push({
      cellIdxs: projected.cellIdxs,
      count: projected.count,
      source: projected.source
    })
  }

  const local = toLocalConstraints(touching, openCells)
  if (local.length === 0) return { ok: true }
  if (local.some((c) => c.count > c.cellIdxs.length || c.count < 0)) {
    const bad = local.filter((c) => c.count > c.cellIdxs.length || c.count < 0)
    const sources = uniqueSources(bad)
    return {
      ok: false,
      conflictCells: sources.length > 0 ? sources : openCells
    }
  }

  const solutions = enumerate(openCells.length, local)
  if (solutions.length === 0) {
    return {
      ok: false,
      conflictCells: conflictSourcesFromUnsat(
        openCells.length,
        local,
        openCells
      )
    }
  }

  const probs = new Array<number>(openCells.length).fill(0)
  for (const sol of solutions) {
    for (let i = 0; i < openCells.length; i++) {
      if (sol[i]) probs[i]++
    }
  }
  for (let i = 0; i < openCells.length; i++) {
    probs[i] /= solutions.length
  }

  const chanceGroups = findChanceGroups(solutions, openCells.length)
  const inChance = new Map<number, number>()
  for (const g of chanceGroups) {
    const groupId = nextGroupId.value++
    for (const localIdx of g.cells) inChance.set(localIdx, groupId)
  }

  for (let i = 0; i < openCells.length; i++) {
    const abs = openCells[i]
    const p = probs[i]
    if (p === 1) {
      marks.set(abs, { kind: 'target' })
    } else if (p === 0) {
      marks.set(abs, { kind: 'flagged' })
    } else {
      const percent = Math.max(1, Math.min(99, Math.round(p * 100)))
      const groupId = inChance.get(i) ?? nextGroupId.value++
      marks.set(abs, { kind: 'chance', percent, groupId, p })
    }
  }
  return { ok: true }
}

/**
 * When the full clue set is impossible, still show epistemic % from the
 * largest single “partial” clue (e.g. 1 of 3 → 33%), and mark conflicting
 * clues. That matches “chance before click”, not a hidden true state.
 */
function recoverEpistemicChances(
  component: number[],
  allConstraints: Constraint[],
  marks: Map<number, SolverMark>,
  nextGroupId: { value: number },
  conflictCells: number[]
): boolean {
  const compSet = new Set(component)
  let best: Constraint | null = null
  for (const c of allConstraints) {
    if (c.cellIdxs.length === 0) continue
    if (!c.cellIdxs.every((i) => compSet.has(i))) continue
    if (c.count <= 0 || c.count >= c.cellIdxs.length) continue
    if (!best || c.cellIdxs.length > best.cellIdxs.length) best = c
  }
  if (!best) return false

  const openCells = best.cellIdxs
  const local = [
    {
      cellIdxs: openCells.map((_, i) => i),
      count: best.count,
      source: best.source
    }
  ]
  const solutions = enumerate(openCells.length, local)
  if (solutions.length === 0) return false

  const probs = new Array<number>(openCells.length).fill(0)
  for (const sol of solutions) {
    for (let i = 0; i < openCells.length; i++) {
      if (sol[i]) probs[i]++
    }
  }
  for (let i = 0; i < openCells.length; i++) {
    probs[i] /= solutions.length
  }

  const groupId = nextGroupId.value++
  for (let i = 0; i < openCells.length; i++) {
    const abs = openCells[i]
    const p = probs[i]
    if (p === 1) {
      marks.set(abs, { kind: 'target' })
    } else if (p === 0) {
      marks.set(abs, { kind: 'flagged' })
    } else {
      const percent = Math.max(1, Math.min(99, Math.round(p * 100)))
      marks.set(abs, { kind: 'chance', percent, groupId, p })
    }
  }

  for (const i of conflictCells) {
    const existing = marks.get(i)
    // Don't wipe epistemic % on empties - only flag clue cells.
    if (existing?.kind === 'chance' || existing?.kind === 'target') continue
    marks.set(i, { kind: 'conflict' })
  }
  return true
}

/**
 * On oversized frontiers, still compute % for small local clue pockets.
 * Example: C1 needs 1 of {B1,D1,C2} → 33% even when the rest of the board
 * is too large to fully enumerate.
 *
 * Strategy: build each clue’s remaining open set; if ≤ MAX, treat as a pocket.
 * Connected pocket clusters that fit in MAX are solved jointly; oversized
 * chains fall back to tightest pockets first (no overwrite of existing marks).
 */
function solveLocalPockets(
  remaining: number[],
  allConstraints: Constraint[],
  marks: Map<number, SolverMark>,
  nextGroupId: { value: number }
): boolean {
  const remSet = new Set(remaining)
  const pockets: Constraint[] = []

  for (const c of allConstraints) {
    const open: number[] = []
    let knownTargets = 0
    for (const i of c.cellIdxs) {
      if (!remSet.has(i)) {
        if (marks.get(i)?.kind === 'target') knownTargets++
        continue
      }
      const m = marks.get(i)
      if (m?.kind === 'target') {
        knownTargets++
        continue
      }
      if (m?.kind === 'flagged') continue
      open.push(i)
    }
    const count = c.count - knownTargets
    if (open.length === 0) continue
    if (count < 0 || count > open.length) continue
    if (open.length > MAX_ENUMERATION) continue
    pockets.push({ cellIdxs: open, count, source: c.source })
  }

  if (pockets.length === 0) return false

  const pocketCells = [...new Set(pockets.flatMap((p) => p.cellIdxs))]
  const clusters = connectedComponents(pocketCells, pockets)
  let painted = false

  for (const cluster of clusters) {
    if (cluster.length <= MAX_ENUMERATION) {
      const relevant = pockets.filter((p) =>
        p.cellIdxs.every((i) => cluster.includes(i))
      )
      const before = marks.size
      const solved = solveComponent(cluster, relevant, marks, nextGroupId)
      if (solved.ok && marks.size > before) painted = true
      continue
    }

    // Chained too large: apply tightest pockets first, skip cells already marked.
    const ordered = [...pockets]
      .filter((p) => p.cellIdxs.some((i) => cluster.includes(i)))
      .sort((a, b) => a.cellIdxs.length - b.cellIdxs.length)

    for (const p of ordered) {
      if (p.cellIdxs.some((i) => marks.has(i))) continue
      const before = marks.size
      const solved = solveComponent(p.cellIdxs, [p], marks, nextGroupId)
      if (solved.ok && marks.size > before) painted = true
    }
  }

  return painted
}

function contradictionResult(conflictCells?: number[]): SolveResult {
  return {
    ok: false,
    error: 'contradiction',
    message: t('solve.contradiction'),
    conflictCells:
      conflictCells && conflictCells.length > 0 ? conflictCells : undefined
  }
}

export function solve(input: SolveInput): SolveResult {
  const { width, height, cells, totalTargets, goalMode = 'safe' } = input
  const size = width * height
  if (cells.length !== size) {
    return {
      ok: true,
      marks: new Map(),
      notice: t('solve.mismatch')
    }
  }

  const unknowns: number[] = []
  for (let i = 0; i < size; i++) {
    if (isUnknown(cells[i])) unknowns.push(i)
  }
  const unknownSet = new Set(unknowns)

  const built = buildLocalConstraints(
    width,
    height,
    cells,
    unknownSet,
    goalMode
  )
  if (built.contradiction) {
    return contradictionResult(built.conflictCells)
  }
  const localConstraints = built.constraints

  const marks = new Map<number, SolverMark>()

  let constraints = localConstraints
  const useGlobal =
    totalTargets !== undefined &&
    totalTargets >= 0 &&
    totalTargets <= unknowns.length &&
    unknowns.length <= MAX_ENUMERATION

  if (useGlobal) {
    constraints = [
      ...localConstraints,
      { cellIdxs: [...unknowns], count: totalTargets! }
    ]
  }

  // Connected components over the ORIGINAL unknowns - do not strip variables
  // with trivial deductions before enumeration (that rewrote A+B+C=1 → C=1).
  const frontierSet = new Set<number>()
  for (const c of constraints) {
    for (const i of c.cellIdxs) frontierSet.add(i)
  }

  const nextGroupId = { value: 0 }
  const largeComponents: number[][] = []
  let usedPartialRecovery = false

  if (frontierSet.size > 0) {
    const components = connectedComponents([...frontierSet], constraints)
    for (const comp of components) {
      if (comp.length > MAX_ENUMERATION) {
        largeComponents.push(comp)
        continue
      }
      const solved = solveComponent(comp, constraints, marks, nextGroupId)
      if (!solved.ok) {
        if (
          recoverEpistemicChances(
            comp,
            constraints,
            marks,
            nextGroupId,
            solved.conflictCells ?? []
          )
        ) {
          usedPartialRecovery = true
          continue
        }
        return contradictionResult(solved.conflictCells)
      }
    }
  }

  // Oversized components: forced moves only, then enumerate any small leftovers.
  // Trivial runs AFTER component discovery so it cannot split A+B+C=1 before enum.
  if (largeComponents.length > 0) {
    const trivial = applyTrivialDeductions(constraints, marks)
    if (!trivial.ok) return contradictionResult(trivial.conflictCells)
    for (const comp of largeComponents) {
      const remaining = comp.filter((i) => isUndecidedMark(marks, i))
      if (remaining.length === 0) continue
      if (remaining.length <= MAX_ENUMERATION) {
        const solved = solveComponent(
          remaining,
          constraints,
          marks,
          nextGroupId
        )
        if (!solved.ok) {
          if (
            recoverEpistemicChances(
              remaining,
              constraints,
              marks,
              nextGroupId,
              solved.conflictCells ?? []
            )
          ) {
            usedPartialRecovery = true
            continue
          }
          return contradictionResult(solved.conflictCells)
        }
        continue
      }
      // Still too big: enumerate local “pockets” (per-clue / small clusters)
      // so a 1-of-3 next to C1 still shows 33% on a large board.
      // Still too big for one full enum: solve small local clue pockets
      // silently (e.g. 1-of-3 → 33%) so the user still sees useful %.
      solveLocalPockets(remaining, constraints, marks, nextGroupId)
    }
  }

  // Highlight most informative + goal tip among chance (%) cells
  markBestChanceMove(marks, localConstraints, goalMode)
  markGoalTipChanceMove(marks, goalMode)

  let notice: string | undefined
  let noticeTone: 'info' | 'warn' | undefined
  if (usedPartialRecovery) {
    notice = t('solve.conflictPartial')
    noticeTone = 'warn'
  } else if (marks.size === 0) {
    notice =
      localConstraints.length === 0 ? t('solve.nothing') : t('solve.noForced')
    noticeTone = 'info'
  } else if (
    totalTargets !== undefined &&
    !useGlobal &&
    unknowns.length > MAX_ENUMERATION
  ) {
    notice = t('solve.totalIgnored')
    noticeTone = 'warn'
  }

  return { ok: true, marks, notice, noticeTone }
}

function entropy(p: number): number {
  if (p <= 0 || p >= 1) return 0
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p)
}

/** Among chance cells, mark the most informative guess(es) - all ties. */
function markBestChanceMove(
  marks: Map<number, SolverMark>,
  constraints: Constraint[],
  goalMode: GoalMode
): void {
  const chances: { index: number; p: number; score: number }[] = []

  const degree = new Map<number, number>()
  for (const c of constraints) {
    for (const i of c.cellIdxs) {
      degree.set(i, (degree.get(i) ?? 0) + 1)
    }
  }

  for (const [index, mark] of marks) {
    if (mark.kind !== 'chance') continue
    const p = mark.p ?? mark.percent / 100
    const goalBoost = goalMode === 'hunt' ? p : 1 - p
    const deg = degree.get(index) ?? 0
    const score = entropy(p) * 10 + goalBoost * 2 + deg * 0.15
    chances.push({ index, p, score })
  }

  if (chances.length === 0) return

  let bestScore = -Infinity
  for (const c of chances) {
    if (c.score > bestScore) bestScore = c.score
  }

  // Float-safe: mark every cell that ties for the top score
  const eps = 1e-9
  for (const c of chances) {
    if (c.score < bestScore - eps) continue
    const prev = marks.get(c.index)
    if (!prev || prev.kind !== 'chance') continue
    marks.set(c.index, { ...prev, best: true })
  }
}

/**
 * Goal tip among chance cells:
 * - safe: lowest mine % (safest click)
 * - hunt: highest mine % (surest target)
 * All cells tied for the top tip % are marked.
 */
function markGoalTipChanceMove(
  marks: Map<number, SolverMark>,
  goalMode: GoalMode
): void {
  const chances: { index: number; percent: number }[] = []

  for (const [index, mark] of marks) {
    if (mark.kind === 'chance') {
      chances.push({ index, percent: mark.percent })
    }
  }

  if (chances.length === 0) return

  let tipMinePercent = goalMode === 'hunt' ? -Infinity : Infinity
  for (const c of chances) {
    if (goalMode === 'hunt') {
      if (c.percent > tipMinePercent) tipMinePercent = c.percent
    } else if (c.percent < tipMinePercent) {
      tipMinePercent = c.percent
    }
  }
  if (!Number.isFinite(tipMinePercent)) return
  if (goalMode === 'safe' && tipMinePercent >= 100) return
  if (goalMode === 'hunt' && tipMinePercent <= 0) return

  for (const c of chances) {
    if (c.percent !== tipMinePercent) continue
    const prev = marks.get(c.index)
    if (!prev || prev.kind !== 'chance') continue
    marks.set(c.index, { ...prev, safest: true })
  }
}
