import { emptyNeighborsWord, targetsWord, t } from '../../../i18n'
import { cellRef, neighborsOf } from './neighbors'
import {
  MAX_ENUMERATION,
  chanceTip,
  type GoalMode,
  type SolveInput,
  type UserCell
} from './types'
import { remainingTargetNeed } from './validate'

export type WhyStep = {
  text: string
  /** Cells to emphasize while this step is active */
  cells?: number[]
}

export type CellExplanation = {
  cellIndex: number
  /** Shown as “Why A1 is …”, e.g. "100%", "50%", "Mine 3", "Flag" */
  resultLabel: string
  /** Subtitle under the title */
  meta: string
  percent: number
  hits: number
  total: number
  /** Probability-style explanation (layouts) */
  isChance: boolean
  /** Solver marked this chance cell as Best / Safest */
  best?: boolean
  safest?: boolean
  unclued?: boolean
  steps: WhyStep[]
  /** Number/info clue cells that drive this */
  clueCells: number[]
  /** Other empty cells in the same linked group / related set */
  peerCells: number[]
}

type Constraint = {
  cellIdxs: number[]
  count: number
  /** Absolute index of the number cell, or null for Total */
  clueIndex: number | null
}

function isUnknown(cell: UserCell): boolean {
  return cell.type === 'empty'
}

function isKnownTarget(cell: UserCell, goalMode: GoalMode = 'safe'): boolean {
  if (cell.type === 'number' && cell.role === 'mine') return true
  if (cell.type === 'flagged') return goalMode !== 'hunt'
  return false
}

function cellLabel(index: number, width: number): string {
  return cellRef(index, width)
}

function numberRoleLabel(goalMode: GoalMode): string {
  return goalMode === 'hunt' ? t('ex.numberHunt') : t('ex.numberSafe')
}

/** Certain target label: Vlajka/Flag in avoid mode, 100% in hunt (matches board). */
function certainTargetLabel(goalMode: GoalMode): string {
  return goalMode === 'hunt' ? t('ex.sure') : t('ex.flag')
}

/** Certain non-target label: 100% in safe mode, Flag in hunt (matches board). */
function certainAvoidLabel(goalMode: GoalMode): string {
  return goalMode === 'hunt' ? t('ex.flagHunt') : t('ex.sure')
}

function clueName(
  cell: UserCell,
  index: number,
  width: number,
  goalMode: GoalMode = 'safe'
): string {
  if (cell.type !== 'number') return cellLabel(index, width)
  // Avoid: Safe # is the only number mark (info role). Hunt: Moje vs Info.
  const kind =
    goalMode === 'safe'
      ? numberRoleLabel(goalMode)
      : cell.role === 'info'
        ? t('ex.info')
        : numberRoleLabel(goalMode)
  const value = cell.value == null ? '?' : cell.value
  return t('ex.clueAt', {
    kind,
    value,
    cell: cellLabel(index, width)
  })
}

function listLabels(idxs: number[], width: number, max = 4): string {
  if (idxs.length === 0) return ''
  if (idxs.length <= max) {
    return idxs.map((i) => cellLabel(i, width)).join(', ')
  }
  return `${idxs
    .slice(0, max)
    .map((i) => cellLabel(i, width))
    .join(', ')} ${t('ex.more', { n: idxs.length - max })}`
}

function buildConstraints(
  width: number,
  height: number,
  cells: UserCell[],
  unknownSet: Set<number>,
  knownTargetSet: Set<number>,
  goalMode: GoalMode
): Constraint[] {
  const constraints: Constraint[] = []

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    if (cell.type !== 'number' || cell.value == null) continue

    const neigh = neighborsOf(i, width, height)
    const unknowns: number[] = []
    let knownTargets = 0

    for (const n of neigh) {
      if (unknownSet.has(n)) unknowns.push(n)
      else if (knownTargetSet.has(n) || isKnownTarget(cells[n], goalMode))
        knownTargets++
    }

    const need = cell.value - knownTargets
    if (need < 0 || need > unknowns.length || unknowns.length === 0) continue

    constraints.push({ cellIdxs: unknowns, count: need, clueIndex: i })
  }

  return constraints
}

