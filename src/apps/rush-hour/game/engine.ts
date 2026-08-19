import {
  PRIMARY,
  exitRow,
  type Action,
  type BoardState,
  type Lot,
  type Puzzle,
  type Slide,
  type Vehicle
} from './types'
import { cloneVehicles, isEscaped, occupancy, parseLot } from './board'

export function createBoard(puzzle: Puzzle): BoardState {
  const { size, walls, vehicles } = parseLot(puzzle.grid)
  return {
    size,
    walls,
    vehicles,
    start: cloneVehicles(vehicles),
    puzzleId: puzzle.id,
    diffId: puzzle.diffId,
    minMoves: puzzle.minMoves,
    moves: 0,
    status: 'ready'
  }
}

export function reduce(state: BoardState, action: Action): BoardState {
  const lot: Lot = { size: state.size, walls: state.walls }
  switch (action.type) {
    case 'newGame':
      return createBoard(action.puzzle)
    case 'reset':
      return {
        ...state,
        vehicles: cloneVehicles(state.start),
        moves: 0,
        status: 'ready'
      }
    case 'importBoard':
      return {
        size: action.board.size,
        walls: action.board.walls.slice(),
        vehicles: cloneVehicles(action.board.vehicles),
        start: cloneVehicles(action.board.start),
        puzzleId: action.board.puzzleId,
        diffId: action.board.diffId,
        minMoves: action.board.minMoves,
        moves: action.board.moves,
        status: action.board.status
      }
    case 'restore':
      return {
        ...state,
        vehicles: cloneVehicles(action.vehicles),
        moves: action.moves,
        status: action.status
      }
    case 'slide': {
      if (state.status === 'won') return state
      const next = applySlide(
        state.vehicles,
        { id: action.id, row: action.row, col: action.col },
        lot
      )
      if (!next) return state
      return {
        ...state,
        vehicles: next,
        moves: state.moves + 1,
        status: isEscaped(next, state.size) ? 'won' : 'playing'
      }
    }
  }
}

export function applySlide(
  vehicles: Vehicle[],
  slide: Slide,
  lot: Lot
): Vehicle[] | null {
  const v = vehicles.find((x) => x.id === slide.id)
  if (!v) return null
  if (v.dir === 'h' && slide.row !== v.row) return null
  if (v.dir === 'v' && slide.col !== v.col) return null
  if (v.row === slide.row && v.col === slide.col) return null
  const { min, max } = axisRange(vehicles, slide.id, lot)
  const pos = v.dir === 'h' ? slide.col : slide.row
  if (pos < min || pos > max) return null
  return vehicles.map((x) =>
    x.id === slide.id ? { ...x, row: slide.row, col: slide.col } : x
  )
}

export function axisRange(
  vehicles: Vehicle[],
  id: string,
  lot: Lot
): { min: number; max: number } {
  const v = vehicles.find((x) => x.id === id)
  if (!v) return { min: 0, max: 0 }
  const occ = occupancy(vehicles, lot, id)
  let min = v.dir === 'h' ? v.col : v.row
  let max = min
  while (fits({ ...v, [v.dir === 'h' ? 'col' : 'row']: min - 1 }, occ, lot.size)) {
    min--
  }
  while (fits({ ...v, [v.dir === 'h' ? 'col' : 'row']: max + 1 }, occ, lot.size)) {
    max++
  }
  return { min, max }
}

export function slidesOf(vehicles: Vehicle[], id: string, lot: Lot): Slide[] {
  const v = vehicles.find((x) => x.id === id)
  if (!v) return []
  const { min, max } = axisRange(vehicles, id, lot)
  const out: Slide[] = []
  if (v.dir === 'h') {
    for (let col = min; col <= max; col++) {
      if (col !== v.col) out.push({ id, row: v.row, col })
    }
  } else {
    for (let row = min; row <= max; row++) {
      if (row !== v.row) out.push({ id, row, col: v.col })
    }
  }
  return out
}

export function allSlides(vehicles: Vehicle[], lot: Lot): Slide[] {
  return vehicles.flatMap((v) => slidesOf(vehicles, v.id, lot))
}

function fits(v: Vehicle, occ: boolean[], size: number): boolean {
  if (v.id !== PRIMARY) {
    if (v.dir === 'h' && (v.col < 0 || v.col + v.len > size)) return false
    if (v.dir === 'v' && (v.row < 0 || v.row + v.len > size)) return false
  } else if (v.dir !== 'h' || v.row !== exitRow(size) || v.col < 0 || v.col >= size) {
    return false
  }
  for (let i = 0; i < v.len; i++) {
    const r = v.dir === 'v' ? v.row + i : v.row
    const c = v.dir === 'h' ? v.col + i : v.col
    if (r < 0 || r >= size || c < 0 || c >= size) continue
    if (occ[r * size + c]) return false
  }
  return true
}
