import { parseLot } from './board'
import type { DiffId, Puzzle } from './types'

function g(...rows: string[]): string {
  const w = rows[0]?.length ?? 0
  if (w === 0 || rows.some((r) => r.length !== w)) throw new Error('ragged_grid')
  return rows.join('')
}

/** Easy sparse 6×6. Medium packed 10–20. Hard 7×7 / blocks 20–28. Expert jam 28–35. Insane 35+. */
const RAW: { id: string; diffId: DiffId; minMoves: number; grid: string }[] = [
  // easy — 6×6, few cars, 3–6 slides
  { id: 'e1', diffId: 'easy', minMoves: 3, grid: 'ooCoooooCoooAACoooBBBooooooooooooooo' },
  { id: 'e2', diffId: 'easy', minMoves: 3, grid: 'oooCoooooCooAAoCoooBBBoooooooooooooo' },
  { id: 'e3', diffId: 'easy', minMoves: 4, grid: 'oBBBCCoooooDAAoooDoooooEoooooEoooooE' },
  { id: 'e4', diffId: 'easy', minMoves: 4, grid: 'ooEoooooEBBBooEAAFoooooFoCCCDDoooooo' },
  { id: 'e5', diffId: 'easy', minMoves: 4, grid: 'ooEBBBooEooFooEAAFoCCCDDoooooooooooo' },
  { id: 'e6', diffId: 'easy', minMoves: 5, grid: 'oBBBCCooFoDDooFAAHooFooHooGEEEooGooo' },
  { id: 'e7', diffId: 'easy', minMoves: 5, grid: 'EoooooEBBBCCooFAAHooFooHooGDDDooGooo' },
  { id: 'e8', diffId: 'easy', minMoves: 6, grid: 'oBBBCCoDDDEEooGAAIooGooIooHFFFooHooo' },

  // medium — 6×6 packed + lighter 7×7, 10–20 slides
  { id: 'm1', diffId: 'medium', minMoves: 10, grid: 'HBBBCCHDDooMHoJAAMIoJLEEIoKLooFFKGGG' },
  { id: 'm2', diffId: 'medium', minMoves: 10, grid: 'HBBCCCHoJDDDHoJAALIoKooLIoKEEEFFFGGo' },
  { id: 'm3', diffId: 'medium', minMoves: 10, grid: 'ooIBBBEGIooLEGJAALEGJCCCFHJoKoFHDDKo' },
  { id: 'm4', diffId: 'medium', minMoves: 10, grid: 'GoIBBBGoIoCCGoIAALHDDKoLHoJKoMEEJFFM' },
  { id: 'm5', diffId: 'medium', minMoves: 15, grid: 'GoJBBBGIJoKLGIAAKLHICCDDHooooMEEEFFM' },
  { id: 'm6', diffId: 'medium', minMoves: 15, grid: 'ooHooKFoHBBKFoIAAKFoIJooGoIJCCGDDEEE' },
  { id: 'm7', diffId: 'medium', minMoves: 15, grid: 'FBBCCKFoHooKFoHAAKGoIJDDGoIJooooIEEE' },
  { id: 'm8', diffId: 'medium', minMoves: 15, grid: 'BBBCCLGoIooLGoIAALGoJKDDHoJKooHEEFFo' },
  {
    id: 'm9',
    diffId: 'medium',
    minMoves: 12,
    grid: g('oNNNoEo', 'oHHHDEo', 'KKBCDEG', 'AABCDIG', 'oFBCoIL', 'oFJJoIL', 'ooooMMM')
  },
  {
    id: 'm10',
    diffId: 'medium',
    minMoves: 14,
    grid: g('ooooKFF', 'NNJJKHo', 'ooGGCHx', 'ooAACHE', 'ooBoCoE', 'IMBDDoE', 'IMBoLLL')
  },
  {
    id: 'm11',
    diffId: 'medium',
    minMoves: 17,
    grid: g('ooELLoo', 'HHECoFo', 'ooBCDFG', 'AABCDFG', 'ooBoDoo', 'KKIINNM', 'ooooJJM')
  },
  {
    id: 'm12',
    diffId: 'medium',
    minMoves: 18,
    grid: g('oJJJoHM', 'ooBCDHM', 'ooBCDoM', 'AABCDoo', 'oIKoGGG', 'oIKoooE', 'oILLFFE')
  },

  // hard — 7×7 or blocked 6×6, 20–28 slides
  {
    id: 'h1',
    diffId: 'hard',
    minMoves: 22,
    grid: g('ooBoFFo', 'ooBoDDo', 'oKBoCJo', 'oKAACJo', 'oKooCoo', 'EEIIGHo', 'ooooGHo')
  },
  { id: 'h2', diffId: 'hard', minMoves: 20, grid: 'oJBBBxoJDDooAAoKoooooKEEooxGGLHHHIIL' },
  { id: 'h3', diffId: 'hard', minMoves: 20, grid: 'xCCHJKooGHJKAAGIoLDDoIoLFEEIooFooooo' },
  { id: 'h4', diffId: 'hard', minMoves: 25, grid: 'BBBCCLooIxoLAAIoKoHEEEKoHFFJoooooJxo' },
  { id: 'h5', diffId: 'hard', minMoves: 23, grid: 'BBCCCoHDDoKLHAAoKLooIEELFFIJooooxJoo' },
  { id: 'h6', diffId: 'hard', minMoves: 24, grid: 'GHIBBMGHIoLMGoAALNooJCCNooJKDDEEoKox' },
  { id: 'h7', diffId: 'hard', minMoves: 26, grid: 'GHIKBBGHIKLMGAAoLMCCCooMooJoDDEEJoFF' },
  { id: 'h8', diffId: 'hard', minMoves: 28, grid: 'BBBCCKoooJoKAAoJoLDDIJoLHoIEEoHoxGGo' },

  // expert — max-density 6×6 jams, 28–35 slides
  { id: 'x1', diffId: 'expert', minMoves: 28, grid: 'GHIBBoGHIoLMGAAoLMCCCooMooJKDDEEJKFF' },
  { id: 'x2', diffId: 'expert', minMoves: 30, grid: 'GHIBBMGHIoLMGAAoLMoooCCCooJKDDEEJKFF' },
  { id: 'x3', diffId: 'expert', minMoves: 32, grid: 'GHIBBMGHIoLMGoAALMooJCCCooJKDDEEoKFF' },
  { id: 'x4', diffId: 'expert', minMoves: 33, grid: 'GoIBBMGoIoLMGoAALMoHJCCCoHJKDDEEoKFF' },
  { id: 'x5', diffId: 'expert', minMoves: 34, grid: 'GoIBBMGoIoLMGoAALMoHJCCCoHJKDDoEEKFF' },
  { id: 'x6', diffId: 'expert', minMoves: 35, grid: 'xoMCCxLoMNEELAANoOFFGGoOHHIIooJJKKoo' },
  { id: 'x7', diffId: 'expert', minMoves: 35, grid: 'ooIBBMooIoLMooAALMGHJCCCGHJKDDGEEKFF' },
  { id: 'x8', diffId: 'expert', minMoves: 35, grid: 'oBBoLMooIoLMooIAANGHJCCNGHJKDDGEEKox' },

  // insane — longest traffic, 35–60 slides (6×6; 8×8 when found)
  { id: 'n1', diffId: 'insane', minMoves: 36, grid: 'oBBJooooHJoKAAHJoKGoICCCGoIDDLxFFooL' },
  { id: 'n2', diffId: 'insane', minMoves: 40, grid: 'BBIoLMooIoLMAAoooMGHJCCCGHJKDDGEEKFF' },
  { id: 'n3', diffId: 'insane', minMoves: 45, grid: 'GBBoLMGoIoLMGoIAAMoHJCCCoHJKDDEEoKFF' },
  { id: 'n4', diffId: 'insane', minMoves: 47, grid: 'GBBoLMGHIoLMGHIAAMoooCCCooJKDDEEJKFF' },
  { id: 'n5', diffId: 'insane', minMoves: 51, grid: 'GBBoLoGHIoLMGHIAAMCCCKoMooJKDDEEJFFo' },
  { id: 'n6', diffId: 'insane', minMoves: 53, grid: 'BBBCCNDDoxMNJAAoMOJoKFFOGGKLooxIILoo' },
  { id: 'n7', diffId: 'insane', minMoves: 58, grid: 'BBoKMxDDDKMoIAALooIoJLEEooJFFNoGGoxN' },
  { id: 'n8', diffId: 'insane', minMoves: 60, grid: 'IBBxooIooLDDJAALooJoKEEMFFKooMGGHHHM' }
]

export const PRESETS: { id: DiffId }[] = [
  { id: 'easy' },
  { id: 'medium' },
  { id: 'hard' },
  { id: 'expert' },
  { id: 'insane' }
]

export const PUZZLES: Puzzle[] = RAW.map((p) => {
  parseLot(p.grid)
  return p
})

export function puzzlesFor(diffId: DiffId): Puzzle[] {
  return PUZZLES.filter((p) => p.diffId === diffId)
}

export function puzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id)
}

export function pickPuzzle(diffId: DiffId, except?: string): Puzzle {
  const pool = puzzlesFor(diffId)
  const choices = except ? pool.filter((p) => p.id !== except) : pool
  const list = choices.length > 0 ? choices : pool
  return list[Math.floor(Math.random() * list.length)] ?? pool[0]
}