/** Treat other solver marks as known so local 100%/safe forces show up. */
function partitionEmpties(
  cells: UserCell[],
  focusIndex: number,
  goalMode: GoalMode,
  board?: import('./types').BoardCell[]
): {
  unknowns: number[]
  unknownSet: Set<number>
  knownTargetSet: Set<number>
} {
  const unknownSet = new Set<number>()
  const knownTargetSet = new Set<number>()

  for (let i = 0; i < cells.length; i++) {
    const u = cells[i]
    if (isKnownTarget(u, goalMode)) {
      knownTargetSet.add(i)
      continue
    }
    if (u.type !== 'empty') continue

    if (i === focusIndex) {
      unknownSet.add(i)
      continue
    }

    const mark = board?.[i]?.solver
    if (mark?.kind === 'target') {
      knownTargetSet.add(i)
      continue
    }
    if (mark?.kind === 'flagged') continue
    unknownSet.add(i)
  }

  return { unknowns: [...unknownSet], unknownSet, knownTargetSet }
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

function partialOk(
  assignment: boolean[],
  lastAssigned: number,
  constraints: { cellIdxs: number[]; count: number }[]
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

function satisfies(
  assignment: boolean[],
  constraints: { cellIdxs: number[]; count: number }[]
): boolean {
  for (const c of constraints) {
    let sum = 0
    for (const i of c.cellIdxs) {
      if (assignment[i]) sum++
    }
    if (sum !== c.count) return false
  }
  return true
}

function enumerate(
  n: number,
  constraints: { cellIdxs: number[]; count: number }[]
): boolean[][] {
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
      if (partialOk(assignment, pos, constraints)) dfs(pos + 1)
    }
  }

  dfs(0)
  return solutions
}

function toLocal(
  constraints: Constraint[],
  componentCells: number[]
): { cellIdxs: number[]; count: number; clueIndex: number | null }[] {
  const absToLocal = new Map(componentCells.map((abs, i) => [abs, i]))
  return constraints
    .map((c) => ({
      cellIdxs: c.cellIdxs
        .map((abs) => absToLocal.get(abs))
        .filter((v): v is number => v !== undefined),
      count: c.count,
      clueIndex: c.clueIndex
    }))
    .filter((c) => c.cellIdxs.length > 0)
}

/** 100% / safe forced by a single clue (no full enumeration needed). */
function tryExplainForcedByClue(
  width: number,
  cells: UserCell[],
  cellIndex: number,
  constraints: Constraint[],
  goalMode: GoalMode
): CellExplanation | null {
  const label = cellLabel(cellIndex, width)
  const direct = constraints.filter(
    (c) => c.clueIndex != null && c.cellIdxs.includes(cellIndex)
  )

  for (const c of direct) {
    if (c.count !== c.cellIdxs.length) continue
    const ci = c.clueIndex!
    const clue = cells[ci]
    if (clue.type !== 'number') continue
    const open = listLabels(c.cellIdxs, width)
    return {
      cellIndex,
      resultLabel: certainTargetLabel(goalMode),
      meta: t('ex.meta.forced'),
      percent: goalMode === 'hunt' ? 100 : 0,
      hits: 1,
      total: 1,
      isChance: true,
      clueCells: [ci],
      peerCells: c.cellIdxs.filter((i) => i !== cellIndex),
      steps: [
        {
          text: t('ex.forced.need', {
            clue: clueName(clue, ci, width, goalMode),
            count: c.count,
            mines: targetsWord(c.count, goalMode),
            n: c.cellIdxs.length,
            neighbors: emptyNeighborsWord(c.cellIdxs.length),
            open
          }),
          cells: [ci, ...c.cellIdxs]
        },
        {
          text: t(
            goalMode === 'hunt' ? 'ex.forced.allTargetHunt' : 'ex.forced.allMine',
            { cell: label }
          ),
          cells: [cellIndex]
        }
      ]
    }
  }

  for (const c of direct) {
    if (c.count !== 0) continue
    const ci = c.clueIndex!
    const clue = cells[ci]
    if (clue.type !== 'number') continue
    const open = listLabels(c.cellIdxs, width)
    return {
      cellIndex,
      resultLabel: certainAvoidLabel(goalMode),
      meta: t('ex.meta.ruledOut'),
      percent: goalMode === 'hunt' ? 0 : 100,
      hits: 0,
      total: 1,
      isChance: true,
      clueCells: [ci],
      peerCells: c.cellIdxs.filter((i) => i !== cellIndex),
      steps: [
        {
          text: t(
            goalMode === 'hunt' ? 'ex.forced.need0Hunt' : 'ex.forced.need0',
            {
              clue: clueName(clue, ci, width, goalMode),
              n: c.cellIdxs.length,
              neighbors: emptyNeighborsWord(c.cellIdxs.length),
              open
            }
          ),
          cells: [ci, ...c.cellIdxs]
        },
        {
          text: t(
            goalMode === 'hunt' ? 'ex.forced.safeHunt' : 'ex.forced.safe',
            { cell: label }
          ),
          cells: [cellIndex]
        }
      ]
    }
  }

  return null
}

/**
 * Why for empties with no local clue: leftover Total cards shared equally.
 */
