import {
  INSET,
  clampInset,
  clonePos,
  crossingPairs,
  dist,
  orient,
  problemCount,
  properCross,
  vertexOnEdge,
  type Edge,
  type Vec
} from './geometry'
import type { DiffId, Puzzle } from './types'

type Preset = {
  id: DiffId
  n: number
  minEdges: number
  maxEdges: number
  minDist: number
}

export const PRESETS: Preset[] = [
  { id: 'easy', n: 5, minEdges: 5, maxEdges: 6, minDist: 0.18 },
  { id: 'medium', n: 7, minEdges: 8, maxEdges: 10, minDist: 0.14 },
  { id: 'hard', n: 10, minEdges: 14, maxEdges: 18, minDist: 0.11 },
  { id: 'expert', n: 13, minEdges: 22, maxEdges: 28, minDist: 0.09 },
  { id: 'insane', n: 16, minEdges: 32, maxEdges: 40, minDist: 0.07 }
]

export const MIN_DOTS = 4
export const MAX_DOTS = 24

export function clampDots(n: number): number {
  if (!Number.isFinite(n)) return MIN_DOTS
  return Math.min(MAX_DOTS, Math.max(MIN_DOTS, Math.round(n)))
}

export type WitnessPuzzle = {
  puzzle: Puzzle
  /** Clean drawing. Tests only — never stored on the puzzle or read by hints. */
  witness: Vec[]
}

function presetOf(id: DiffId): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}

function generatePreset(preset: Preset, avoidId?: string): WitnessPuzzle {
  let fallback: WitnessPuzzle | null = null
  for (let attempt = 0; attempt < 48; attempt++) {
    const built = buildOnce(preset)
    if (!built) continue
    if (!fallback) fallback = built
    if (built.puzzle.id !== avoidId) return built
  }
  if (fallback) return fallback
  throw new Error(`untangle: failed to generate ${preset.n}`)
}

export function generate(diffId: DiffId, avoidId?: string): Puzzle {
  return generatePreset(presetOf(diffId), avoidId).puzzle
}

/** Nearest preset's density, on an exact vertex count from 4 to 24. */
export function generateCount(n: number, avoidId?: string): Puzzle {
  return generatePreset(presetForCount(clampDots(n)), avoidId).puzzle
}

function presetForCount(n: number): Preset {
  const exact = PRESETS.find((p) => p.n === n)
  if (exact) return exact
  const near = PRESETS.reduce((best, p) =>
    Math.abs(p.n - n) < Math.abs(best.n - n) ? p : best
  )
  const cap = Math.max(n, 3 * n - 6)
  const minEdges = Math.min(cap, Math.max(n, Math.round((near.minEdges / near.n) * n)))
  const maxEdges = Math.min(cap, Math.max(minEdges, Math.round((near.maxEdges / near.n) * n)))
  return {
    id: near.id,
    n,
    minEdges,
    maxEdges,
    minDist: Math.max(0.04, Math.min(near.minDist, 0.9 / n))
  }
}

export function generateWithWitness(diffId: DiffId, avoidId?: string): WitnessPuzzle {
  return generatePreset(presetOf(diffId), avoidId)
}

/** Convex-cycle fallback: swap 0 with 2, then 1 with 3 if that is still crossing-free. */
export function fallbackStart(witness: Vec[], edges: Edge[]): Vec[] {
  let pos = swap(witness, 0, 2)
  if (usable(edges, pos)) return pos
  pos = swap(pos, 1, 3)
  if (usable(edges, pos)) return pos
  return forceProperCross(witness, edges)
}

function buildOnce(preset: Preset): WitnessPuzzle | null {
  const span = preset.maxEdges - preset.minEdges + 1
  const target = preset.minEdges + Math.floor(Math.random() * span)
  const drawn = drawWitness(preset.n, target)
  if (!drawn) return null
  const start = fit(scramble(preset.n, preset.minDist, drawn.edges, drawn.pos))
  if (!usable(drawn.edges, start)) return null
  return {
    puzzle: {
      id: puzzleId(preset.id, preset.n, drawn.edges, start),
      diffId: preset.id,
      n: preset.n,
      edges: drawn.edges.map(([a, b]) => [a, b]),
      start: clonePos(start)
    },
    witness: clonePos(drawn.pos)
  }
}

