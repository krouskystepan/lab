import { cloneBoard } from '../../apps/mental-math/game/engine'
import { parseBoard } from '../../apps/mental-math/game/prefs'
import { timedSecondsFor } from '../../apps/mental-math/game/generate'
import {
  isDiffId,
  isLengthId,
  isOpId,
  isPaceId,
  isStatus,
  type BoardState,
  type GameStatus
} from '../../apps/mental-math/game/types'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type MentalMathBoardFile
} from './types'

export function exportMentalMathGame(
  board: BoardState,
  seconds?: number
): MentalMathBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'mentalmath',
    opId: board.opId,
    diffId: board.diffId,
    termsId: board.termsId,
    powers: board.powers,
    roots: board.roots,
    facts: board.facts,
    parens: board.parens,
    lengthId: board.lengthId,
    paceId: board.paceId,
    timeLimit: board.timeLimit,
    questions: board.questions.map((q) => ({
      expr: q.expr,
      answer: q.answer
    })),
    game: {
      roundId: board.roundId,
      index: board.index,
      score: board.score,
      picked: board.picked.slice(),
      misses: board.misses.map((row) => row.slice()),
      status: board.status,
      seconds
    }
  }
}

export function importMentalMathToGame(file: MentalMathBoardFile): {
  board: BoardState
  seconds: number
} {
  const opId = isOpId(file.opId) ? file.opId : 'mix'
  const diffId = isDiffId(file.diffId) ? file.diffId : 'easy'
  const lengthId = isLengthId(file.lengthId) ? file.lengthId : 'n20'
  const paceId = isPaceId(file.paceId) ? file.paceId : 'train'
  const parsed = parseBoard({
    opId,
    diffId,
    termsId: file.termsId,
    powers: file.powers ?? file.squares,
    roots: file.roots,
    facts: file.facts,
    parens: file.parens,
    lengthId,
    paceId,
    timeLimit:
      paceId === 'timed'
        ? typeof file.timeLimit === 'number' && file.timeLimit > 0
          ? Math.floor(file.timeLimit)
          : timedSecondsFor(lengthId, diffId)
        : 0,
    roundId: file.game?.roundId ?? 'import',
    total: file.questions.length,
    index: file.game?.index ?? 0,
    score: file.game?.score ?? 0,
    questions: file.questions,
    picked: file.game?.picked ?? file.questions.map(() => null),
    misses: file.game?.misses,
    status: isMmStatus(file.game?.status) ? file.game.status : 'ready'
  })
  if (!parsed) throw new Error('invalid')
  const seconds =
    typeof file.game?.seconds === 'number'
      ? Math.max(0, Math.floor(file.game.seconds))
      : 0
  return { board: cloneBoard(parsed), seconds }
}

function isMmStatus(v: unknown): v is GameStatus {
  return isStatus(v)
}