function explainFromTotalRemainder(
  width: number,
  cells: UserCell[],
  cellIndex: number,
  totalTargets: number,
  goalMode: GoalMode,
  board?: import('./types').BoardCell[]
): CellExplanation | null {
  const totalRemaining = remainingTargetNeed(cells, totalTargets, goalMode)
  if (!totalRemaining) return null

  let accounted = 0
  const unmarked: number[] = []
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].type !== 'empty') continue
    if (i === cellIndex) {
      unmarked.push(i)
      continue
    }
    const mark = board?.[i]?.solver
    if (mark?.kind === 'target') accounted += 1
    else if (mark?.kind === 'chance') accounted += mark.p ?? mark.percent / 100
    else if (mark?.kind === 'flagged' || mark?.kind === 'conflict') {
      /* not a remaining target */
    } else {
      unmarked.push(i)
    }
  }
  if (unmarked.length === 0) return null

  const leftover = totalRemaining.need - accounted
  const eps = 1e-6
  if (leftover < -eps || leftover > unmarked.length + eps) return null

  const p = leftover / unmarked.length
  const minePercent = Math.max(0, Math.min(100, Math.round(p * 100)))
  const goalPercent =
    goalMode === 'hunt' ? minePercent : Math.max(0, 100 - minePercent)
  const certainMine = leftover >= unmarked.length - eps
  const certainSafe = leftover <= eps
  const peers = unmarked.filter((i) => i !== cellIndex)
  const label = cellLabel(cellIndex, width)
  const countShown = Math.round(leftover)

  const steps: WhyStep[] = [
    {
      text: t(
        goalMode === 'hunt' ? 'ex.totalKnownHunt' : 'ex.totalKnownSafe',
        { known: totalRemaining.known, total: totalTargets }
      )
    },
    {
      text: t(goalMode === 'hunt' ? 'ex.totalShareHunt' : 'ex.totalShareSafe', {
        count: countShown,
        mines: targetsWord(countShown, goalMode),
        n: unmarked.length,
        percent: goalPercent
      }),
      cells: unmarked
    }
  ]

  if (certainMine) {
    steps.push({
      text: t(
        goalMode === 'hunt' ? 'ex.totalAllHunt' : 'ex.totalAllSafe',
        { cell: label }
      ),
      cells: [cellIndex]
    })
  } else if (certainSafe) {
    steps.push({
      text: t(
        goalMode === 'hunt' ? 'ex.totalNoneHunt' : 'ex.totalNoneSafe',
        { cell: label }
      ),
      cells: [cellIndex]
    })
  }

  return {
    cellIndex,
    resultLabel: certainMine
      ? certainTargetLabel(goalMode)
      : certainSafe
        ? certainAvoidLabel(goalMode)
        : `${goalPercent}%`,
    meta: t('ex.meta.totalShare', { count: countShown, n: unmarked.length }),
    percent: minePercent,
    hits: certainMine ? 1 : certainSafe ? 0 : countShown,
    total: certainMine || certainSafe ? 1 : unmarked.length,
    isChance: true,
    clueCells: [],
    peerCells: peers,
    steps
  }
}

/**
 * Explain why an empty cell is certain (100%) or has a given chance %.
 * Works for both solver target and chance marks.
 */
