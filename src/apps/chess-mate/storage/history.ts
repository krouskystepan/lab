import type { Position } from '../solver/types'
import { clonePosition } from '../solver/fen'

const MAX = 80

export class PositionHistory {
  private past: Position[] = []
  private future: Position[] = []

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }

  push(pos: Position): void {
    this.past.push(clonePosition(pos))
    this.future = []
    if (this.past.length > MAX) this.past.shift()
  }

  undo(current: Position): Position | null {
    const prev = this.past.pop()
    if (!prev) return null
    this.future.push(clonePosition(current))
    if (this.future.length > MAX) this.future.shift()
    return prev
  }

  redo(current: Position): Position | null {
    const next = this.future.pop()
    if (!next) return null
    this.past.push(clonePosition(current))
    if (this.past.length > MAX) this.past.shift()
    return next
  }
}
