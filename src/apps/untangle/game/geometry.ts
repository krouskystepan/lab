export const EPS = 1e-9
export const COINCIDENT = 0.02
export const VERTEX_ON_EDGE = 0.015
export const INSET = 0.08

export type Vec = { x: number; y: number }
export type Edge = [number, number]

export function clonePos(pos: Vec[]): Vec[] {
  return pos.map((p) => ({ x: p.x, y: p.y }))
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function clampInset(p: Vec): Vec {
  return {
    x: Math.min(1 - INSET, Math.max(INSET, p.x)),
    y: Math.min(1 - INSET, Math.max(INSET, p.y))
  }
}

export function orient(a: Vec, b: Vec, c: Vec): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

function nearPoint(a: Vec, b: Vec): boolean {
  return Math.abs(a.x - b.x) <= EPS && Math.abs(a.y - b.y) <= EPS
}

function sharesEndpoint(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
  return nearPoint(a, c) || nearPoint(a, d) || nearPoint(b, c) || nearPoint(b, d)
}

/** Proper crossing of open segments. A shared endpoint is not a crossing. */
export function properCross(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
  if (nearPoint(a, b) || nearPoint(c, d)) return false
  if (sharesEndpoint(a, b, c, d)) return false

  const o1 = orient(a, b, c)
  const o2 = orient(a, b, d)
  const o3 = orient(c, d, a)
  const o4 = orient(c, d, b)
  const z = (v: number) => Math.abs(v) <= EPS

  if (!z(o1) && !z(o2) && !z(o3) && !z(o4)) {
    return o1 > 0 !== o2 > 0 && o3 > 0 !== o4 > 0
  }

  if (z(o1) && z(o2) && z(o3) && z(o4)) return collinearInteriorsOverlap(a, b, c, d)
  return false
}

function collinearInteriorsOverlap(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
  const useX = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)
  const a1 = useX ? a.x : a.y
  const a2 = useX ? b.x : b.y
  const b1 = useX ? c.x : c.y
  const b2 = useX ? d.x : d.y
  const lo = Math.max(Math.min(a1, a2), Math.min(b1, b2))
  const hi = Math.min(Math.max(a1, a2), Math.max(b1, b2))
  return hi - lo > EPS
}

/** Vertex in the interior of a segment, not at an endpoint. */
export function vertexOnEdge(p: Vec, a: Vec, b: Vec): boolean {
  if (dist(p, a) < COINCIDENT || dist(p, b) < COINCIDENT) return false
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 <= EPS) return false
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  if (t <= 0 || t >= 1) return false
  const proj = { x: a.x + t * dx, y: a.y + t * dy }
  return dist(p, proj) < VERTEX_ON_EDGE
}

export function crossingPairs(edges: readonly Edge[], pos: Vec[]): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i]
    for (let j = i + 1; j < edges.length; j++) {
      const [c, d] = edges[j]
      if (properCross(pos[a], pos[b], pos[c], pos[d])) out.push([i, j])
    }
  }
  return out
}

export function problemCount(edges: readonly Edge[], pos: Vec[]): number {
  let n = crossingPairs(edges, pos).length
  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e]
    for (let v = 0; v < pos.length; v++) {
      if (v === a || v === b) continue
      if (vertexOnEdge(pos[v], pos[a], pos[b])) n++
    }
  }
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      if (dist(pos[i], pos[j]) < COINCIDENT) n++
    }
  }
  return n
}

/** Edges that should paint red: crossings, a vertex sitting on them, or a coincident endpoint. */
export function problemEdges(edges: readonly Edge[], pos: Vec[]): boolean[] {
  const bad = edges.map(() => false)
  for (const [i, j] of crossingPairs(edges, pos)) {
    bad[i] = true
    bad[j] = true
  }
  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e]
    if (dist(pos[a], pos[b]) < COINCIDENT) bad[e] = true
    for (let v = 0; v < pos.length; v++) {
      if (v !== a && v !== b && vertexOnEdge(pos[v], pos[a], pos[b])) bad[e] = true
    }
  }
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      if (dist(pos[i], pos[j]) >= COINCIDENT) continue
      for (let e = 0; e < edges.length; e++) {
        const [a, b] = edges[e]
        if (a === i || b === i || a === j || b === j) bad[e] = true
      }
    }
  }
  return bad
}