/**
 * A convex polygon holds at most 2n−3 non-crossing straight edges.
 * Denser bands place vertices inside a triangle and keep a Hamiltonian cycle.
 */
function drawWitness(n: number, target: number): { pos: Vec[]; edges: Edge[] } | null {
  if (target <= 2 * n - 3) {
    const convex = tryConvex(n, target)
    if (convex) return convex
  }
  return tryDense(n, target)
}

function tryConvex(n: number, target: number): { pos: Vec[]; edges: Edge[] } | null {
  const pos = regularPolygon(n)
  for (let round = 0; round < 30; round++) {
    const edges = growChords(pos, target)
    if (edges.length < target) continue
    if (problemCount(edges, pos) !== 0) continue
    if (!hasCycle(n, edges)) continue
    return { pos: clonePos(pos), edges }
  }
  return null
}

function growChords(pos: Vec[], target: number): Edge[] {
  const n = pos.length
  const edges = boundary(n)
  const non: Edge[] = []
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (b === a + 1 || (a === 0 && b === n - 1)) continue
      non.push([a, b])
    }
  }
  for (const [a, b] of shuffle(non)) {
    if (edges.length >= target) break
    if (chordOk(pos, edges, a, b)) edges.push([a, b])
  }
  edges.sort(cmpEdge)
  return edges
}

function tryDense(n: number, target: number): { pos: Vec[]; edges: Edge[] } | null {
  for (let round = 0; round < 20; round++) {
    const stacked = stackTriangulation(n)
    if (!stacked) continue
    const pruned = pruneToClean(stacked.pos, stacked.edges, n)
    if (!pruned || pruned.length < target) continue
    const edges = thinTo(pruned, n, target)
    if (problemCount(edges, stacked.pos) !== 0) continue
    if (!hasCycle(n, edges)) continue
    return { pos: clonePos(stacked.pos), edges }
  }
  return null
}

function stackTriangulation(n: number): { pos: Vec[]; edges: Edge[] } | null {
  const pts = equilateral()
  const faces: [number, number, number][] = [[0, 1, 2]]
  let cycle = [0, 1, 2]
  const edgeSet = new Set(['0-1', '0-2', '1-2'])

  for (let v = 3; v < n; v++) {
    const next = insertVertex(pts, faces, cycle, edgeSet, v)
    if (!next) return null
    cycle = next
  }

  const map = new Map<number, number>()
  cycle.forEach((old, i) => map.set(old, i))
  const pos = cycle.map((old) => ({ x: pts[old].x, y: pts[old].y }))
  const edges: Edge[] = []
  for (const key of edgeSet) {
    const [a, b] = key.split('-').map(Number)
    const na = map.get(a)
    const nb = map.get(b)
    if (na == null || nb == null) return null
    edges.push(na < nb ? [na, nb] : [nb, na])
  }
  edges.sort(cmpEdge)
  return { pos, edges }
}

function insertVertex(
  pts: Vec[],
  faces: [number, number, number][],
  cycle: number[],
  edgeSet: Set<string>,
  v: number
): number[] | null {
  const ranked = faces
    .map((face, index) => ({
      face,
      index,
      area: Math.abs(orient(pts[face[0]], pts[face[1]], pts[face[2]]))
    }))
    .filter((item) => item.area > 1e-4 && cycleEdgeOf(item.face, cycle))
    .sort((a, b) => b.area - a.area)
  if (ranked.length === 0) return null
  const pool = ranked.slice(0, Math.max(1, Math.ceil(ranked.length / 3)))
  const pick = pool[Math.floor(Math.random() * pool.length)]
  const edge = cycleEdgeOf(pick.face, cycle)
  if (!edge) return null
  const [a, b] = edge
  const c = pick.face.find((id) => id !== a && id !== b)
  if (c == null) return null
  const p = randomInside(pts[a], pts[b], pts[c])
  pts.push(p)
  addKey(edgeSet, a, v)
  addKey(edgeSet, b, v)
  addKey(edgeSet, c, v)
  faces.splice(pick.index, 1)
  faces.push([a, b, v], [b, c, v], [c, a, v])
  return insertOnCycle(cycle, a, b, v)
}

