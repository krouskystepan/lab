import {
  PRIMARY,
  exitRow,
  isBoardSize,
  type Lot,
  type Vehicle
} from './types'

export function cloneVehicles(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map((v) => ({ ...v }))
}

export function primaryOf(vehicles: Vehicle[]): Vehicle | undefined {
  return vehicles.find((v) => v.id === PRIMARY)
}

export function isEscaped(vehicles: Vehicle[], size: number): boolean {
  const red = primaryOf(vehicles)
  if (!red || red.dir !== 'h' || red.row !== exitRow(size)) return false
  return red.col + red.len > size
}

export function occupancy(
  vehicles: Vehicle[],
  lot: Lot,
  skipId?: string
): boolean[] {
  const occ = Array.from({ length: lot.size * lot.size }, () => false)
  for (const w of lot.walls) {
    if (w >= 0 && w < occ.length) occ[w] = true
  }
  for (const v of vehicles) {
    if (v.id === skipId) continue
    for (const i of cellsOf(v, lot.size)) occ[i] = true
  }
  return occ
}

export function cellsOf(v: Vehicle, size: number): number[] {
  const out: number[] = []
  for (let i = 0; i < v.len; i++) {
    const r = v.dir === 'v' ? v.row + i : v.row
    const c = v.dir === 'h' ? v.col + i : v.col
    if (r >= 0 && r < size && c >= 0 && c < size) out.push(r * size + c)
  }
  return out
}

export type ParsedLot = Lot & { vehicles: Vehicle[] }

export function parseLot(grid: string): ParsedLot {
  const raw = grid.replace(/\s+/g, '')
  const size = Math.sqrt(raw.length)
  if (!Number.isInteger(size) || !isBoardSize(size)) throw new Error('invalid_grid')
  const walls: number[] = []
  const cells = raw.split('').map((ch, i) => {
    if (ch === 'o' || ch === '.') return '.'
    if (ch === 'x' || ch === 'X') {
      walls.push(i)
      return '.'
    }
    return ch.toUpperCase()
  })
  if (cells.some((ch) => ch !== '.' && (ch < 'A' || ch > 'Z'))) {
    throw new Error('invalid_grid')
  }

  const groups = new Map<string, number[]>()
  cells.forEach((ch, i) => {
    if (ch === '.') return
    const list = groups.get(ch)
    if (list) list.push(i)
    else groups.set(ch, [i])
  })

  const vehicles: Vehicle[] = []
  for (const [id, idxs] of groups) {
    const vehicle = vehicleFromCells(id, idxs, size)
    if (!vehicle) throw new Error('invalid_grid')
    vehicles.push(vehicle)
  }

  vehicles.sort((a, b) => a.id.localeCompare(b.id))
  const red = primaryOf(vehicles)
  if (!red || red.dir !== 'h' || red.row !== exitRow(size) || red.len !== 2) {
    throw new Error('invalid_grid')
  }
  return { size, walls, vehicles }
}

function vehicleFromCells(
  id: string,
  idxs: number[],
  size: number
): Vehicle | null {
  if (idxs.length !== 2 && idxs.length !== 3) return null
  const rows = idxs.map((i) => Math.floor(i / size))
  const cols = idxs.map((i) => i % size)
  const sameRow = rows.every((r) => r === rows[0])
  const sameCol = cols.every((c) => c === cols[0])
  if (sameRow === sameCol) return null
  if (sameRow) {
    const sorted = cols.slice().sort((a, b) => a - b)
    if (!consecutive(sorted)) return null
    return { id, row: rows[0], col: sorted[0], len: sorted.length as 2 | 3, dir: 'h' }
  }
  const sorted = rows.slice().sort((a, b) => a - b)
  if (!consecutive(sorted)) return null
  return { id, row: sorted[0], col: cols[0], len: sorted.length as 2 | 3, dir: 'v' }
}

function consecutive(sorted: number[]): boolean {
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return false
  }
  return true
}

export function encodeGrid(vehicles: Vehicle[], lot: Lot): string {
  const cells = Array.from({ length: lot.size * lot.size }, () => 'o')
  for (const w of lot.walls) cells[w] = 'x'
  for (const v of vehicles) {
    for (const i of cellsOf(v, lot.size)) cells[i] = v.id
  }
  return cells.join('')
}

export function stateKey(vehicles: Vehicle[]): string {
  return vehicles.map((v) => (v.dir === 'h' ? v.col : v.row)).join(',')
}

export function lotOf(state: { size: number; walls: number[] }): Lot {
  return { size: state.size, walls: state.walls }
}
