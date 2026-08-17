import type { BoardState } from './types'

/** Play-state snapshot for undo/redo (not difficulty / answer). */
export type PlaySnapshot = {
  guesses: BoardState['guesses']
  current: string
  status: BoardState['status']
  hinted: boolean[]
}

const MAX_HISTORY = 80

export function snapshotOf(state: BoardState): PlaySnapshot {
  return {
    guesses: state.guesses.map((g) => ({
      word: g.word,
      marks: g.marks.slice()
    })),
    current: state.current,
    status: state.status,
    hinted: state.hinted.slice()
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
    guesses: snap.guesses.map((g) => ({
      word: g.word,
      marks: g.marks.slice()
    })),
    current: snap.current,
    status: snap.status,
    hinted: snap.hinted.slice()
  }
}
