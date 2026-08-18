import { DEFAULT_PRESET } from '../solver/presets'
import { fromFen, toFen } from '../solver/fen'
import { isMateN, type MateN, type Piece, type Position } from '../solver/types'

const KEY = 'chess-mate.board.v1'

export type Brush = Piece | null

export type SavedBoard = {
  version: 1
  fen: string
  mateN: MateN
  flipped: boolean
  brush: Brush
}

function defaultSaved(): SavedBoard {
  return {
    version: 1,
    fen: DEFAULT_PRESET.fen,
    mateN: DEFAULT_PRESET.mateIn,
    flipped: false,
    brush: { kind: 'q', side: 'w' }
  }
}

function isPiece(v: unknown): v is Piece {
  if (!v || typeof v !== 'object') return false
  const o = v as { kind?: unknown; side?: unknown }
  return (
    (o.kind === 'k' ||
      o.kind === 'q' ||
      o.kind === 'r' ||
      o.kind === 'b' ||
      o.kind === 'n' ||
      o.kind === 'p') &&
    (o.side === 'w' || o.side === 'b')
  )
}

function isBrush(v: unknown): v is Brush {
  return v === null || isPiece(v)
}

export function loadBoard(): { pos: Position; prefs: SavedBoard } {
  const fallback = defaultSaved()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return { pos: fromFen(fallback.fen)!, prefs: fallback }
    }
    const parsed = JSON.parse(raw) as Partial<SavedBoard>
    const fen = typeof parsed.fen === 'string' ? parsed.fen : fallback.fen
    const pos = fromFen(fen)
    if (!pos) {
      return { pos: fromFen(fallback.fen)!, prefs: fallback }
    }
    return {
      pos,
      prefs: {
        version: 1,
        fen: toFen(pos),
        mateN: isMateN(parsed.mateN) ? parsed.mateN : fallback.mateN,
        flipped: parsed.flipped === true,
        brush: isBrush(parsed.brush) ? parsed.brush : fallback.brush
      }
    }
  } catch {
    return { pos: fromFen(fallback.fen)!, prefs: fallback }
  }
}

export function saveBoard(pos: Position, prefs: Omit<SavedBoard, 'version' | 'fen'>): void {
  try {
    const payload: SavedBoard = {
      version: 1,
      fen: toFen(pos),
      mateN: prefs.mateN,
      flipped: prefs.flipped,
      brush: prefs.brush
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
