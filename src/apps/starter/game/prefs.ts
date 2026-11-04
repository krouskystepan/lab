import { createInitial } from './engine'
import type { BoardState } from './types'

const KEY = 'krouskylab.starter.v1'

export function loadGame(): BoardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createInitial()
    const parsed = JSON.parse(raw) as { board?: BoardState }
    if (!parsed.board?.wires?.length) return createInitial()
    // Always fresh loom on reload so roles stay unknown
    return createInitial()
  } catch {
    return createInitial()
  }
}

export function saveGame(_board: BoardState): void {
  // Intentionally not persisting mid-hotwire (roles would leak on reload)
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1 }))
  } catch {
    /* ignore */
  }
}
