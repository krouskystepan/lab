import { neighborsOf } from './neighbors'
import type { Cell } from './types'

/**
 * Reveal `start` and flood-fill through zero-adjacent cells.
 * Returns updated cells and how many newly revealed safe cells.
 * Does nothing if the cell is flagged or already revealed.
 * If start is a mine, reveals only that cell (caller handles loss).
 */
export function revealFlood(
  cells: Cell[],
  width: number,
  height: number,
  start: number
): { cells: Cell[]; revealed: number } {
  const next = cells.map((c) => ({ ...c }))
  const cell = next[start]
  if (!cell || cell.view === 'flagged' || cell.view === 'revealed') {
    return { cells: next, revealed: 0 }
  }

  if (cell.isMine) {
    cell.view = 'revealed'
    return { cells: next, revealed: 0 }
  }

  let revealed = 0
  const stack = [start]
  while (stack.length > 0) {
    const i = stack.pop()!
    const c = next[i]
    if (c.view === 'revealed' || c.view === 'flagged' || c.isMine) continue
    c.view = 'revealed'
    revealed++
    if (c.adjacent === 0) {
      for (const ni of neighborsOf(i, width, height)) {
        const n = next[ni]
        if (n.view === 'hidden' && !n.isMine) stack.push(ni)
      }
    }
  }

  return { cells: next, revealed }
}

/** Reveal every mine (and keep wrong flags visible) after a loss. */
export function revealAllMines(cells: Cell[]): Cell[] {
  return cells.map((c) =>
    c.isMine && c.view !== 'flagged' ? { ...c, view: 'revealed' as const } : c
  )
}