export function explainChanceCell(
  input: SolveInput,
  cellIndex: number,
  board?: import('./types').BoardCell[]
): CellExplanation | null {
  const { width, height, cells, totalTargets, goalMode = 'safe' } = input
  if (cellIndex < 0 || cellIndex >= cells.length) return null
  if (!isUnknown(cells[cellIndex])) return null

  const { unknowns, unknownSet, knownTargetSet } = partitionEmpties(
    cells,
    cellIndex,
    goalMode,
    board
  )
  if (!unknownSet.has(cellIndex)) return null

  let constraints = buildConstraints(
    width,
    height,
    cells,
    unknownSet,
    knownTargetSet,
    goalMode
  )

  const needAmongUnknowns =
    totalTargets !== undefined ? totalTargets - knownTargetSet.size : undefined
  const useGlobal =
    needAmongUnknowns !== undefined &&
    needAmongUnknowns >= 0 &&
    needAmongUnknowns <= unknowns.length &&
    unknowns.length <= MAX_ENUMERATION

  if (useGlobal) {
    constraints = [
      ...constraints,
      { cellIdxs: [...unknowns], count: needAmongUnknowns, clueIndex: null }
    ]
  }

  const fromTotalRemainder = (): CellExplanation | null =>
    totalTargets !== undefined
      ? explainFromTotalRemainder(
          width,
          cells,
          cellIndex,
          totalTargets,
          goalMode,
          board
        )
      : null

  // Prefer a simple local forced explanation (covers most 100% / safe marks)
  const forced = tryExplainForcedByClue(
    width,
    cells,
    cellIndex,
    constraints,
    goalMode
  )
  if (forced) return forced

  const frontier = new Set<number>()
  for (const c of constraints) {
    for (const i of c.cellIdxs) frontier.add(i)
  }
  if (!frontier.has(cellIndex)) {
    return (
      fromTotalRemainder() ?? {
        cellIndex,
        resultLabel: t('ex.unknown'),
        meta: t('ex.meta.noClue'),
        percent: 0,
        hits: 0,
        total: 0,
        isChance: true,
        clueCells: [],
        peerCells: [],
        steps: [
          {
            text: t('ex.none', { cell: cellLabel(cellIndex, width) })
          }
        ]
      }
    )
  }

  const components = connectedComponents([...frontier], constraints)
  const component = components.find((comp) => comp.includes(cellIndex)) ?? null
  if (!component) return null

  if (component.length > MAX_ENUMERATION) {
    const label = cellLabel(cellIndex, width)
    const nearClues = [
      ...new Set(
        constraints
          .filter((c) => c.clueIndex != null && c.cellIdxs.includes(cellIndex))
          .map((c) => c.clueIndex!)
      )
    ]
    if (nearClues.length === 0) {
      const rem = fromTotalRemainder()
      if (rem) return rem
    }
    const mark = board?.[cellIndex]?.solver
    const chancePercent =
      mark?.kind === 'chance'
        ? goalMode === 'hunt'
          ? mark.percent
          : Math.max(0, Math.min(100, 100 - mark.percent))
        : null
    const resultLabel =
      chancePercent != null
        ? `${chancePercent}%`
        : mark?.kind === 'flagged'
          ? certainAvoidLabel(goalMode)
          : mark?.kind === 'target'
            ? certainTargetLabel(goalMode)
            : t('ex.unknown')
    return {
      cellIndex,
      resultLabel,
      meta: t('ex.meta.tooLarge'),
      percent:
        chancePercent ??
        (mark?.kind === 'flagged'
          ? goalMode === 'hunt'
            ? 0
            : 100
          : mark?.kind === 'target'
            ? goalMode === 'hunt'
              ? 100
              : 0
            : 0),
      hits: mark?.kind === 'target' ? 1 : 0,
      total: mark?.kind === 'target' || mark?.kind === 'flagged' ? 1 : 0,
      isChance: true,
      clueCells: nearClues,
      peerCells: component.filter((i) => i !== cellIndex).slice(0, 12),
      steps: [
        {
          text:
            chancePercent != null
              ? t(
                  goalMode === 'hunt' ? 'ex.largeChanceHunt' : 'ex.largeChance',
                  {
                    cell: label,
                    percent: chancePercent,
                    n: component.length
                  }
                )
              : mark?.kind === 'flagged'
                ? t(
                    goalMode === 'hunt' ? 'ex.largeSafeHunt' : 'ex.largeSafe',
                    { cell: label, n: component.length }
                  )
                : mark?.kind === 'target'
                  ? t(
                      goalMode === 'hunt' ? 'ex.large100Hunt' : 'ex.large100',
                      { cell: label, n: component.length }
                    )
                  : t('ex.largeOther', {
                      cell: label,
                      n: component.length,
                      max: MAX_ENUMERATION
                    }),
          cells: [cellIndex, ...nearClues]
        },
        ...(nearClues.length > 0
          ? [
              {
                text: t('ex.nearby', {
                  clues: nearClues
                    .map((ci) => clueName(cells[ci], ci, width, goalMode))
                    .join('; ')
                }),
                cells: nearClues
              }
            ]
          : [])
      ]
    }
  }

  const touching = constraints.filter((c) =>
    c.cellIdxs.some((i) => component.includes(i))
  )
  const local = toLocal(touching, component).filter(
    (c) => c.count >= 0 && c.count <= c.cellIdxs.length
  )
  if (local.length === 0) return null

  const solutions = enumerate(component.length, local)
  const clueCellsForUnsat = [
    ...new Set(
      touching.map((c) => c.clueIndex).filter((i): i is number => i !== null)
    )
  ]
  if (solutions.length === 0) {
    const label = cellLabel(cellIndex, width)
    return {
      cellIndex,
      resultLabel: t('ex.unknown'),
      meta: t('solve.contradiction'),
      percent: 0,
      hits: 0,
      total: 0,
      isChance: true,
      clueCells: clueCellsForUnsat,
      peerCells: component.filter((i) => i !== cellIndex),
      steps: [
        {
          text: t(
            goalMode === 'hunt' ? 'ex.unsatEmptyHunt' : 'ex.unsatEmpty',
            { cell: label }
          ),
          cells: [cellIndex, ...clueCellsForUnsat]
        },
        ...(clueCellsForUnsat.length > 0
          ? [
              {
                text: t('ex.cluesMatter', {
                  clues: clueCellsForUnsat
                    .map((ci) => clueName(cells[ci], ci, width, goalMode))
                    .join('; ')
                }),
                cells: clueCellsForUnsat
              }
            ]
          : [])
      ]
    }
  }

  const localIdx = component.indexOf(cellIndex)
  let hits = 0
  for (const sol of solutions) {
    if (sol[localIdx]) hits++
  }
  const total = solutions.length
  const percent = Math.round((hits / total) * 100)
  const certain = hits === total && total > 0

  const clueCells = [
    ...new Set(
      touching.map((c) => c.clueIndex).filter((i): i is number => i !== null)
    )
  ]
  const peerCells = component.filter((i) => i !== cellIndex)

  const steps: WhyStep[] = []
  const label = cellLabel(cellIndex, width)

  if (clueCells.length > 0) {
    steps.push({
      text: t('ex.cluesMatter', {
        clues: clueCells.map((ci) => clueName(cells[ci], ci, width, goalMode)).join('; ')
      }),
      cells: clueCells
    })
  }

  // Prefer clues that touch this cell; keep at most 3 constraint lines.
  const ordered = [
    ...touching.filter(
      (c) => c.clueIndex != null && c.cellIdxs.includes(cellIndex)
    ),
    ...touching.filter(
      (c) => c.clueIndex != null && !c.cellIdxs.includes(cellIndex)
    ),
    ...touching.filter((c) => c.clueIndex === null)
  ]
  let shown = 0
  for (const c of ordered) {
    if (shown >= 3) break
    if (c.clueIndex === null) {
      steps.push({
        text: t('ex.totalLeft', {
          count: c.count,
          mines: targetsWord(c.count, goalMode)
        }),
        cells: [cellIndex]
      })
      shown++
      continue
    }
    const clue = cells[c.clueIndex]
    if (clue.type !== 'number') continue
    const open = listLabels(c.cellIdxs, width)
    steps.push({
      text: t('ex.stillNeeds', {
        clue: clueName(clue, c.clueIndex, width, goalMode),
        count: c.count,
        open
      }),
      cells: [c.clueIndex, ...c.cellIdxs]
    })
    shown++
  }

  if (certain) {
    steps.push({
      text: t(
        goalMode === 'hunt' ? 'ex.everyLayoutHunt' : 'ex.everyLayout',
        { cell: label, total }
      ),
      cells: [cellIndex]
    })
  } else if (hits === 0) {
    steps.push({
      text: t(
        goalMode === 'hunt' ? 'ex.neverLayoutHunt' : 'ex.neverLayout',
        { cell: label, total }
      ),
      cells: [cellIndex]
    })
  } else {
    const goalPercent =
      goalMode === 'hunt'
        ? Math.max(0, Math.min(100, percent))
        : Math.max(0, Math.min(100, 100 - percent))
    const goalHits = goalMode === 'hunt' ? hits : total - hits
    steps.push({
      text: t(
        goalMode === 'hunt' ? 'ex.someLayoutHunt' : 'ex.someLayout',
        {
          cell: label,
          hits: goalHits,
          total,
          percent: goalPercent
        }
      ),
      cells: [cellIndex]
    })
  }

  // One mutual-exclusion hint max (50/50-style pair involving this cell)
  const uncertainLocals: number[] = []
  for (let i = 0; i < component.length; i++) {
    let h = 0
    for (const sol of solutions) if (sol[i]) h++
    if (h > 0 && h < total) uncertainLocals.push(i)
  }

  pairLoop: for (let a = 0; a < uncertainLocals.length; a++) {
    for (let b = a + 1; b < uncertainLocals.length; b++) {
      const i = uncertainLocals[a]
      const j = uncertainLocals[b]
      if (i !== localIdx && j !== localIdx) continue
      const exactlyOne = solutions.every(
        (sol) => (sol[i] ? 1 : 0) + (sol[j] ? 1 : 0) === 1
      )
      if (exactlyOne) {
        const other = component[i === localIdx ? j : i]
        steps.push({
          text: t(
            goalMode === 'hunt' ? 'ex.pairedHunt' : 'ex.paired',
            {
              other: cellLabel(other, width)
            }
          ),
          cells: [cellIndex, other]
        })
        break pairLoop
      }
    }
  }

  const certainMine = hits === total && total > 0
  const certainSafe = hits === 0 && total > 0
  const goalPercent =
    goalMode === 'hunt'
      ? Math.max(0, Math.min(100, percent))
      : Math.max(0, Math.min(100, 100 - percent))
  const goalHits = goalMode === 'hunt' ? hits : total - hits

  return {
    cellIndex,
    resultLabel: certainMine
      ? certainTargetLabel(goalMode)
      : certainSafe
        ? certainAvoidLabel(goalMode)
        : `${goalPercent}%`,
    meta: certainMine || certainSafe
      ? t(total === 1 ? 'ex.meta.certain1' : 'ex.meta.certainN', { n: total })
      : t(
          goalMode === 'hunt' ? 'ex.meta.layoutsHunt' : 'ex.meta.layoutsSafe',
          {
            hits: goalHits,
            total,
            percent: goalPercent
          }
        ),
    percent: goalPercent,
    hits,
    total,
    isChance: true,
    steps,
    clueCells,
    peerCells
  }
}

