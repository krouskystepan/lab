import { allOff, cloneLights, encodeLights, parseLights } from '../../apps/lights-out/game/board'
import { minSolution, solutionCount } from '../../apps/lights-out/game/solve'
import {
  isBoardSize,
  isDiffId,
  isStatus,
  type BoardState,
  type GameStatus
} from '../../apps/lights-out/game/types'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type LightsOutBoardFile
} from './types'

export function exportLightsOutGame(
  board: BoardState,
  seconds?: number
): LightsOutBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'lightsout',
    size: board.size,
    lights: encodeLights(board.lights),
    start: encodeLights(board.start),
    game: {
      puzzleId: board.puzzleId,
      diffId: board.diffId,
      moves: board.moves,
      minMoves: board.minMoves,
      status: board.status,
      seconds
    }
  }
}

export function importLightsOutToGame(file: LightsOutBoardFile): {
  board: BoardState
  seconds: number
} {
  if (!isBoardSize(file.size)) throw new Error('invalid')
  const lights = parseLights(file.lights, file.size)
  if (!lights) throw new Error('invalid')
  const start = file.start
    ? parseLights(file.start, file.size)
    : cloneLights(lights)
  if (!start) throw new Error('invalid')

  const diffId = isDiffId(file.game?.diffId) ? file.game.diffId : 'hard'
  const sol = minSolution(start, file.size)
  const minMoves =
    typeof file.game?.minMoves === 'number' && file.game.minMoves >= 0
      ? Math.floor(file.game.minMoves)
      : sol
        ? solutionCount(sol)
        : 0
  const status: GameStatus = allOff(lights)
    ? 'won'
    : isStatus(file.game?.status)
      ? file.game.status === 'won'
        ? 'playing'
        : file.game.status
      : encodeLights(lights) === encodeLights(start)
        ? 'ready'
        : 'playing'
  const moves =
    typeof file.game?.moves === 'number' && file.game.moves >= 0
      ? Math.floor(file.game.moves)
      : 0
  const seconds =
    typeof file.game?.seconds === 'number'
      ? Math.max(0, Math.floor(file.game.seconds))
      : 0

  return {
    board: {
      size: file.size,
      lights: cloneLights(lights),
      start: cloneLights(start),
      puzzleId: file.game?.puzzleId ?? `import-${encodeLights(start)}`,
      diffId,
      minMoves,
      moves,
      status
    },
    seconds: status === 'ready' ? 0 : seconds
  }
}
