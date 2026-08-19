import { parseLot } from './board'
import type { DiffId, Puzzle } from './types'

/** Easy/medium: 6×6 open lot. Hard/expert: 6×6 with walls. */
const RAW: { id: string; diffId: DiffId; minMoves: number; grid: string }[] = [
  // easy — 6×6, 3–6
  { id: 'e1', diffId: 'easy', minMoves: 3, grid: 'ooCoooooCoooAACoooBBBooooooooooooooo' },
  { id: 'e2', diffId: 'easy', minMoves: 3, grid: 'oooCoooooCooAAoCoooBBBoooooooooooooo' },
  { id: 'e3', diffId: 'easy', minMoves: 4, grid: 'oBBBCCoooooDAAoooDoooooEoooooEoooooE' },
  { id: 'e4', diffId: 'easy', minMoves: 4, grid: 'ooEoooooEBBBooEAAFoooooFoCCCDDoooooo' },
  { id: 'e5', diffId: 'easy', minMoves: 4, grid: 'ooEBBBooEooFooEAAFoCCCDDoooooooooooo' },
  { id: 'e6', diffId: 'easy', minMoves: 5, grid: 'oBBBCCooFoDDooFAAHooFooHooGEEEooGooo' },
  { id: 'e7', diffId: 'easy', minMoves: 5, grid: 'EoooooEBBBCCooFAAHooFooHooGDDDooGooo' },
  { id: 'e8', diffId: 'easy', minMoves: 6, grid: 'oBBBCCoDDDEEooGAAIooGooIooHFFFooHooo' },

  // medium — 6×6, 10–15
  { id: 'm1', diffId: 'medium', minMoves: 10, grid: 'HBBBCCHDDooMHoJAAMIoJLEEIoKLooFFKGGG' },
  { id: 'm2', diffId: 'medium', minMoves: 10, grid: 'HBBCCCHoJDDDHoJAALIoKooLIoKEEEFFFGGo' },
  { id: 'm3', diffId: 'medium', minMoves: 10, grid: 'ooIBBBEGIooLEGJAALEGJCCCFHJoKoFHDDKo' },
  { id: 'm4', diffId: 'medium', minMoves: 10, grid: 'GoIBBBGoIoCCGoIAALHDDKoLHoJKoMEEJFFM' },
  { id: 'm5', diffId: 'medium', minMoves: 15, grid: 'GoJBBBGIJoKLGIAAKLHICCDDHooooMEEEFFM' },
  { id: 'm6', diffId: 'medium', minMoves: 15, grid: 'ooHooKFoHBBKFoIAAKFoIJooGoIJCCGDDEEE' },
  { id: 'm7', diffId: 'medium', minMoves: 15, grid: 'FBBCCKFoHooKFoHAAKGoIJDDGoIJooooIEEE' },
  { id: 'm8', diffId: 'medium', minMoves: 15, grid: 'BBBCCLGoIooLGoIAALGoJKDDHoJKooHEEFFo' },

  // hard — 6×6, walls, 20–25
  { id: 'h1', diffId: 'hard', minMoves: 20, grid: 'oJBBBxoJDDooAAoKoooooKEEooxGGLHHHIIL' },
  { id: 'h2', diffId: 'hard', minMoves: 20, grid: 'xCCHJKooGHJKAAGIoLDDoIoLFEEIooFooooo' },
  { id: 'h3', diffId: 'hard', minMoves: 25, grid: 'JBBBCCJooLDDJAALoMEEKooMooKFFMGGxIIo' },
  { id: 'h4', diffId: 'hard', minMoves: 25, grid: 'BBBCCLooIxoLAAIoKoHEEEKoHFFJoooooJxo' },
  { id: 'h5', diffId: 'hard', minMoves: 30, grid: 'HBBCCCHoDDKLAAIoKLooIEELoFFJooooxJoo' },
  { id: 'h6', diffId: 'hard', minMoves: 35, grid: 'xoMCCxLoMNEELAANoOFFGGoOHHIIooJJKKoo' },
  { id: 'h7', diffId: 'hard', minMoves: 36, grid: 'oBBJooooHJoKAAHJoKGoICCCGoIDDLxFFooL' },
  { id: 'h8', diffId: 'hard', minMoves: 36, grid: 'IBBCCCIoJooMAAJoLMoxEELMoFFKooGGGKxo' },

  // expert — 6×6, walls, 30–36
  { id: 'x1', diffId: 'expert', minMoves: 30, grid: 'HBBCCCHoDDKLAAIoKLooIEELoFFJooooxJoo' },
  { id: 'x2', diffId: 'expert', minMoves: 35, grid: 'xoMCCxLoMNEELAANoOFFGGoOHHIIooJJKKoo' },
  { id: 'x3', diffId: 'expert', minMoves: 36, grid: 'oBBJooooHJoKAAHJoKGoICCCGoIDDLxFFooL' },
  { id: 'x4', diffId: 'expert', minMoves: 36, grid: 'IBBCCCIoJooMAAJoLMoxEELMoFFKooGGGKxo' }
]

export const PRESETS: { id: DiffId }[] = [
  { id: 'easy' },
  { id: 'medium' },
  { id: 'hard' },
  { id: 'expert' }
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