function randomInside(a: Vec, b: Vec, c: Vec): Vec {
  let u = 0.2 + Math.random() * 0.45
  let v = 0.2 + Math.random() * 0.45
  if (u + v > 0.75) {
    const s = 0.75 / (u + v)
    u *= s
    v *= s
  }
  const w = 1 - u - v
  return {
    x: u * a.x + v * b.x + w * c.x,
    y: u * a.y + v * b.y + w * c.y
  }
}

function pruneToClean(pos: Vec[], edges: Edge[], n: number): Edge[] | null {
  const curr = edges.map((e) => [e[0], e[1]] as Edge)
  for (let step = 0; step < curr.length + 2; step++) {
    if (problemCount(curr, pos) === 0) {
      curr.sort(cmpEdge)
      return curr
    }
    const drop = removableProblem(pos, curr, n)
    if (drop < 0) return null
    curr.splice(drop, 1)
  }
  return null
}

function removableProblem(pos: Vec[], edges: Edge[], n: number): number {
  const cycle = new Set(boundary(n).map(edgeKey))
  for (let e = 0; e < edges.length; e++) {
    if (cycle.has(edgeKey(edges[e]))) continue
    const [a, b] = edges[e]
    for (let v = 0; v < pos.length; v++) {
      if (v !== a && v !== b && vertexOnEdge(pos[v], pos[a], pos[b])) return e
    }
    for (let j = 0; j < edges.length; j++) {
      if (j === e) continue
      const [c, d] = edges[j]
      if (properCross(pos[a], pos[b], pos[c], pos[d])) return e
    }
  }
  return -1
}

function thinTo(edges: Edge[], n: number, target: number): Edge[] {
  const cycle = new Set(boundary(n).map(edgeKey))
  const optional = edges.filter((e) => !cycle.has(edgeKey(e)))
  const keep = Math.max(0, target - n)
  const chosen = [...boundary(n), ...shuffle(optional).slice(0, keep)]
  chosen.sort(cmpEdge)
  return chosen
}

function fit(pos: Vec[]): Vec[] {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of pos) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  const w = Math.max(maxX - minX, 1e-3)
  const h = Math.max(maxY - minY, 1e-3)
  const span = 1 - 2 * INSET
  return pos.map((p) => ({
    x: INSET + ((p.x - minX) / w) * span,
    y: INSET + ((p.y - minY) / h) * span
  }))
}

function scramble(n: number, minDist: number, edges: Edge[], witness: Vec[]): Vec[] {
  for (let attempt = 0; attempt < 60; attempt++) {
    const pts = sampleSeparated(n, minDist)
    if (!pts || hasCoincident(pts)) continue
    if (problemCount(edges, pts) === 0) continue
    if (crossingPairs(edges, pts).length === 0) continue
    return pts
  }
  return fallbackStart(witness, edges)
}

function sampleSeparated(n: number, minDist: number): Vec[] | null {
  const pts: Vec[] = []
  const span = 1 - 2 * INSET
  for (let i = 0; i < n; i++) {
    let placed: Vec | null = null
    for (let t = 0; t < 80; t++) {
      const p = { x: INSET + Math.random() * span, y: INSET + Math.random() * span }
      if (pts.every((q) => dist(p, q) >= minDist)) {
        placed = p
        break
      }
    }
    if (!placed) return null
    pts.push(placed)
  }
  return pts
}

function forceProperCross(witness: Vec[], edges: Edge[]): Vec[] {
  const has01 = edges.some(([a, b]) => a === 0 && b === 1)
  const has23 = edges.some(([a, b]) => a === 2 && b === 3)
  if (has01 && has23) {
    const a = witness[2]
    const b = witness[3]
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const ox = -dy / len
    const oy = dx / len
    for (const gap of [0.06, 0.1, 0.16, 0.24]) {
      const pos = clonePos(witness)
      pos[0] = clampInset({
        x: mx + ox * gap - (dx / len) * 0.02,
        y: my + oy * gap - (dy / len) * 0.02
      })
      pos[1] = clampInset({
        x: mx - ox * gap + (dx / len) * 0.02,
        y: my - oy * gap + (dy / len) * 0.02
      })
      if (usable(edges, pos)) return pos
    }
  }
  for (let k = 1; k <= 20; k++) {
    const pos = clonePos(witness)
    const t = k / 21
    pos[0] = clampInset({ x: INSET + t * (1 - 2 * INSET), y: 0.44 })
    if (usable(edges, pos)) return pos
  }
  return swap(witness, 0, 1)
}

