import { clonePos, problemCount, type Edge, type Vec } from './geometry'
import { createBoard } from './engine'
import { generate } from './generate'
import { isDiffId, isStatus, type BoardState, type GameStatus } from './types'

const KEY = 'untangle.game.v1'

function parseVecs(raw: unknown, n: number): Vec[] | null {
  if (!Array.isArray(raw) || raw.length !== n) return null
  const out: Vec[] = []
  for (const v of raw) {
    if (!v || typeof v !== 'object') return null
    const p = v as { x?: unknown; y?: unknown }
    if (typeof p.x !== 'number' || typeof p.y !== 'number') return null
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null
    out.push({ x: p.x, y: p.y })
  }
  return out
}

function parseEdges(raw: unknown, n: number): Edge[] | null {
  if (!Array.isArray(raw)) return null
  const edges: Edge[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (!Array.isArray(item) || item.length !== 2) return null
    const a = item[0]
    const b = item[1]
    if (typeof a !== 'number' || typeof b !== 'number') return null
    if (!Number.isInteger(a) || !Number.isInteger(b)) return null
    if (a < 0 || b < 0 || a >= n || b >= n || a === b) return null
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const key = `${lo}-${hi}`
    if (seen.has(key)) return null
    seen.add(key)
    edges.push([lo, hi])
  }
  return edges
}

function parseBoard(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<BoardState>
  if (!isDiffId(o.diffId)) return null
  if (!isStatus(o.status)) return null
  if (typeof o.puzzleId !== 'string') return null
  if (typeof o.moves !== 'number' || o.moves < 0) return null
  if (typeof o.n !== 'number' || !Number.isInteger(o.n) || o.n < 4) return null
  const edges = parseEdges(o.edges, o.n)
  const start = parseVecs(o.start, o.n)
  const pos = parseVecs(o.pos, o.n)
  if (!edges || !start || !pos) return null
  let status: GameStatus = o.status
  if (problemCount(edges, pos) === 0) status = 'won'
  else if (status === 'won') status = 'playing'
  return {
    diffId: o.diffId,
    puzzleId: o.puzzleId,
    n: o.n,
    edges,
    start,
    pos,
    moves: Math.floor(o.moves),
    status
  }
}

export function loadGame(): BoardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { version?: unknown; board?: unknown }
      if (parsed.version === 1) {
        const board = parseBoard(parsed.board)
        if (board) return board
      }
    }
  } catch {
    /* ignore */
  }
  return createBoard(generate('easy'))
}

export function saveGame(board: BoardState): void {
  try {
    const payload = {
      version: 1 as const,
      board: {
        ...board,
        edges: board.edges.map(([a, b]) => [a, b] as Edge),
        start: clonePos(board.start),
        pos: clonePos(board.pos)
      }
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