function explainPlacedNumber(
  width: number,
  height: number,
  cells: UserCell[],
  cellIndex: number,
  goalMode: GoalMode
): CellExplanation {
  const cell = cells[cellIndex]
  if (cell.type !== 'number') {
    return {
      cellIndex,
      resultLabel: t('ex.unknown'),
      meta: '',
      percent: 0,
      hits: 0,
      total: 0,
      isChance: false,
      steps: [{ text: t('ex.nothing') }],
      clueCells: [],
      peerCells: []
    }
  }

  const label = cellLabel(cellIndex, width)
  // Avoid: Safe # (info) = classic revealed safe. Hunt: Moje vs Info.
  const isTargetNum = cell.role === 'mine'
  const kind =
    goalMode === 'safe'
      ? numberRoleLabel(goalMode)
      : isTargetNum
        ? numberRoleLabel(goalMode)
        : t('ex.info')

  if (cell.value == null) {
    return {
      cellIndex,
      resultLabel: `${kind} ?`,
      meta: t(
        goalMode === 'hunt'
          ? 'ex.meta.placedUnknownHunt'
          : 'ex.meta.placedUnknown'
      ),
      percent: 100,
      hits: 1,
      total: 1,
      isChance: false,
      steps: [
        {
          text: t(
            goalMode === 'hunt'
              ? 'ex.placedUnknownHunt'
              : 'ex.placedUnknownMine',
            { kind, cell: label }
          ),
          cells: [cellIndex]
        }
      ],
      clueCells: [cellIndex],
      peerCells: []
    }
  }

  const neigh = neighborsOf(cellIndex, width, height)

  const empties: number[] = []
  let knownMines = 0
  const knownSafe: number[] = []

  for (const n of neigh) {
    const u = cells[n]
    if (u.type === 'empty') empties.push(n)
    else if (isKnownTarget(u, goalMode)) knownMines++
    else knownSafe.push(n)
  }

  const need = cell.value - knownMines
  const steps: WhyStep[] = []

  steps.push({
    text:
      goalMode === 'safe'
        ? t('ex.placedNumberSafe', {
            kind,
            value: cell.value,
            cell: label
          })
        : isTargetNum
          ? t('ex.placedNumberHunt', {
              kind,
              value: cell.value,
              cell: label
            })
          : t('ex.placedInfoHunt', {
              kind,
              value: cell.value,
              cell: label
            }),
    cells: [cellIndex]
  })

  if (knownMines > 0) {
    steps.push({
      text: t(
        goalMode === 'hunt' ? 'ex.knownTargetsHunt' : 'ex.knownMines',
        {
          known: knownMines,
          need,
          verb: need === 1 ? t('ex.word.is') : t('ex.word.are')
        }
      ),
      cells: [cellIndex]
    })
  }

  if (empties.length === 0) {
    steps.push({
      text:
        need === 0
          ? t('ex.allKnownOk')
          : t('ex.allKnownBad', {
              need,
              mines: targetsWord(need, goalMode)
            }),
      cells: [cellIndex]
    })
  } else {
    const open = listLabels(empties, width)
    const needCount = Math.max(0, need)
    steps.push({
      text: t('ex.stillNeedEmpties', {
        need: needCount,
        mines: targetsWord(needCount, goalMode),
        n: empties.length,
        neighbors: emptyNeighborsWord(empties.length),
        open
      }),
      cells: [cellIndex, ...empties]
    })

    if (need === 0) {
      steps.push({
        text: t(goalMode === 'hunt' ? 'ex.allSafeHunt' : 'ex.allSafe'),
        cells: empties
      })
    } else if (need === empties.length) {
      steps.push({
        text: t(
          goalMode === 'hunt' ? 'ex.allMustTargetHunt' : 'ex.allMustMine'
        ),
        cells: empties
      })
    } else if (need > 0 && empties.length > 0) {
      const percent = Math.round((need / empties.length) * 100)
      steps.push({
        text: t(goalMode === 'hunt' ? 'ex.equalSplitHunt' : 'ex.equalSplit', {
          percent,
          need: needCount,
          n: empties.length
        }),
        cells: empties
      })
    }
  }

  return {
    cellIndex,
    resultLabel: `${kind} ${cell.value}`,
    meta:
      goalMode === 'safe'
        ? t('ex.meta.placedSafe')
        : isTargetNum
          ? t('ex.meta.placedHunt')
          : t('ex.meta.clueOnly'),
    percent: 0,
    hits: 0,
    total: 0,
    isChance: false,
    steps,
    clueCells: [cellIndex],
    peerCells: empties
  }
}

