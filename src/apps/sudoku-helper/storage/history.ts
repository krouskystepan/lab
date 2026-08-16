import type { BoardCell } from '../solver/types'

export type BoardSnapshot = {
  cells: BoardCell[]
}

const MAX = 80

export class BoardHistory {
  private past: BoardSnapshot[] = []
  private future: BoardSnapshot[] = []

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

  push(snap: BoardSnapshot): void {
    this.past.push(clone(snap))
    this.future = []
    if (this.past.length > MAX) this.past.shift()
  }

  undo(current: BoardSnapshot): BoardSnapshot | null {
    const prev = this.past.pop()
    if (!prev) return null
    this.future.push(clone(current))
    if (this.future.length > MAX) this.future.shift()
    return prev
  }

  redo(current: BoardSnapshot): BoardSnapshot | null {
    const next = this.future.pop()
    if (!next) return null
    this.past.push(clone(current))
    if (this.past.length > MAX) this.past.shift()
    return next
  }
}

function clone(snap: BoardSnapshot): BoardSnapshot {
  return {
    cells: snap.cells.map((c) => ({
      user: { ...c.user },
      solver: c.solver
        ? {
            candidates: [...c.solver.candidates],
            single: c.solver.single
              ? { ...c.solver.single }
              : undefined,
            conflict: c.solver.conflict
          }
        : undefined
    }))
  }
}

export function snapshotOf(cells: BoardCell[]): BoardSnapshot {
  return clone({ cells })
}
