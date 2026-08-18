import { BOX, CELL_COUNT, SIZE, canPlaceValues } from './board'

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function findEmpty(values: number[]): number {
  for (let i = 0; i < CELL_COUNT; i++) {
    if (values[i] === 0) return i
  }
  return -1
}

/** Fill empty cells; returns true if a complete grid was found. */
export function fillComplete(values: number[]): boolean {
  const i = findEmpty(values)
  if (i < 0) return true
  for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (!canPlaceValues(values, i, d)) continue
    values[i] = d
    if (fillComplete(values)) return true
    values[i] = 0
  }
  return false
}

/**
 * Count solutions up to `limit` (usually 2 for uniqueness).
 * Mutates `values` during search; restores on return.
 */
export function countSolutions(values: number[], limit = 2): number {
  const i = findEmpty(values)
  if (i < 0) return 1
  let found = 0
  for (let d = 1; d <= 9; d++) {
    if (!canPlaceValues(values, i, d)) continue
    values[i] = d
    found += countSolutions(values, limit - found)
    values[i] = 0
    if (found >= limit) return found
  }
  return found
}

export function hasUniqueSolution(values: number[]): boolean {
  return countSolutions(values.slice(), 2) === 1
}

/** Candidate digits for an empty cell given current filled values. */
export function candidatesAt(values: number[], index: number): number[] {
  if (values[index] !== 0) return []
  const out: number[] = []
  for (let d = 1; d <= 9; d++) {
    if (canPlaceValues(values, index, d)) out.push(d)
  }
  return out
}

export function valuesFromCells(cells: { value: number }[]): number[] {
  return cells.map((c) => c.value)
}

/** Band/stack shuffle for a known filled Latin-like seed - faster variety. */
function scrambleComplete(values: number[]): void {
  // Swap digits
  const map = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (let i = 0; i < CELL_COUNT; i++) {
    values[i] = map[values[i] - 1]
  }

  // Swap rows within bands
  for (let band = 0; band < BOX; band++) {
    const rows = shuffle([0, 1, 2]).map((r) => band * BOX + r)
    const copy = values.slice()
    for (let r = 0; r < BOX; r++) {
      const from = rows[r]
      const to = band * BOX + r
      for (let c = 0; c < SIZE; c++) {
        values[to * SIZE + c] = copy[from * SIZE + c]
      }
    }
  }

  // Swap cols within stacks
  for (let stack = 0; stack < BOX; stack++) {
    const cols = shuffle([0, 1, 2]).map((c) => stack * BOX + c)
    const copy = values.slice()
    for (let c = 0; c < BOX; c++) {
      const from = cols[c]
      const to = stack * BOX + c
      for (let r = 0; r < SIZE; r++) {
        values[r * SIZE + to] = copy[r * SIZE + from]
      }
    }
  }

  // Swap bands
  {
    const bands = shuffle([0, 1, 2])
    const copy = values.slice()
    for (let b = 0; b < BOX; b++) {
      const from = bands[b]
      for (let r = 0; r < BOX; r++) {
        const src = from * BOX + r
        const dst = b * BOX + r
        for (let c = 0; c < SIZE; c++) {
          values[dst * SIZE + c] = copy[src * SIZE + c]
        }
      }
    }
  }

  // Swap stacks
  {
    const stacks = shuffle([0, 1, 2])
    const copy = values.slice()
    for (let s = 0; s < BOX; s++) {
      const from = stacks[s]
      for (let c = 0; c < BOX; c++) {
        const src = from * BOX + c
        const dst = s * BOX + c
        for (let r = 0; r < SIZE; r++) {
          values[r * SIZE + dst] = copy[r * SIZE + src]
        }
      }
    }
  }
}

export type GeneratedPuzzle = {
  givens: number[]
  solution: number[]
}

/**
 * Build a unique puzzle with about `targetClues` filled cells.
 * Digs randomly while uniqueness holds.
 */
export function generatePuzzle(targetClues: number): GeneratedPuzzle {
  const solution = Array.from({ length: CELL_COUNT }, () => 0)
  fillComplete(solution)
  scrambleComplete(solution)

  const puzzle = solution.slice()
  const order = shuffle(Array.from({ length: CELL_COUNT }, (_, i) => i))

  let clues = CELL_COUNT
  for (const idx of order) {
    if (clues <= targetClues) break
    const keep = puzzle[idx]
    puzzle[idx] = 0
    if (!hasUniqueSolution(puzzle)) {
      puzzle[idx] = keep
    } else {
      clues--
    }
  }

  return { givens: puzzle, solution: solution.slice() }
}
