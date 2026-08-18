import {
  EMPTY_CASTLING,
  type Castling,
  type Piece,
  type PieceKind,
  type Position,
  type Side
} from './types'

const FILES = 'abcdefgh'

export function fileOf(i: number): number {
  return i & 7
}

export function rankOf(i: number): number {
  return i >> 3
}

export function squareName(i: number): string {
  return FILES[fileOf(i)] + String(rankOf(i) + 1)
}

export function parseSquare(name: string): number | null {
  if (!/^[a-h][1-8]$/.test(name)) return null
  return name.charCodeAt(0) - 97 + (Number(name[1]) - 1) * 8
}

export function visualIndex(
  i: number,
  flipped: boolean
): { row: number; col: number } {
  const file = fileOf(i)
  const rank = rankOf(i)
  if (!flipped) return { row: 7 - rank, col: file }
  return { row: rank, col: 7 - file }
}

export function indexFromVisual(
  row: number,
  col: number,
  flipped: boolean
): number {
  if (!flipped) return (7 - row) * 8 + col
  return row * 8 + (7 - col)
}

function pieceChar(p: Piece): string {
  const c = p.kind
  return p.side === 'w' ? c.toUpperCase() : c
}

function parsePiece(ch: string): Piece | null {
  const kind = ch.toLowerCase() as PieceKind
  if (!'kqrnbp'.includes(kind)) return null
  return { kind, side: ch === kind ? 'b' : 'w' }
}

export function emptyPosition(): Position {
  return {
    squares: Array.from({ length: 64 }, () => null),
    turn: 'w',
    castling: { ...EMPTY_CASTLING },
    ep: '-'
  }
}

export function toFen(pos: Position): string {
  const ranks: string[] = []
  for (let rank = 7; rank >= 0; rank--) {
    let row = ''
    let empty = 0
    for (let file = 0; file < 8; file++) {
      const p = pos.squares[rank * 8 + file]
      if (!p) {
        empty++
        continue
      }
      if (empty) {
        row += String(empty)
        empty = 0
      }
      row += pieceChar(p)
    }
    if (empty) row += String(empty)
    ranks.push(row)
  }
  const castle =
    (pos.castling.K ? 'K' : '') +
    (pos.castling.Q ? 'Q' : '') +
    (pos.castling.k ? 'k' : '') +
    (pos.castling.q ? 'q' : '')
  return `${ranks.join('/')} ${pos.turn} ${castle || '-'} ${pos.ep} 0 1`
}

export function fromFen(fen: string): Position | null {
  const parts = fen.trim().split(/\s+/)
  if (parts.length < 1) return null
  const rows = parts[0].split('/')
  if (rows.length !== 8) return null
  const squares: (Piece | null)[] = Array.from({ length: 64 }, () => null)
  for (let r = 0; r < 8; r++) {
    const rank = 7 - r
    let file = 0
    for (const ch of rows[r]) {
      if (file > 8) return null
      if (ch >= '1' && ch <= '8') {
        file += Number(ch)
        continue
      }
      const piece = parsePiece(ch)
      if (!piece || file >= 8) return null
      squares[rank * 8 + file] = piece
      file++
    }
    if (file !== 8) return null
  }
  const turn: Side = parts[1] === 'b' ? 'b' : 'w'
  const castleStr = parts[2] ?? '-'
  const castling: Castling = {
    K: castleStr.includes('K'),
    Q: castleStr.includes('Q'),
    k: castleStr.includes('k'),
    q: castleStr.includes('q')
  }
  const ep = parts[3] && /^[a-h][36]$/.test(parts[3]) ? parts[3] : '-'
  return sanitizeCastling({ squares, turn, castling, ep })
}

export function clonePosition(pos: Position): Position {
  return {
    squares: pos.squares.slice(),
    turn: pos.turn,
    castling: { ...pos.castling },
    ep: pos.ep
  }
}

/** Drop rights if the king/rook is not on the starting square. */
export function sanitizeCastling(pos: Position): Position {
  const at = (i: number, kind: PieceKind, side: Side) => {
    const p = pos.squares[i]
    return p?.kind === kind && p.side === side
  }
  const next = { ...pos.castling }
  if (!at(4, 'k', 'w')) {
    next.K = false
    next.Q = false
  }
  if (!at(7, 'r', 'w')) next.K = false
  if (!at(0, 'r', 'w')) next.Q = false
  if (!at(60, 'k', 'b')) {
    next.k = false
    next.q = false
  }
  if (!at(63, 'r', 'b')) next.k = false
  if (!at(56, 'r', 'b')) next.q = false
  return { ...pos, castling: next }
}

export function setSquare(
  pos: Position,
  index: number,
  piece: Piece | null
): Position {
  const squares = pos.squares.slice()
  squares[index] = piece
  return sanitizeCastling({ ...pos, squares, ep: '-' })
}

export function kingCount(pos: Position, side: Side): number {
  return pos.squares.filter((p) => p?.kind === 'k' && p.side === side).length
}

export function pieceCount(pos: Position): number {
  return pos.squares.filter(Boolean).length
}

export function formatLine(
  line: { san: string }[],
  start: Side
): string {
  const bits: string[] = []
  let n = 1
  let side = start
  for (const ply of line) {
    if (side === 'w') {
      bits.push(`${n}. ${ply.san}`)
    } else if (bits.length === 0) {
      bits.push(`${n}... ${ply.san}`)
      n++
    } else {
      bits[bits.length - 1] += ` ${ply.san}`
      n++
    }
    side = side === 'w' ? 'b' : 'w'
  }
  return bits.join(' ')
}