function explainMarkedFlag(
  width: number,
  cellIndex: number,
  goalMode: GoalMode
): CellExplanation {
  const label = cellLabel(cellIndex, width)
  return {
    cellIndex,
    resultLabel: goalMode === 'hunt' ? t('ex.flagHunt') : t('ex.flag'),
    meta: t(
      goalMode === 'hunt' ? 'ex.meta.flagHunt' : 'ex.meta.flagMine'
    ),
    percent: goalMode === 'hunt' ? 0 : 100,
    hits: goalMode === 'hunt' ? 0 : 1,
    total: 1,
    isChance: false,
    steps: [
      {
        text: t(
          goalMode === 'hunt' ? 'ex.flaggedHunt' : 'ex.flagged',
          { cell: label }
        ),
        cells: [cellIndex]
      },
      {
        text: t(
          goalMode === 'hunt' ? 'ex.flagCountsHunt' : 'ex.flagCounts'
        ),
        cells: [cellIndex]
      }
    ],
    clueCells: [],
    peerCells: []
  }
}

function explainMarkedSafe(
  width: number,
  cellIndex: number,
  goalMode: GoalMode
): CellExplanation {
  const label = cellLabel(cellIndex, width)
  return {
    cellIndex,
    resultLabel: t('ex.safe'),
    meta: t(
      goalMode === 'hunt' ? 'ex.meta.safeFieldHunt' : 'ex.meta.safeField'
    ),
    percent: 0,
    hits: 0,
    total: 0,
    isChance: false,
    steps: [
      {
        text: t(
          goalMode === 'hunt' ? 'ex.markedSafeHunt' : 'ex.markedSafe',
          { cell: label }
        ),
        cells: [cellIndex]
      },
      {
        text: t('ex.skipNeighbors'),
        cells: [cellIndex]
      }
    ],
    clueCells: [],
    peerCells: []
  }
}

