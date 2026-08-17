import type { DiffId } from './types'

export type DiffPreset = {
  id: DiffId
  maxGuesses: number
  hardMode: boolean
}

export const PRESETS: DiffPreset[] = [
  { id: 'easy', maxGuesses: 6, hardMode: false },
  { id: 'medium', maxGuesses: 6, hardMode: false },
  { id: 'hard', maxGuesses: 6, hardMode: true },
  { id: 'expert', maxGuesses: 5, hardMode: true },
  { id: 'random', maxGuesses: 6, hardMode: false }
]

export function presetById(id: DiffId): DiffPreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}
