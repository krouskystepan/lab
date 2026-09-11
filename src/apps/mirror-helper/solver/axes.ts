import type { AxisFamily, AxisId, EnabledFamilies } from './types'
import { familyOf } from './types'

export type AxisCandidate = {
  id: AxisId
  family: AxisFamily
}

/** Reflect (r,c) across a board self-map axis. */
export function reflect(
  axis: AxisId,
  r: number,
  c: number,
  width: number,
  height: number
): { r: number; c: number } {
  switch (axis) {
    case 'v':
      return { r, c: width - 1 - c }
    case 'h':
      return { r: height - 1 - r, c }
    case 'd-main':
      return { r: c, c: r }
    case 'd-anti':
      return { r: height - 1 - c, c: width - 1 - r }
  }
}

export function indexOf(r: number, c: number, width: number): number {
  return r * width + c
}

export function rowOf(index: number, width: number): number {
  return Math.floor(index / width)
}

export function colOf(index: number, width: number): number {
  return index % width
}

/** Candidate axes for enabled families. Diagonals only when square. */
export function listAxes(
  width: number,
  height: number,
  enabled: EnabledFamilies
): AxisCandidate[] {
  const out: AxisCandidate[] = []
  if (enabled.vertical) out.push({ id: 'v', family: 'vertical' })
  if (enabled.horizontal) out.push({ id: 'h', family: 'horizontal' })
  if (enabled.diagonal && width === height) {
    out.push({ id: 'd-main', family: 'diagonal' })
    out.push({ id: 'd-anti', family: 'diagonal' })
  }
  return out
}

export function isValidFocus(
  focus: AxisId | null,
  candidates: AxisCandidate[]
): focus is AxisId {
  if (focus == null) return false
  return candidates.some((a) => a.id === focus)
}

export { familyOf }
