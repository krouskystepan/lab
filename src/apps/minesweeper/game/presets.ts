import type { DiffId, DiffPreset } from './types'

export const MIN_GRID = 5
export const MAX_GRID = 50

/** Classic boards - size shortcuts + reference densities. */
export const PRESETS: readonly DiffPreset[] = [
  { id: 'beginner', width: 9, height: 9, mines: 10 },
  { id: 'intermediate', width: 16, height: 16, mines: 40 },
  { id: 'expert', width: 30, height: 16, mines: 99 },
  { id: 'crazy', width: 30, height: 24, mines: 200 }
] as const

/** Mine density from classic presets (applied to any size). */
export const DENSITY: Record<DiffId, number> = {
  beginner: 10 / 81,
  intermediate: 40 / 256,
  expert: 99 / 480,
  crazy: 200 / 720
}

export function presetById(id: DiffId): DiffPreset {
  const found = PRESETS.find((p) => p.id === id)
  return found ?? PRESETS[0]
}

export function clampGrid(n: number): number {
  if (Number.isNaN(n)) return MIN_GRID
  return Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(n)))
}

/** Max mines so first-click safe island (cell + neighbors) can still exist. */
export function maxMinesFor(width: number, height: number): number {
  return Math.max(1, width * height - 9)
}

export function minesForDensity(
  width: number,
  height: number,
  diffId: DiffId
): number {
  const cells = width * height
  const raw = Math.round(cells * DENSITY[diffId])
  return Math.min(maxMinesFor(width, height), Math.max(1, raw))
}

export function clampMines(
  mines: number,
  width: number,
  height: number
): number {
  if (Number.isNaN(mines)) return 1
  return Math.min(maxMinesFor(width, height), Math.max(1, Math.floor(mines)))
}

/** Which difficulty pill matches current mines (within 1 of density formula). */
export function matchingDiff(
  width: number,
  height: number,
  mines: number
): DiffId | null {
  for (const id of Object.keys(DENSITY) as DiffId[]) {
    if (Math.abs(minesForDensity(width, height, id) - mines) <= 0) return id
  }
  return null
}
