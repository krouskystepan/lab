import {
  INSET,
  clonePos,
  crossingPairs,
  dist,
  problemCount,
  vertexOnEdge,
  type Edge,
  type Vec
} from './geometry'

export type HintKind = 'nudge' | 'jump' | 'escape'

export type Hint = {
  kind: HintKind
  index: number
  target: Vec
  radius: number
  /** Problem-count drop. Negative when the landing is worse. */
  delta: number
  /** Up to two edge pairs this landing would stop crossing. Empty for escape. */
  cleared: [number, number][]
  clearedCount: number
}

const NUDGE_DIST = [0.06, 0.12]
const CENTER_STEP = 0.12
const COMPASS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
]

type Sample = {
  index: number
  target: Vec
  after: number
  dist: number
  cleared: [number, number][]
}

function unit(dx: number, dy: number): [number, number] | null {
  const len = Math.hypot(dx, dy)
  if (len < 1e-8) return null
  return [dx / len, dy / len]
}

function clamp(p: Vec): Vec {
  return {
    x: Math.min(1 - INSET, Math.max(INSET, p.x)),
    y: Math.min(1 - INSET, Math.max(INSET, p.y))
  }
}

function coincident(pos: Vec[], index: number, p: Vec): boolean {
  for (let i = 0; i < pos.length; i++) {
    if (i !== index && dist(pos[i], p) < 0.02) return true
  }
  return false
}

function candidates(edges: readonly Edge[], pos: Vec[]): number[] {
  const set = new Set<number>()
  for (const [i, j] of crossingPairs(edges, pos)) {
    const ea = edges[i]
    const eb = edges[j]
    set.add(ea[0])
    set.add(ea[1])
    set.add(eb[0])
    set.add(eb[1])
  }
  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e]
    for (let v = 0; v < pos.length; v++) {
      if (v === a || v === b) continue
      if (vertexOnEdge(pos[v], pos[a], pos[b])) {
        set.add(v)
        set.add(a)
        set.add(b)
      }
    }
  }
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      if (dist(pos[i], pos[j]) < 0.02) {
        set.add(i)
        set.add(j)
      }
    }
  }
  return [...set].sort((a, b) => a - b)
}

function clearedPairs(edges: readonly Edge[], before: Vec[], after: Vec[]): [number, number][] {
  const now = new Set(crossingPairs(edges, after).map(([i, j]) => `${i}:${j}`))
  const out: [number, number][] = []
  for (const [i, j] of crossingPairs(edges, before)) {
    if (!now.has(`${i}:${j}`)) out.push([i, j])
  }
  out.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return out
}

function place(pos: Vec[], index: number, target: Vec): Vec[] {
  const next = clonePos(pos)
  next[index] = target
  return next
}

function consider(
  best: Sample | null,
  sample: Sample
): Sample {
  if (!best) return sample
  if (sample.after !== best.after) return sample.after < best.after ? sample : best
  if (Math.abs(sample.dist - best.dist) > 1e-9) return sample.dist < best.dist ? sample : best
  return sample.index < best.index ? sample : best
}

function nudgeTargets(pos: Vec[], index: number): Vec[] {
  const origin = pos[index]
  const out: Vec[] = []
  for (const [dx, dy] of COMPASS) {
    const u = unit(dx, dy)
    if (!u) continue
    for (const step of NUDGE_DIST) {
      out.push(clamp({ x: origin.x + u[0] * step, y: origin.y + u[1] * step }))
    }
  }
  const toCenter = unit(0.5 - origin.x, 0.5 - origin.y)
  if (toCenter) {
    out.push(
      clamp({
        x: origin.x + toCenter[0] * CENTER_STEP,
        y: origin.y + toCenter[1] * CENTER_STEP
      })
    )
    out.push(
      clamp({
        x: origin.x - toCenter[0] * CENTER_STEP,
        y: origin.y - toCenter[1] * CENTER_STEP
      })
    )
  }
  return out
}

function gridTargets(): Vec[] {
  const out: Vec[] = []
  const steps = 5
  for (let gy = 0; gy < steps; gy++) {
    for (let gx = 0; gx < steps; gx++) {
      out.push({
        x: INSET + ((1 - 2 * INSET) * gx) / (steps - 1),
        y: INSET + ((1 - 2 * INSET) * gy) / (steps - 1)
      })
    }
  }
  return out
}

const GRID = gridTargets()

function signature(edges: readonly Edge[], pos: Vec[]): string {
  const parts: string[] = []
  for (const [i, j] of crossingPairs(edges, pos)) parts.push(`x${i}-${j}`)
  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e]
    for (let v = 0; v < pos.length; v++) {
      if (v === a || v === b) continue
      if (vertexOnEdge(pos[v], pos[a], pos[b])) parts.push(`v${v}-${e}`)
    }
  }
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      if (dist(pos[i], pos[j]) < 0.02) parts.push(`c${i}-${j}`)
    }
  }
  return parts.join('|')
}

function sampleAt(
  edges: readonly Edge[],
  pos: Vec[],
  index: number,
  target: Vec
): Sample | null {
  if (dist(pos[index], target) <= 0.01) return null
  const next = place(pos, index, target)
  return {
    index,
    target,
    after: problemCount(edges, next),
    dist: dist(pos[index], target),
    cleared: clearedPairs(edges, pos, next)
  }
}

function toHint(kind: HintKind, sample: Sample, before: number, showCleared: boolean): Hint {
  const cleared = showCleared ? sample.cleared.slice(0, 2) : []
  return {
    kind,
    index: sample.index,
    target: sample.target,
    radius: kind === 'nudge' ? 0.035 : kind === 'jump' ? 0.06 : 0.08,
    delta: before - sample.after,
    cleared,
    clearedCount: showCleared ? sample.cleared.length : 0
  }
}

/** Deterministic hint. Does not move a vertex and does not read a witness layout. */
export function findHint(edges: readonly Edge[], pos: Vec[]): Hint | null {
  const before = problemCount(edges, pos)
  if (before === 0) return null
  const ids = candidates(edges, pos)
  if (ids.length === 0) return null
  const startSig = signature(edges, pos)

  let nudge: Sample | null = null
  for (const index of ids) {
    for (const target of nudgeTargets(pos, index)) {
      if (coincident(pos, index, target)) continue
      const sample = sampleAt(edges, pos, index, target)
      if (!sample || sample.after >= before) continue
      nudge = consider(nudge, sample)
    }
  }
  if (nudge) return toHint('nudge', nudge, before, true)

  let jump: Sample | null = null
  for (const index of ids) {
    for (const target of GRID) {
      if (coincident(pos, index, target)) continue
      const sample = sampleAt(edges, pos, index, target)
      if (!sample || sample.after >= before) continue
      jump = consider(jump, sample)
    }
  }
  if (jump) return toHint('jump', jump, before, true)

  let escape: Sample | null = null
  for (const index of ids) {
    for (const target of GRID) {
      if (coincident(pos, index, target)) continue
      const sample = sampleAt(edges, pos, index, target)
      if (!sample) continue
      const next = place(pos, index, target)
      if (signature(edges, next) === startSig) continue
      escape = consider(escape, sample)
    }
  }
  if (!escape || escape.after <= before) return null
  return toHint('escape', escape, before, false)
}
