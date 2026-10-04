import { problemCount, type Edge, type Vec } from '../../apps/untangle/game/geometry'
import { isDiffId, isStatus, type BoardState, type GameStatus } from '../../apps/untangle/game/types'
import { BOARD_FORMAT, BOARD_VERSION, type UntangleBoardFile } from './types'

export function exportUntangleGame(board: BoardState): UntangleBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'untangle',
    n: board.n,
    edges: board.edges.map(([a, b]) => [a, b]),
    start: board.start.map((p) => ({ x: p.x, y: p.y })),
    pos: board.pos.map((p) => ({ x: p.x, y: p.y })),
    game: {
      puzzleId: board.puzzleId,
      diffId: board.diffId,
      moves: board.moves,
      status: board.status
    }
  }
}

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
  if (!Array.isArray(raw) || raw.length === 0) return null
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

export function importUntangleToGame(file: UntangleBoardFile): BoardState {
  if (!Number.isInteger(file.n) || file.n < 4) throw new Error('invalid')
  const edges = parseEdges(file.edges, file.n)
  const start = parseVecs(file.start, file.n)
  const pos = parseVecs(file.pos, file.n)
  if (!edges || !start || !pos) throw new Error('invalid')
  const diffId = isDiffId(file.game?.diffId) ? file.game.diffId : 'easy'
  const moves =
    typeof file.game?.moves === 'number' && file.game.moves >= 0
      ? Math.floor(file.game.moves)
      : 0
  let status: GameStatus
  if (problemCount(edges, pos) === 0) status = 'won'
  else if (isStatus(file.game?.status) && file.game.status !== 'won') status = file.game.status
  else status = moves === 0 ? 'ready' : 'playing'
  return {
    diffId,
    puzzleId: file.game?.puzzleId ?? `${diffId}-import`,
    n: file.n,
    edges,
    start,
    pos,
    moves,
    status
  }
}
