import { cloneVehicles, isEscaped, stateKey } from './board'
import { allSlides, applySlide } from './engine'
import type { Lot, Slide, Vehicle } from './types'

const MAX_STATES = 400_000

/** First slide of a shortest path that frees the red car. */
export function shortestSlide(vehicles: Vehicle[], lot: Lot): Slide | null {
  if (isEscaped(vehicles, lot.size)) return null
  const startKey = stateKey(vehicles)
  const seen = new Set<string>([startKey])
  const queue: { vehicles: Vehicle[]; first: Slide | null }[] = [
    { vehicles, first: null }
  ]

  for (let q = 0; q < queue.length && q < MAX_STATES; q++) {
    const node = queue[q]
    for (const slide of allSlides(node.vehicles, lot)) {
      const next = applySlide(node.vehicles, slide, lot)
      if (!next) continue
      const key = stateKey(next)
      if (seen.has(key)) continue
      seen.add(key)
      const first = node.first ?? slide
      if (isEscaped(next, lot.size)) return first
      queue.push({ vehicles: cloneVehicles(next), first })
    }
  }
  return null
}

export function minMovesToEscape(vehicles: Vehicle[], lot: Lot): number | null {
  if (isEscaped(vehicles, lot.size)) return 0
  const startKey = stateKey(vehicles)
  const seen = new Set<string>([startKey])
  const queue: { vehicles: Vehicle[]; depth: number }[] = [
    { vehicles, depth: 0 }
  ]

  for (let q = 0; q < queue.length && q < MAX_STATES; q++) {
    const node = queue[q]
    for (const slide of allSlides(node.vehicles, lot)) {
      const next = applySlide(node.vehicles, slide, lot)
      if (!next) continue
      const key = stateKey(next)
      if (seen.has(key)) continue
      seen.add(key)
      const depth = node.depth + 1
      if (isEscaped(next, lot.size)) return depth
      queue.push({ vehicles: cloneVehicles(next), depth })
    }
  }
  return null
}
