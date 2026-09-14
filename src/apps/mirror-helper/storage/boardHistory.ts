import type { BoardCell, CellAspect, EnabledFamilies } from '../solver/types'

export type BoardSnapshot = {
  width: number
  height: number
  cellAspect: CellAspect
  cells: BoardCell[]
  enabled: EnabledFamilies
}

const MAX_HISTORY = 80

export function cloneCells(cells: BoardCell[]): BoardCell[] {
  return cells.map((c) => ({
    user: c.user,
    solver: c.solver
  }))
}

export function cloneSnapshot(s: BoardSnapshot): BoardSnapshot {
  return {
    width: s.width,
    height: s.height,
    cellAspect: s.cellAspect,
    cells: cloneCells(s.cells),
    enabled: { ...s.enabled }
  }
}

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

  push(snapshot: BoardSnapshot): void {
    this.past.push(cloneSnapshot(snapshot))
    this.future = []
    if (this.past.length > MAX_HISTORY) this.past.shift()
  }

  undo(current: BoardSnapshot): BoardSnapshot | null {
    const prev = this.past.pop()
    if (!prev) return null
    this.future.push(cloneSnapshot(current))
    if (this.future.length > MAX_HISTORY) this.future.shift()
    return prev
  }

  redo(current: BoardSnapshot): BoardSnapshot | null {
    const next = this.future.pop()
    if (!next) return null
    this.past.push(cloneSnapshot(current))
    if (this.past.length > MAX_HISTORY) this.past.shift()
    return next
  }
}
