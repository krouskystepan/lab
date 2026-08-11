import type { BoardState } from './types'

/** Play-state snapshot for undo/redo (not difficulty / solution). */
export type PlaySnapshot = {
  cells: BoardState['cells']
  status: BoardState['status']
  filledCount: number
}

const MAX_HISTORY = 80

export function snapshotOf(state: BoardState): PlaySnapshot {
  return {
    cells: state.cells.map((c) => ({ ...c })),
    status: state.status,
    filledCount: state.filledCount
  }
}

export class PlayHistory {
  private past: PlaySnapshot[] = []
  private future: PlaySnapshot[] = []

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }

  clear(): void {
    this.past = []
    this.future = []
  }

  push(snap: PlaySnapshot): void {
    this.past.push({
      ...snap,
      cells: snap.cells.map((c) => ({ ...c }))
    })
    this.future = []
    if (this.past.length > MAX_HISTORY) this.past.shift()
  }

  undo(current: PlaySnapshot): PlaySnapshot | null {
    const prev = this.past.pop()
    if (!prev) return null
    this.future.push({
      ...current,
      cells: current.cells.map((c) => ({ ...c }))
    })
    if (this.future.length > MAX_HISTORY) this.future.shift()
    return prev
  }

  redo(current: PlaySnapshot): PlaySnapshot | null {
    const next = this.future.pop()
    if (!next) return null
    this.past.push({
      ...current,
      cells: current.cells.map((c) => ({ ...c }))
    })
    if (this.past.length > MAX_HISTORY) this.past.shift()
    return next
  }
}
