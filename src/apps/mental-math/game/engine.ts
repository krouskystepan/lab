import { cloneExpr } from './expr'
import { createQuestion, extrasOf } from './generate'
import { isOver, type Action, type BoardState, type GameStatus } from './types'

function cloneMisses(misses: string[][]): string[][] {
  return misses.map((row) => row.slice())
}

export function cloneBoard(board: BoardState): BoardState {
  return {
    ...board,
    questions: board.questions.map((q) => ({
      expr: cloneExpr(q.expr),
      answer: q.answer
    })),
    picked: board.picked.slice(),
    misses: cloneMisses(board.misses)
  }
}

function statusAt(
  lengthId: BoardState['lengthId'],
  picked: readonly (string | null)[],
  index: number
): GameStatus {
  if (picked.length === 0) return 'ready'
  if (lengthId === 'endless') {
    return picked[index] != null ? 'revealed' : 'playing'
  }
  if (picked.every((p) => p != null)) return 'won'
  if (picked[index] != null) return 'revealed'
  return 'playing'
}

export function reduce(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'newGame':
    case 'importBoard':
      return cloneBoard(action.board)
    case 'timeUp': {
      if (state.paceId !== 'timed') return state
      if (isOver(state.status) || state.status === 'ready') return state
      if (state.questions.length === 0) return state
      return { ...state, status: 'lost' }
    }
    case 'goto': {
      if (state.questions.length === 0) return state
      if (action.index < 0 || action.index >= state.total) return state
      if (action.index === state.index) return state
      if (state.status === 'lost') {
        return { ...state, index: action.index }
      }
      return {
        ...state,
        index: action.index,
        status: statusAt(state.lengthId, state.picked, action.index)
      }
    }
    case 'submit': {
      if (isOver(state.status) || state.status === 'revealed') return state
      if (state.questions.length === 0) return state
      const q = state.questions[state.index]
      if (state.picked[state.index] != null) return state
      const row = state.misses[state.index] ?? []
      const token = action.typed.trim() || String(action.value)
      const hit = action.value === q.answer
      if (!hit) {
        if (row.includes(token)) return state
        const misses = cloneMisses(state.misses)
        while (misses.length < state.total) misses.push([])
        misses[state.index] = [...row, token]
        return {
          ...state,
          misses,
          status: 'playing'
        }
      }
      const picked = state.picked.slice()
      picked[state.index] = String(q.answer)
      const score = state.score + 1
      if (state.lengthId === 'endless') {
        const next = createQuestion(state.opId, state.diffId, extrasOf(state))
        return {
          ...state,
          questions: [...state.questions, next],
          picked: [...picked, null],
          misses: [...cloneMisses(state.misses), []],
          total: state.total + 1,
          index: state.total,
          score,
          status: 'playing'
        }
      }
      return {
        ...state,
        picked,
        score,
        status: statusAt(state.lengthId, picked, state.index)
      }
    }
  }
}
