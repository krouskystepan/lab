import type { BoardState } from './types'

export type HintTarget = {
  index: number
  letter: string
}

/** First answer letter that is not already a locked green and not hinted. */
export function findHint(state: BoardState): HintTarget | null {
  if (state.status === 'won' || state.status === 'lost') return null
  const len = state.wordLen
  const known = Array.from({ length: len }, () => false)
  for (const g of state.guesses) {
    for (let i = 0; i < len; i++) {
      if (g.marks[i] === 'correct') known[i] = true
    }
  }
  for (let i = 0; i < len; i++) {
    if (!known[i] && !state.hinted[i]) {
      return { index: i, letter: state.answer[i] }
    }
  }
  return null
}
