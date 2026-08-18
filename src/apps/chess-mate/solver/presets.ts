import type { MateN } from './types'

export type MatePreset = {
  id: 'backRank' | 'queenMate' | 'rookRoll' | 'smothered'
  mateIn: MateN
  fen: string
}

/** Small public-domain setups so Solve does something on a fresh board. */
export const PRESETS: MatePreset[] = [
  {
    id: 'backRank',
    mateIn: 1,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1'
  },
  {
    id: 'queenMate',
    mateIn: 1,
    fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1'
  },
  {
    id: 'rookRoll',
    mateIn: 2,
    fen: '4k3/8/3K4/8/8/8/8/R7 w - - 0 1'
  },
  {
    id: 'smothered',
    mateIn: 2,
    fen: '5r1k/6pp/7N/8/8/8/Q7/4K3 w - - 0 1'
  }
]

export const DEFAULT_PRESET = PRESETS[3]
