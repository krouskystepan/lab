import { cloneVehicles, encodeGrid, isEscaped, parseLot } from '../../apps/rush-hour/game/board'
import { createBoard } from '../../apps/rush-hour/game/engine'
import { pickPuzzle, puzzleById } from '../../apps/rush-hour/game/puzzles'
import type {
  BoardState,
  DiffId,
  GameStatus
} from '../../apps/rush-hour/game/types'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type RushHourBoardFile
} from './types'

function isDiffId(v: unknown): v is DiffId {
  return v === 'easy' || v === 'medium' || v === 'hard' || v === 'expert'
}

function isStatus(v: unknown): v is GameStatus {
  return v === 'ready' || v === 'playing' || v === 'won'
}

export function exportRushHourGame(
  board: BoardState,
  seconds?: number
): RushHourBoardFile {
  const lot = { size: board.size, walls: board.walls }
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'rushhour',
    grid: encodeGrid(board.vehicles, lot),
    start: encodeGrid(board.start, lot),
    game: {
      puzzleId: board.puzzleId,
      diffId: board.diffId,
      moves: board.moves,
      status: board.status,
      seconds
    }
  }
}

export function importRushHourToGame(file: RushHourBoardFile): {
  board: BoardState
  seconds: number
} {
  const puzzle =
    (file.game?.puzzleId ? puzzleById(file.game.puzzleId) : undefined) ??
    pickPuzzle(isDiffId(file.game?.diffId) ? file.game.diffId : 'easy')
  const base = createBoard(puzzle)
  const current = parseLot(file.grid)
  const start = file.start ? parseLot(file.start) : {
    size: base.size,
    walls: base.walls,
    vehicles: cloneVehicles(base.start)
  }
  const status: GameStatus = isStatus(file.game?.status)
    ? file.game.status
    : isEscaped(current.vehicles, current.size)
      ? 'won'
      : encodeGrid(current.vehicles, current) === encodeGrid(start.vehicles, start)
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
      ...base,
      size: current.size,
      walls: current.walls,
      vehicles: cloneVehicles(current.vehicles),
      start: cloneVehicles(start.vehicles),
      moves,
      status: isEscaped(current.vehicles, current.size) ? 'won' : status
    },
    seconds: status === 'ready' ? 0 : seconds
  }
}
