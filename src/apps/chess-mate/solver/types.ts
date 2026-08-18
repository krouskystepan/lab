export type Side = 'w' | 'b'
export type PieceKind = 'k' | 'q' | 'r' | 'b' | 'n' | 'p'

export type Piece = {
  kind: PieceKind
  side: Side
}

/** a1 = 0, h1 = 7, a8 = 56, h8 = 63 */
export type SquareIndex = number

export type Castling = {
  K: boolean
  Q: boolean
  k: boolean
  q: boolean
}

export type Position = {
  squares: (Piece | null)[]
  turn: Side
  castling: Castling
  ep: string | '-'
}

export type MatePly = {
  san: string
  from: string
  to: string
  promotion?: string
}

export type MateResult =
  | {
      ok: true
      mateIn: number
      line: MatePly[]
      keys: string[]
    }
  | {
      ok: false
      reason: 'invalid' | 'none' | 'timeout' | 'stalemate' | 'already_mate'
    }

export const MATE_NS = [1, 2, 3] as const
export type MateN = (typeof MATE_NS)[number]
export const DEFAULT_MATE_N: MateN = 2
export const SOLVE_MS = 8000

export function isMateN(v: unknown): v is MateN {
  return v === 1 || v === 2 || v === 3
}

export const KINDS: PieceKind[] = ['k', 'q', 'r', 'b', 'n', 'p']
export const EMPTY_CASTLING: Castling = {
  K: false,
  Q: false,
  k: false,
  q: false
}
