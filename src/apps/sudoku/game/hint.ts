import { CELL_COUNT } from './board'
import { candidatesAt, valuesFromCells } from './generate'
import type { BoardState } from './types'

export type Hint = {
  index: number
  digit: number
  kind: 'naked' | 'hidden' | 'reveal'
}

function valuesOf(state: BoardState): number[] {
  return valuesFromCells(state.cells)
}

/** Naked single: only one candidate left in a cell. */
function findNakedSingle(values: number[]): Hint | null {
  for (let i = 0; i < CELL_COUNT; i++) {
    if (values[i] !== 0) continue
    const cands = candidatesAt(values, i)
    if (cands.length === 1) {
      return { index: i, digit: cands[0], kind: 'naked' }
    }
  }
  return null
}

/**
 * Hidden single: a digit appears as a candidate in only one cell
 * of a row, column, or box.
 */
function findHiddenSingle(values: number[]): Hint | null {
  for (let r = 0; r < 9; r++) {
    const hint = hiddenInUnit(values, (c) => r * 9 + c)
    if (hint) return hint
  }
  for (let c = 0; c < 9; c++) {
    const hint = hiddenInUnit(values, (r) => r * 9 + c)
    if (hint) return hint
  }
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3
    const bc = (b % 3) * 3
    const hint = hiddenInUnit(values, (k) => {
      const rr = br + Math.floor(k / 3)
      const cc = bc + (k % 3)
      return rr * 9 + cc
    })
    if (hint) return hint
  }
  return null
}

function hiddenInUnit(
  values: number[],
  at: (k: number) => number
): Hint | null {
  const positions: number[][] = Array.from({ length: 10 }, () => [])
  for (let k = 0; k < 9; k++) {
    const i = at(k)
    if (values[i] !== 0) continue
    for (const d of candidatesAt(values, i)) {
      positions[d].push(i)
    }
  }
  for (let d = 1; d <= 9; d++) {
    if (positions[d].length === 1) {
      return { index: positions[d][0], digit: d, kind: 'hidden' }
    }
  }
  return null
}

/** Fallback: fix a wrong cell, or fill the next empty from the solution. */
function findReveal(state: BoardState): Hint | null {
  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = state.cells[i]
    if (cell.given) continue
    if (cell.value !== 0 && cell.value !== state.solution[i]) {
      return { index: i, digit: state.solution[i], kind: 'reveal' }
    }
  }
  for (let i = 0; i < CELL_COUNT; i++) {
    if (state.cells[i].value === 0) {
      return { index: i, digit: state.solution[i], kind: 'reveal' }
    }
  }
  return null
}

/**
 * Next hint: prefer forced singles, otherwise reveal from the solution
 * so Hint never greys out until the puzzle is solved.
 */
export function findHint(state: BoardState): Hint | null {
  if (state.status === 'won') return null
  const values = valuesOf(state)
  return (
    findNakedSingle(values) ?? findHiddenSingle(values) ?? findReveal(state)
  )
}

/** Player-filled cells that disagree with the solution. */
export function findMistakes(state: BoardState): number[] {
  const out: number[] = []
  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = state.cells[i]
    if (cell.given || cell.value === 0) continue
    if (cell.value !== state.solution[i]) out.push(i)
  }
  return out
}

export function filledCount(state: BoardState): number {
  let n = 0
  for (const c of state.cells) {
    if (c.value !== 0) n++
  }
  return n
}
