import { neighborsOf } from './neighbors'
import type { GoalMode, NumberRole, UserCell } from './types'
import { t, valMinesWord, valNeighborsWord } from '../../../i18n'

export type Placement =
  | { type: 'number'; value: number | null; role: NumberRole }
  | { type: 'flagged' }
  | { type: 'blank' }
  | { type: 'empty' }

export type ValidateOptions = {
  /** When set, also reject placements that break the total mine count. */
  totalTargets?: number
  goalMode?: GoalMode
}

export function maxNumberForCell(
  index: number,
  width: number,
  height: number
): number {
  return neighborsOf(index, width, height).length
}

/** Known targets - same mode rules as the solver. */
function isKnownTarget(cell: UserCell, goalMode: GoalMode): boolean {
  if (cell.type === 'number' && cell.role === 'mine') return true
  if (cell.type === 'flagged') return goalMode !== 'hunt'
  return false
}

/** Known mines / empties among neighbors from user marks only (no speculation). */
function neighborTally(
  cells: UserCell[],
  clueIndex: number,
  width: number,
  height: number,
  goalMode: GoalMode
): { knownMines: number; unknowns: number } {
  let knownMines = 0
  let unknowns = 0
  for (const n of neighborsOf(clueIndex, width, height)) {
    const c = cells[n]
    if (isKnownTarget(c, goalMode)) knownMines++
    else if (c.type === 'empty') unknowns++
  }
  return { knownMines, unknowns }
}

function clueConflict(
  cells: UserCell[],
  clueIndex: number,
  width: number,
  height: number,
  goalMode: GoalMode
): string | null {
  const clue = cells[clueIndex]
  if (clue.type !== 'number' || clue.value == null) return null

  const { knownMines, unknowns } = neighborTally(
    cells,
    clueIndex,
    width,
    height,
    goalMode
  )

  if (knownMines > clue.value) {
    return t('val.tooMany', { value: clue.value, count: knownMines })
  }

  const need = clue.value - knownMines
  if (need > unknowns) {
    return t('val.needMore', {
      value: clue.value,
      need,
      mines: valMinesWord(need),
      unknowns,
      neighbors: valNeighborsWord(unknowns)
    })
  }

  return null
}

function localForceConflict(
  cells: UserCell[],
  focus: number,
  width: number,
  height: number,
  goalMode: GoalMode
): string | null {
  const clues = new Set<number>()
  if (cells[focus]?.type === 'number') clues.add(focus)
  for (const n of neighborsOf(focus, width, height)) {
    if (cells[n]?.type === 'number') clues.add(n)
  }

  for (const ci of clues) {
    const clue = cells[ci]
    if (clue.type !== 'number' || clue.value == null) continue

    const { knownMines, unknowns } = neighborTally(
      cells,
      ci,
      width,
      height,
      goalMode
    )
    const need = clue.value - knownMines
    if (need < 0 || need > unknowns) continue

    const neigh = neighborsOf(ci, width, height)
    const unknownIdxs = neigh.filter((n) => cells[n].type === 'empty')

    if (need === 0) continue

    if (need === unknownIdxs.length && unknownIdxs.length > 0) {
      for (const other of clues) {
        if (other === ci) continue
        const o = cells[other]
        if (o.type !== 'number' || o.value == null) continue
        const tally = neighborTally(cells, other, width, height, goalMode)
        const oNeed = o.value - tally.knownMines
        if (oNeed !== 0) continue
        for (const u of unknownIdxs) {
          if (neighborsOf(other, width, height).includes(u)) {
            return t('val.both')
          }
        }
      }
    }
  }

  return null
}

function countUserMines(cells: UserCell[], goalMode: GoalMode): number {
  let n = 0
  for (const c of cells) if (isKnownTarget(c, goalMode)) n++
  return n
}

function countEmpties(cells: UserCell[]): number {
  let n = 0
  for (const c of cells) if (c.type === 'empty') n++
  return n
}

export function validatePlacement(
  width: number,
  height: number,
  cells: UserCell[],
  index: number,
  placement: Placement,
  opts?: ValidateOptions
): string | null {
  if (placement.type === 'empty') return null

  const goalMode = opts?.goalMode ?? 'safe'
  const next = cells.slice()
  if (placement.type === 'number') {
    next[index] = {
      type: 'number',
      value: placement.value,
      role: placement.role
    }
  } else if (placement.type === 'flagged') {
    next[index] = { type: 'flagged' }
  } else {
    next[index] = { type: 'blank' }
  }

  if (placement.type === 'number') {
    // Info always needs a count; only mine/my-card may be "?" (unknown count).
    if (placement.value == null && placement.role === 'info') {
      return t('val.infoNeedsNumber')
    }
    if (placement.value != null) {
      const max = maxNumberForCell(index, width, height)
      if (placement.value > max) {
        if (max <= 3) {
          return t('val.corner', { value: placement.value, max })
        }
        if (max <= 5) {
          return t('val.edge', { value: placement.value, max })
        }
        return t('val.max', { value: placement.value, max })
      }
    }
  }

  const toCheck = new Set<number>()
  for (let i = 0; i < next.length; i++) {
    const c = next[i]
    if (c.type === 'number' && c.value != null) toCheck.add(i)
  }
  toCheck.add(index)
  for (const n of neighborsOf(index, width, height)) {
    toCheck.add(n)
  }

  for (const i of toCheck) {
    const reason = clueConflict(next, i, width, height, goalMode)
    if (reason) return reason
  }

  const forced = localForceConflict(next, index, width, height, goalMode)
  if (forced) return forced

  if (opts?.totalTargets !== undefined && opts.totalTargets >= 0) {
    const mines = countUserMines(next, goalMode)
    const empties = countEmpties(next)
    if (mines > opts.totalTargets) {
      return t('val.totalOver', { mines, total: opts.totalTargets })
    }
    if (mines + empties < opts.totalTargets) {
      return t('val.totalUnder', {
        max: mines + empties,
        total: opts.totalTargets
      })
    }
  }

  return null
}
