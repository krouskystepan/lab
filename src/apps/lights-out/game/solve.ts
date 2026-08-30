import { allOff, toggleInPlace } from './board'

/**
 * Chase-lights over GF(2): try every first-row press mask, then press
 * the cell below each still-on light. Complete for the plus-shaped toggle.
 * Returns a min-Hamming-weight solution, or null if unsolvable.
 */
export function minSolution(lights: boolean[], size: number): boolean[] | null {
  const n = size * size
  const limit = 1 << size
  let best: boolean[] | null = null
  let bestCount = Infinity

  for (let mask = 0; mask < limit; mask++) {
    const grid = lights.slice()
    const presses = Array.from({ length: n }, () => false)

    for (let c = 0; c < size; c++) {
      if (mask & (1 << c)) {
        presses[c] = true
        toggleInPlace(grid, size, c)
      }
    }

    for (let r = 1; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const above = (r - 1) * size + c
        if (!grid[above]) continue
        const i = r * size + c
        presses[i] = true
        toggleInPlace(grid, size, i)
      }
    }

    if (!allOff(grid)) continue

    let count = 0
    for (const p of presses) if (p) count++
    if (count < bestCount) {
      bestCount = count
      best = presses
    }
  }

  return best
}

export function solutionCount(presses: boolean[]): number {
  let n = 0
  for (const p of presses) if (p) n++
  return n
}

/** Index of one remaining press on a shortest remaining solution. */
export function hintIndex(lights: boolean[], size: number): number | null {
  if (allOff(lights)) return null
  const sol = minSolution(lights, size)
  if (!sol) return null
  const i = sol.findIndex(Boolean)
  return i < 0 ? null : i
}
