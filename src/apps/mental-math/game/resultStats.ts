import type { BoardState } from './types'

export type ResultStats = {
  first: number
  second: number
  third: number
  last: number
  open: number
  solved: number
  total: number
  guesses: number
  wrong: number
  pct: number
}

/** Success is hits over items + extra misses. Unanswered count against %. */
export function resultStats(
  picked: readonly (string | null)[],
  misses: readonly string[][]
): ResultStats {
  let first = 0
  let second = 0
  let third = 0
  let last = 0
  let open = 0
  let wrong = 0
  const total = picked.length
  for (let i = 0; i < total; i++) {
    const n = (misses[i] ?? []).length
    wrong += n
    if (picked[i] == null) {
      open++
      continue
    }
    if (n === 0) first++
    else if (n === 1) second++
    else if (n === 2) third++
    else last++
  }
  const solved = first + second + third + last
  const guesses = solved + wrong
  const denom = total + wrong
  const pct = denom > 0 ? Math.round((solved / denom) * 100) : 0
  return {
    first,
    second,
    third,
    last,
    open,
    solved,
    total,
    guesses,
    wrong,
    pct
  }
}

/** Drop the unused next prompt Endless appends after a hit. */
export function drillStats(board: BoardState): ResultStats {
  let picked = board.picked
  let misses = board.misses
  if (board.lengthId === 'endless' && picked.length > 0) {
    const i = picked.length - 1
    if (picked[i] == null && (misses[i] ?? []).length === 0) {
      picked = picked.slice(0, i)
      misses = misses.slice(0, i)
    }
  }
  return resultStats(picked, misses)
}
