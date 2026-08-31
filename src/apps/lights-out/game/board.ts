import type { BoardSize } from './types'

/** Self + orthogonal neighbors (classic plus toggle). */
export function affect(size: number, index: number): number[] {
  const r = Math.floor(index / size)
  const c = index % size
  const out = [index]
  if (r > 0) out.push(index - size)
  if (r + 1 < size) out.push(index + size)
  if (c > 0) out.push(index - 1)
  if (c + 1 < size) out.push(index + 1)
  return out
}

export function toggleInPlace(lights: boolean[], size: number, index: number): void {
  for (const i of affect(size, index)) lights[i] = !lights[i]
}

export function applyPress(lights: boolean[], size: number, index: number): boolean[] {
  const next = lights.slice()
  toggleInPlace(next, size, index)
  return next
}

export function applyPresses(
  lights: boolean[],
  size: number,
  presses: boolean[]
): boolean[] {
  const next = lights.slice()
  for (let i = 0; i < presses.length; i++) {
    if (presses[i]) toggleInPlace(next, size, i)
  }
  return next
}

export function allOff(lights: boolean[]): boolean {
  return lights.every((on) => !on)
}

export function cloneLights(lights: boolean[]): boolean[] {
  return lights.slice()
}

export function encodeLights(lights: boolean[]): string {
  return lights.map((on) => (on ? '1' : '0')).join('')
}

export function parseLights(raw: string, size: BoardSize): boolean[] | null {
  if (raw.length !== size * size) return null
  const lights: boolean[] = []
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === '1') lights.push(true)
    else if (ch === '0') lights.push(false)
    else return null
  }
  return lights
}

export function emptyLights(size: BoardSize): boolean[] {
  return Array.from({ length: size * size }, () => false)
}
