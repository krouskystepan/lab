import { listAxes } from './axes'
import { axisPossible } from './solve'
import type { EnabledFamilies, UserCell } from './types'

/**
 * After applying `next` at `index`, would at least one enabled axis stay possible?
 * Returns false when the paint contradicts every remaining candidate.
 */
export function placementLeavesAxis(
  width: number,
  height: number,
  cells: UserCell[],
  index: number,
  next: UserCell,
  enabled: EnabledFamilies,
  totalMines?: number
): boolean {
  const candidates = listAxes(width, height, enabled)
  if (candidates.length === 0) return true

  const trial = cells.slice()
  trial[index] = next

  return candidates.some((c) =>
    axisPossible(c.id, width, height, trial, totalMines)
  )
}
