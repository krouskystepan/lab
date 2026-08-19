import type { BoardState, GameStatus, Vehicle } from './types'
import { cloneVehicles } from './board'

export type PlaySnapshot = {
  vehicles: Vehicle[]
  moves: number
  status: GameStatus
}

const MAX_HISTORY = 80

export function snapshotOf(state: BoardState): PlaySnapshot {
  return {
    vehicles: cloneVehicles(state.vehicles),
    moves: state.moves,
    status: state.status
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
    this.past.push(cloneSnap(snap))
    this.future = []
    if (this.past.length > MAX_HISTORY) this.past.shift()
  }

  undo(current: PlaySnapshot): PlaySnapshot | null {
    const prev = this.past.pop()
    if (!prev) return null
    this.future.push(cloneSnap(current))
    if (this.future.length > MAX_HISTORY) this.future.shift()
    return prev
  }

  redo(current: PlaySnapshot): PlaySnapshot | null {
    const next = this.future.pop()
    if (!next) return null
    this.past.push(cloneSnap(current))
    if (this.past.length > MAX_HISTORY) this.past.shift()
    return next
  }
}

function cloneSnap(snap: PlaySnapshot): PlaySnapshot {
  return {
    vehicles: cloneVehicles(snap.vehicles),
    moves: snap.moves,
    status: snap.status
  }
}
