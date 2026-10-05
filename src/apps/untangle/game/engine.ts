import {
  COINCIDENT,
  clampInset,
  clonePos,
  dist,
  problemCount
} from './geometry'
import type { Action, BoardState, Puzzle } from './types'

export function createBoard(puzzle: Puzzle): BoardState {
  return {
    diffId: puzzle.diffId,
    puzzleId: puzzle.id,
    n: puzzle.n,
    edges: puzzle.edges.map(([a, b]) => [a, b]),
    start: clonePos(puzzle.start),
    pos: clonePos(puzzle.start),
    moves: 0,
    status: 'ready'
  }
}

export function landingOk(pos: BoardState['pos'], index: number, next: { x: number; y: number }): boolean {
  if (index < 0 || index >= pos.length) return false
  const p = clampInset(next)
  if (dist(pos[index], p) <= 0.01) return false
  for (let i = 0; i < pos.length; i++) {
    if (i !== index && dist(pos[i], p) < COINCIDENT) return false
  }
  return true
}

export function reduce(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'move': {
      if (state.status === 'won') return state
      if (!landingOk(state.pos, action.index, action.pos)) return state
      const pos = clonePos(state.pos)
      pos[action.index] = clampInset(action.pos)
      const clean = problemCount(state.edges, pos) === 0
      return {
        ...state,
        pos,
        moves: state.moves + 1,
        status: clean ? 'won' : 'playing'
      }
    }
    case 'restore':
      return {
        ...state,
        pos: clonePos(action.pos),
        moves: action.moves,
        status: action.status
      }
    case 'newGame':
      return createBoard(action.puzzle)
    case 'reset':
      return {
        ...state,
        pos: clonePos(state.start),
        moves: 0,
        status: 'ready'
      }
    case 'importBoard':
      return action.board
    default:
      return state
  }
}
