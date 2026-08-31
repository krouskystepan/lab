import { allOff, applyPress, cloneLights } from './board'
import type { Action, BoardState, Puzzle } from './types'

export function createBoard(puzzle: Puzzle): BoardState {
  return {
    size: puzzle.size,
    lights: cloneLights(puzzle.lights),
    start: cloneLights(puzzle.lights),
    puzzleId: puzzle.id,
    diffId: puzzle.diffId,
    minMoves: puzzle.minMoves,
    moves: 0,
    status: 'ready'
  }
}

export function reduce(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'newGame':
      return createBoard(action.puzzle)
    case 'reset':
      return {
        ...state,
        lights: cloneLights(state.start),
        moves: 0,
        status: 'ready'
      }
    case 'importBoard':
      return {
        size: action.board.size,
        lights: cloneLights(action.board.lights),
        start: cloneLights(action.board.start),
        puzzleId: action.board.puzzleId,
        diffId: action.board.diffId,
        minMoves: action.board.minMoves,
        moves: action.board.moves,
        status: action.board.status
      }
    case 'restore':
      return {
        ...state,
        lights: cloneLights(action.lights),
        moves: action.moves,
        status: action.status
      }
    case 'press': {
      if (state.status === 'won') return state
      if (action.index < 0 || action.index >= state.lights.length) return state
      const lights = applyPress(state.lights, state.size, action.index)
      return {
        ...state,
        lights,
        moves: state.moves + 1,
        status: allOff(lights) ? 'won' : 'playing'
      }
    }
  }
}
