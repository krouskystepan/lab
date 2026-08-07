import { neighborsOf } from './neighbors'
import type { Cell } from './types'

/** Place `mines` mines, excluding `safeIndex` and its neighbors. Fills adjacent counts. */
export function placeMines(
  cells: Cell[],
  width: number,
  height: number,
  mines: number,
  safeIndex: number
): Cell[] {
  const next = cells.map((c) => ({ ...c, isMine: false, adjacent: 0 }))
  const forbidden = new Set<number>([
    safeIndex,
    ...neighborsOf(safeIndex, width, height)
  ])
  const candidates: number[] = []
  for (let i = 0; i < next.length; i++) {
    if (!forbidden.has(i)) candidates.push(i)
  }

  const count = Math.min(mines, candidates.length)
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (candidates.length - i))
    const tmp = candidates[i]
    candidates[i] = candidates[j]
    candidates[j] = tmp
    next[candidates[i]].isMine = true
  }

  for (let i = 0; i < next.length; i++) {
    if (next[i].isMine) continue
    let n = 0
    for (const ni of neighborsOf(i, width, height)) {
      if (next[ni].isMine) n++
    }
    next[i].adjacent = n
  }

  return next
}
