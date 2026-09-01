import { isOver, type Action, type BoardState, type GameStatus } from './types'

function cloneMisses(misses: string[][]): string[][] {
  return misses.map((row) => row.slice())
}

export function cloneBoard(board: BoardState): BoardState {
  return {
    ...board,
    questions: board.questions.map((q) => ({
      kind: q.kind,
      subject: q.subject,
      choices: q.choices.slice()
    })),
    picked: board.picked.slice(),
    misses: cloneMisses(board.misses)
  }
}

function statusAt(picked: readonly (string | null)[], index: number): GameStatus {
  if (picked.length === 0) return 'ready'
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
        status: statusAt(state.picked, action.index)
      }
    }
    case 'pick': {
      if (isOver(state.status) || state.status === 'revealed') return state
      if (state.questions.length === 0) return state
      const q = state.questions[state.index]
      if (state.picked[state.index] != null) return state
      const row = state.misses[state.index] ?? []
      if (action.fromType) {
        if (action.code !== q.subject && action.code !== '') return state
      } else if (!q.choices.includes(action.code)) {
        return state
      } else if (row.includes(action.code)) {
        return state
      }
      const hit = action.code === q.subject
      if (!hit) {
        const token = action.fromType
          ? (action.typed ?? '').trim() || '?'
          : action.code
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
      picked[state.index] = q.subject
      const firstTry = row.length === 0
      return {
        ...state,
        picked,
        score: state.score + (firstTry ? 1 : 0),
        status: statusAt(picked, state.index)
      }
    }
  }
}
