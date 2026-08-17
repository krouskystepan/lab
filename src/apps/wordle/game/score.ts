import type { Guess, HardViolation, TileMark } from './types'

/**
 * Classic two-pass Wordle scoring: lock greens first, then spend leftover
 * answer-letter counts on yellows. Duplicate letters in the guess only go
 * yellow while that letter still remains in the answer.
 */
export function scoreGuess(guess: string, answer: string): TileMark[] {
  const len = answer.length
  const marks: TileMark[] = Array.from({ length: len }, () => 'absent')
  const leftover: Record<string, number> = {}

  for (let i = 0; i < len; i++) {
    const a = answer[i]
    if (guess[i] === a) {
      marks[i] = 'correct'
    } else {
      leftover[a] = (leftover[a] ?? 0) + 1
    }
  }

  for (let i = 0; i < len; i++) {
    if (marks[i] === 'correct') continue
    const ch = guess[i]
    const n = leftover[ch] ?? 0
    if (n > 0) {
      marks[i] = 'present'
      leftover[ch] = n - 1
    }
  }

  return marks
}

/** Hard mode: keep every green in place; every yellow letter must be reused. */
export function hardModeViolation(
  guess: string,
  previous: readonly Guess[]
): HardViolation | null {
  const mustInclude = new Set<string>()

  for (const g of previous) {
    for (let i = 0; i < g.word.length; i++) {
      const mark = g.marks[i]
      const letter = g.word[i]
      if (mark === 'correct' && guess[i] !== letter) {
        return { kind: 'green', letter, n: i + 1 }
      }
      if (mark === 'present') mustInclude.add(letter)
    }
  }

  for (const letter of mustInclude) {
    if (!guess.includes(letter)) {
      return { kind: 'yellow', letter }
    }
  }

  return null
}

const MARK_RANK: Record<TileMark | 'empty', number> = {
  empty: 0,
  absent: 1,
  present: 2,
  correct: 3
}

/** Best mark seen for a letter across submitted guesses (keyboard coloring). */
export function bestKeyMark(
  letter: string,
  guesses: readonly Guess[]
): TileMark | 'empty' {
  let best: TileMark | 'empty' = 'empty'
  for (const g of guesses) {
    for (let i = 0; i < g.word.length; i++) {
      if (g.word[i] !== letter) continue
      const mark = g.marks[i]
      if (MARK_RANK[mark] > MARK_RANK[best]) best = mark
    }
  }
  return best
}
