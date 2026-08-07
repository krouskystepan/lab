import { neighborsOf } from './neighbors'
import type { BoardState } from './types'

export type HintMove =
  | { kind: 'flag'; index: number }
  | { kind: 'reveal'; index: number }

/**
 * Find one forced local move from revealed numbers:
 * - remaining empties must all be mines → flag one
 * - all mines already flagged → reveal one safe empty
 */
export function findHint(state: BoardState): HintMove | null {
  if (state.status === 'won' || state.status === 'lost') return null
  if (!state.generated) return null

  const { cells, width, height } = state

  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]
    if (c.view !== 'revealed' || c.isMine || c.adjacent === 0) continue

    const ns = neighborsOf(i, width, height)
    let flags = 0
    const hidden: number[] = []
    for (const ni of ns) {
      const n = cells[ni]
      if (n.view === 'flagged') flags++
      else if (n.view === 'hidden') hidden.push(ni)
    }
    if (hidden.length === 0) continue

    // All remaining neighbors must be mines
    if (flags + hidden.length === c.adjacent) {
      return { kind: 'flag', index: hidden[0] }
    }
    // All mines flagged - remaining are safe
    if (flags === c.adjacent) {
      return { kind: 'reveal', index: hidden[0] }
    }
  }

  return null
}
