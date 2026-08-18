import { fromFen, toFen } from '../../apps/chess-mate/solver/fen'
import { isMateN, type MateN, type Position } from '../../apps/chess-mate/solver/types'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type ChessBoardFile
} from './types'

export function exportChessMateBoard(
  pos: Position,
  mateN?: MateN,
  flipped?: boolean
): ChessBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'chess',
    fen: toFen(pos),
    game: {
      mateN,
      flipped
    }
  }
}

export function importChessMateBoard(file: ChessBoardFile): {
  pos: Position
  mateN?: MateN
  flipped?: boolean
} {
  if (typeof file.fen !== 'string') throw new Error('invalid')
  const pos = fromFen(file.fen)
  if (!pos) throw new Error('invalid')
  return {
    pos,
    mateN: isMateN(file.game?.mateN) ? file.game.mateN : undefined,
    flipped: file.game?.flipped === true
  }
}
