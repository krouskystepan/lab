import type { DiffId } from './types'
import { generatePuzzle, type GeneratedPuzzle } from './generate'

export type DiffPreset = {
  id: DiffId
  /** Approximate filled clue count. */
  clues: number
}

export const PRESETS: DiffPreset[] = [
  { id: 'easy', clues: 40 },
  { id: 'medium', clues: 34 },
  { id: 'hard', clues: 28 },
  { id: 'expert', clues: 24 }
]

export function presetById(id: DiffId): DiffPreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}

export function createPuzzle(diffId: DiffId): GeneratedPuzzle {
  return generatePuzzle(presetById(diffId).clues)
}
