import { cloneBoard } from '../../apps/geo-quiz/game/engine'
import { parseBoard } from '../../apps/geo-quiz/game/prefs'
import { timedSecondsFor } from '../../apps/geo-quiz/game/generate'
import {
  isAnswerId,
  isGroupId,
  isPaceId,
  isStatus,
  parseModeId,
  type BoardState,
  type GameStatus
} from '../../apps/geo-quiz/game/types'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type GeoQuizBoardFile
} from './types'

export function exportGeoQuizGame(
  board: BoardState,
  seconds?: number
): GeoQuizBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'geoquiz',
    modeId: board.modeId,
    groupId: board.groupId,
    answerId: board.answerId,
    paceId: board.paceId,
    timeLimit: board.timeLimit,
    questions: board.questions.map((q) => ({
      kind: q.kind,
      subject: q.subject,
      choices: q.choices.slice()
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

export function importGeoQuizToGame(file: GeoQuizBoardFile): {
  board: BoardState
  seconds: number
} {
  const parsed = parseBoard({
    modeId: parseModeId(file.modeId) ?? 'mix',
    groupId: isGroupId(file.groupId) ? file.groupId : 'world',
    answerId: isAnswerId(file.answerId) ? file.answerId : 'choice',
    paceId: isPaceId(file.paceId) ? file.paceId : 'train',
    timeLimit:
      isPaceId(file.paceId) && file.paceId === 'timed'
        ? typeof file.timeLimit === 'number' && file.timeLimit > 0
          ? Math.floor(file.timeLimit)
          : timedSecondsFor(
              isGroupId(file.groupId) ? file.groupId : 'world',
              isAnswerId(file.answerId) ? file.answerId : 'choice'
            )
        : 0,
    roundId: file.game?.roundId ?? 'import',
    total: file.questions.length,
    index: file.game?.index ?? 0,
    score: file.game?.score ?? 0,
    questions: file.questions,
    picked: file.game?.picked ?? file.questions.map(() => null),
    misses: file.game?.misses,
    status: isGeoStatus(file.game?.status) ? file.game.status : 'ready'
  })
  if (!parsed) throw new Error('invalid')
  const seconds =
    typeof file.game?.seconds === 'number'
      ? Math.max(0, Math.floor(file.game.seconds))
      : 0
  return {
    board: cloneBoard(parsed),
    seconds: parsed.status === 'ready' ? 0 : seconds
  }
}

function isGeoStatus(v: unknown): v is GameStatus {
  return isStatus(v)
}
