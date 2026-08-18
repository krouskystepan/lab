import { Chess, type Move } from 'chess.js'
import { SOLVE_MS, type MatePly, type MateResult } from './types'

function plyOf(move: Move): MatePly {
  return {
    san: move.san,
    from: move.from,
    to: move.to,
    promotion: move.promotion
  }
}

/** Side not to move is in check - that position could never arise. */
function opponentAlreadyInCheck(chess: Chess): boolean {
  const us = chess.turn()
  const them = us === 'w' ? 'b' : 'w'
  const king = chess.findPiece({ type: 'k', color: them })[0]
  return Boolean(king && chess.isAttacked(king, us))
}

function orderedMoves(chess: Chess): Move[] {
  const moves = chess.moves({ verbose: true })
  return moves.sort((a, b) => score(b) - score(a))
}

function score(m: Move): number {
  if (m.san.includes('#')) return 400
  if (m.san.includes('+')) return 200
  if (m.promotion) return 150
  if (m.captured) return 80 + (m.piece === 'q' ? 20 : 0)
  return 0
}

function timedOut(deadline: number): boolean {
  return performance.now() > deadline
}

/**
 * Forced mate in `n` moves by the side to move.
 * Returns one principal variation (attacker + defender replies).
 */
export function findMate(
  fen: string,
  n: number,
  timeMs = SOLVE_MS
): MateResult {
  let chess: Chess
  try {
    chess = new Chess(fen)
  } catch {
    return { ok: false, reason: 'invalid' }
  }
  if (opponentAlreadyInCheck(chess)) return { ok: false, reason: 'invalid' }
  if (chess.isCheckmate()) return { ok: false, reason: 'already_mate' }
  if (chess.isStalemate()) return { ok: false, reason: 'stalemate' }
  if (chess.isGameOver()) return { ok: false, reason: 'none' }

  const deadline = performance.now() + timeMs
  const max = Math.max(1, Math.min(3, Math.floor(n)))

  try {
    for (let depth = 1; depth <= max; depth++) {
      if (timedOut(deadline)) return { ok: false, reason: 'timeout' }
      const keys: string[] = []
      let line: MatePly[] | null = null
      const moves = orderedMoves(chess)
      for (const m of moves) {
        if (timedOut(deadline)) return { ok: false, reason: 'timeout' }
        chess.move(m)
        let rest: MatePly[] | null = null
        if (chess.isCheckmate()) {
          rest = []
        } else if (depth > 1 && !chess.isGameOver()) {
          rest = defenderForced(chess, depth - 1, deadline)
        }
        chess.undo()
        if (!rest) continue
        keys.push(m.san)
        if (!line) line = [plyOf(m), ...rest]
      }
      if (line) return { ok: true, mateIn: depth, line, keys }
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'timeout') {
      return { ok: false, reason: 'timeout' }
    }
    return { ok: false, reason: 'none' }
  }

  return { ok: false, reason: 'none' }
}

/** Every defender move still allows attacker mate in `n` attacker-moves. */
function defenderForced(
  chess: Chess,
  n: number,
  deadline: number
): MatePly[] | null {
  if (timedOut(deadline)) throw new Error('timeout')
  const replies = orderedMoves(chess)
  if (replies.length === 0) return null
  let sample: MatePly[] | null = null
  for (const m of replies) {
    if (timedOut(deadline)) throw new Error('timeout')
    chess.move(m)
    const attack = attackerMate(chess, n, deadline)
    chess.undo()
    if (!attack) return null
    if (!sample) sample = [plyOf(m), ...attack]
  }
  return sample
}

function attackerMate(
  chess: Chess,
  n: number,
  deadline: number
): MatePly[] | null {
  if (timedOut(deadline)) throw new Error('timeout')
  const moves = orderedMoves(chess)
  for (const m of moves) {
    chess.move(m)
    let found: MatePly[] | null = null
    if (chess.isCheckmate()) {
      found = [plyOf(m)]
    } else if (n > 1 && !chess.isGameOver()) {
      const def = defenderForced(chess, n - 1, deadline)
      if (def) found = [plyOf(m), ...def]
    }
    chess.undo()
    if (found) return found
  }
  return null
}