/**
 * Explain any cell: placed Mine/Info/Flag/Safe, or empty with solver marks.
 */
export function explainCell(
  input: SolveInput,
  cellIndex: number,
  board?: import('./types').BoardCell[]
): CellExplanation | null {
  const { width, height, cells } = input
  const goalMode = input.goalMode ?? 'safe'
  if (cellIndex < 0 || cellIndex >= cells.length) return null
  const user = cells[cellIndex]

  if (user.type === 'number') {
    return explainPlacedNumber(width, height, cells, cellIndex, goalMode)
  }
  if (user.type === 'flagged') {
    return explainMarkedFlag(width, cellIndex, goalMode)
  }
  if (user.type === 'blank') {
    return explainMarkedSafe(width, cellIndex, goalMode)
  }

  // Empty - probability / certainty / deduced flag
  const ex = explainChanceCell(input, cellIndex, board)
  if (!ex || !board) return ex
  const mark = board[cellIndex]?.solver
  if (mark?.kind !== 'chance') return ex

  const steps = [...ex.steps]
  const peerCells = [...ex.peerCells]
  const tip = chanceTip(mark)
  const isBest = tip === 'best'
  const isSafest = tip === 'safest'
  const isUnclued = tip === 'unclued'

  if (isBest) {
    const tip = explainBestPick(board, width, cellIndex)
    steps.push(...tip.steps)
    for (const i of tip.peers) {
      if (!peerCells.includes(i)) peerCells.push(i)
    }
  } else if (isSafest) {
    const otherSafest = board
      .map((c, i) => ({ c, i }))
      .filter(
        ({ c, i }) =>
          i !== cellIndex &&
          c.solver?.kind === 'chance' &&
          c.solver.safest
      )
      .map(({ i }) => i)
    steps.push({
      text: t(goalMode === 'hunt' ? 'ex.safestWhyHunt' : 'ex.safestWhySafe'),
      cells: [cellIndex]
    })
    if (otherSafest.length > 0) {
      steps.push({
        text: t('ex.safestWhyTied', {
          percent: mark.percent,
          peers: otherSafest.map((i) => cellLabel(i, width)).join(', ')
        }),
        cells: [cellIndex, ...otherSafest]
      })
      for (const i of otherSafest) {
        if (!peerCells.includes(i)) peerCells.push(i)
      }
    }
  } else if (isUnclued) {
    steps.push({
      text: t(
        goalMode === 'hunt' ? 'ex.uncluedWhyHunt' : 'ex.uncluedWhySafe'
      ),
      cells: [cellIndex]
    })
  }

  return {
    ...ex,
    best: isBest,
    safest: isSafest,
    unclued: isUnclued,
    steps,
    peerCells
  }
}

