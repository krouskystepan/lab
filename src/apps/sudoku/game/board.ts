/** Shared 9×9 helpers (index math, peers, placement checks). */

export const SIZE = 9
export const BOX = 3
export const CELL_COUNT = SIZE * SIZE

export function rowOf(i: number): number {
  return Math.floor(i / SIZE)
}

export function colOf(i: number): number {
  return i % SIZE
}

export function boxOf(i: number): number {
  return Math.floor(rowOf(i) / BOX) * BOX + Math.floor(colOf(i) / BOX)
}

export function samePeer(a: number, b: number): boolean {
  return a !== b && (rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b))
}

/** Indices sharing row, column, or box with `index` (excluding itself). */
export function peersOf(index: number): number[] {
  const out: number[] = []
  for (let i = 0; i < CELL_COUNT; i++) {
    if (samePeer(index, i)) out.push(i)
  }
  return out
}

export function canPlaceValues(values: number[], index: number, digit: number): boolean {
  if (digit < 1 || digit > 9) return false
  const r = rowOf(index)
  const c = colOf(index)
  const br = Math.floor(r / BOX) * BOX
  const bc = Math.floor(c / BOX) * BOX
  for (let i = 0; i < SIZE; i++) {
    if (values[r * SIZE + i] === digit) return false
    if (values[i * SIZE + c] === digit) return false
    const boxR = br + Math.floor(i / BOX)
    const boxC = bc + (i % BOX)
    if (values[boxR * SIZE + boxC] === digit) return false
  }
  return true
}

export function noteBit(digit: number): number {
  return 1 << (digit - 1)
}

/** Bitmask: bit (d-1) set means note d is present (d = 1..9). */
export type NotesMask = number

export function hasNote(mask: NotesMask, digit: number): boolean {
  return (mask & noteBit(digit)) !== 0
}

export function toggleNote(mask: NotesMask, digit: number): NotesMask {
  return mask ^ noteBit(digit)
}

export function notesFromMask(mask: NotesMask): number[] {
  const out: number[] = []
  for (let d = 1; d <= 9; d++) {
    if (hasNote(mask, d)) out.push(d)
  }
  return out
}