function usable(edges: Edge[], pos: Vec[]): boolean {
  return crossingPairs(edges, pos).length > 0 && !hasCoincident(pos)
}

function regularPolygon(n: number): Vec[] {
  const r = 0.34
  return Array.from({ length: n }, (_, i) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: 0.5 + r * Math.cos(ang), y: 0.5 + r * Math.sin(ang) }
  })
}

function equilateral(): Vec[] {
  const r = 0.32
  return [0, 1, 2].map((i) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / 3
    return { x: 0.5 + r * Math.cos(ang), y: 0.5 + r * Math.sin(ang) }
  })
}

function boundary(n: number): Edge[] {
  const edges: Edge[] = []
  for (let i = 0; i < n; i++) {
    const a = i
    const b = (i + 1) % n
    edges.push(a < b ? [a, b] : [b, a])
  }
  return edges
}

function chordOk(pos: Vec[], edges: Edge[], a: number, b: number): boolean {
  for (let v = 0; v < pos.length; v++) {
    if (v === a || v === b) continue
    if (vertexOnEdge(pos[v], pos[a], pos[b])) return false
  }
  for (const [c, d] of edges) {
    if (properCross(pos[a], pos[b], pos[c], pos[d])) return false
  }
  return true
}

function hasCycle(n: number, edges: Edge[]): boolean {
  const have = new Set(edges.map(edgeKey))
  for (let i = 0; i < n; i++) {
    const a = i
    const b = (i + 1) % n
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (!have.has(key)) return false
  }
  return true
}

function cycleEdgeOf(
  face: [number, number, number],
  cycle: number[]
): [number, number] | null {
  const [a, b, c] = face
  const pairs: [number, number][] = [
    [a, b],
    [b, c],
    [c, a]
  ]
  for (const pair of pairs) {
    if (adjacent(cycle, pair[0], pair[1])) return pair
  }
  return null
}

function adjacent(cycle: number[], a: number, b: number): boolean {
  const n = cycle.length
  for (let i = 0; i < n; i++) {
    const x = cycle[i]
    const y = cycle[(i + 1) % n]
    if ((x === a && y === b) || (x === b && y === a)) return true
  }
  return false
}

function insertOnCycle(cycle: number[], a: number, b: number, v: number): number[] | null {
  const n = cycle.length
  for (let i = 0; i < n; i++) {
    const x = cycle[i]
    const y = cycle[(i + 1) % n]
    if ((x === a && y === b) || (x === b && y === a)) {
      const next = cycle.slice()
      next.splice(i + 1, 0, v)
      return next
    }
  }
  return null
}

function addKey(set: Set<string>, a: number, b: number): void {
  set.add(a < b ? `${a}-${b}` : `${b}-${a}`)
}

function edgeKey([a, b]: Edge): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

function cmpEdge(a: Edge, b: Edge): number {
  return a[0] - b[0] || a[1] - b[1]
}

function swap(pos: Vec[], i: number, j: number): Vec[] {
  const next = clonePos(pos)
  const tmp = next[i]
  next[i] = next[j]
  next[j] = tmp
  return next
}

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

function hasCoincident(pos: Vec[]): boolean {
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      if (dist(pos[i], pos[j]) < 0.02) return true
    }
  }
  return false
}

function puzzleId(diffId: DiffId, n: number, edges: Edge[], start: Vec[]): string {
  const edgeKeyStr = edges.map(([a, b]) => `${a}-${b}`).join('.')
  const quant = start.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(';')
  return `${diffId}-${n}-${edgeKeyStr}-${quant}`
}