function explainBestPick(
  board: import('./types').BoardCell[],
  width: number,
  cellIndex: number
): { steps: WhyStep[]; peers: number[] } {
  const steps: WhyStep[] = [
    {
      text: t('ex.bestWhy'),
      cells: [cellIndex]
    }
  ]

  const otherBest = board
    .map((c, i) => ({ c, i }))
    .filter(
      ({ c, i }) =>
        i !== cellIndex && c.solver?.kind === 'chance' && c.solver.best
    )
    .map(({ i }) => i)

  if (otherBest.length === 0) return { steps, peers: [] }

  steps.push({
    text: t('ex.bestWhyTiedEqual', {
      peers: otherBest.map((i) => cellLabel(i, width)).join(', ')
    }),
    cells: [cellIndex, ...otherBest]
  })

  return { steps, peers: otherBest }
}

/** @deprecated prefer explainCell */
export const explainEmptyCell = explainChanceCell

/** One-line summary for hover / title. */
export function shortWhyHint(
  explanation: CellExplanation,
  width: number,
  cells: UserCell[],
  goalMode: GoalMode = 'safe'
): string {
  if (!explanation.isChance) {
    return `${explanation.resultLabel} · ${explanation.meta}`
  }
  const certain =
    explanation.hits === explanation.total && explanation.total > 0
  const certainSafe = explanation.hits === 0 && explanation.total > 0
  const goalHits =
    goalMode === 'hunt'
      ? explanation.hits
      : explanation.total - explanation.hits
  const parts = [
    certain
      ? t(
          goalMode === 'hunt'
            ? 'ex.hint.certainTargetHunt'
            : 'ex.hint.certainMine',
          { total: explanation.total }
        )
      : certainSafe
        ? t(
            goalMode === 'hunt' ? 'ex.hint.certainHunt' : 'ex.hint.certain',
            { total: explanation.total }
          )
        : t(
            goalMode === 'hunt' ? 'ex.hint.chanceHunt' : 'ex.hint.chance',
            {
              hits: goalHits,
              total: explanation.total,
              percent: explanation.percent
            }
          )
  ]
  if (explanation.safest) {
    parts.push(
      goalMode === 'hunt' ? t('why.surestTarget') : t('why.safest')
    )
  } else if (explanation.best) parts.push(t('why.best'))
  else if (explanation.unclued) parts.push(t('why.unclued'))
  if (explanation.clueCells.length > 0) {
    const names = explanation.clueCells
      .slice(0, 2)
      .map((i) => clueName(cells[i], i, width, goalMode))
    parts.push(names.join(', '))
    if (explanation.clueCells.length > 2) {
      parts.push(t('ex.more', { n: explanation.clueCells.length - 2 }))
    }
  }
  return parts.join(' · ')
}

/** Attach whyHint to solver marks on empty cells. */
export function attachWhyHints(
  board: import('./types').BoardCell[],
  width: number,
  height: number,
  totalTargets?: number,
  goalMode: GoalMode = 'safe'
): import('./types').BoardCell[] {
  const userCells = board.map((c) => c.user)
  const input = { width, height, cells: userCells, totalTargets, goalMode }
  return board.map((cell, i) => {
    const mark = cell.solver
    if (!mark) return cell
    if (
      mark.kind !== 'chance' &&
      mark.kind !== 'target' &&
      mark.kind !== 'flagged'
    ) {
      return cell
    }
    const ex = explainChanceCell(input, i, board)
    if (!ex) return cell
    const whyHint = shortWhyHint(ex, width, userCells, goalMode)
    if (mark.kind === 'target') {
      return { ...cell, solver: { kind: 'target', whyHint } }
    }
    if (mark.kind === 'flagged') {
      return { ...cell, solver: { kind: 'flagged', whyHint } }
    }
    return { ...cell, solver: { ...mark, whyHint } }
  })
}
