import { applyPresses, emptyLights, encodeLights } from './board'
import { minSolution, solutionCount } from './solve'
import { DIFF_SIZE, type DiffId, type Puzzle } from './types'

/** Target min-press windows. Size climbs with difficulty; presses do too. */
const MOVES: Record<DiffId, { min: number; max: number }> = {
  easy: { min: 2, max: 4 },
  medium: { min: 4, max: 8 },
  hard: { min: 8, max: 14 },
  expert: { min: 12, max: 20 },
  insane: { min: 18, max: 28 }
}

export const PRESETS: { id: DiffId; size: number }[] = [
  { id: 'easy', size: 3 },
  { id: 'medium', size: 4 },
  { id: 'hard', size: 5 },
  { id: 'expert', size: 6 },
  { id: 'insane', size: 7 }
]

export function generate(diffId: DiffId, avoidId?: string): Puzzle {
  const size = DIFF_SIZE[diffId]
  const { min, max } = MOVES[diffId]
  const n = size * size
  let fallback: Puzzle | null = null

  for (let t = 0; t < 500; t++) {
    const presses = Array.from({ length: n }, () => false)
    const k = min + Math.floor(Math.random() * (max - min + 1))
    for (const i of pickDistinct(n, k)) presses[i] = true
    const lights = applyPresses(emptyLights(size), size, presses)
    if (lights.every((on) => !on)) continue
    const sol = minSolution(lights, size)
    if (!sol) continue
    const minMoves = solutionCount(sol)
    const id = `${diffId}-${encodeLights(lights)}`
    const puzzle: Puzzle = { id, diffId, size, lights, minMoves }
    if (id === avoidId) continue
    if (!fallback) fallback = puzzle
    if (minMoves >= min && minMoves <= max) return puzzle
  }

  return fallback ?? generateAny(diffId, avoidId)
}

function generateAny(diffId: DiffId, avoidId?: string): Puzzle {
  const size = DIFF_SIZE[diffId]
  const n = size * size
  for (let t = 0; t < 80; t++) {
    const presses = Array.from({ length: n }, () => Math.random() < 0.35)
    const lights = applyPresses(emptyLights(size), size, presses)
    if (lights.every((on) => !on)) continue
    const sol = minSolution(lights, size)
    if (!sol) continue
    const id = `${diffId}-${encodeLights(lights)}`
    if (id === avoidId) continue
    return { id, diffId, size, lights, minMoves: solutionCount(sol) }
  }
  const lights = applyPresses(emptyLights(size), size, [true, ...Array(n - 1).fill(false)])
  return {
    id: `${diffId}-${encodeLights(lights)}`,
    diffId,
    size,
    lights,
    minMoves: 1
  }
}

function pickDistinct(n: number, k: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, Math.min(k, n))
}
