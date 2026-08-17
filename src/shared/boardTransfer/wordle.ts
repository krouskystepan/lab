import { createBoard, rebuildGuesses } from '../../apps/wordle/game/engine'
import { presetById } from '../../apps/wordle/game/presets'
import type {
  BoardState as WordleGameBoard,
  DiffId,
  GameStatus
} from '../../apps/wordle/game/types'
import {
  DEFAULT_WORD_LEN,
  isWordLen,
  isWordOfLen
} from '../../apps/wordle/game/words'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type WordleBoardFile
} from './types'

function isDiffId(v: unknown): v is DiffId {
  return (
    v === 'easy' ||
    v === 'medium' ||
    v === 'hard' ||
    v === 'expert' ||
    v === 'random'
  )
}

function isStatus(v: unknown): v is GameStatus {
  return v === 'ready' || v === 'playing' || v === 'won' || v === 'lost'
}

export function exportWordleGame(
  board: WordleGameBoard,
  seconds?: number
): WordleBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'wordle',
    answer: board.answer,
    guesses: board.guesses.map((g) => g.word),
    current: board.current,
    game: {
      status: board.status,
      diffId: board.diffId,
      wordLen: board.wordLen,
      maxGuesses: board.maxGuesses,
      hardMode: board.hardMode,
      hinted: board.hinted.slice(),
      seconds
    }
  }
}

export function importWordleToGame(
  file: WordleBoardFile,
  fallbackDiffId: DiffId = 'easy'
): { board: WordleGameBoard; seconds: number } {
  const answer = String(file.answer ?? '').toLowerCase()
  const wordLen = isWordLen(file.game?.wordLen)
    ? file.game.wordLen
    : isWordLen(answer.length)
      ? answer.length
      : DEFAULT_WORD_LEN
  if (!isWordOfLen(answer, wordLen)) throw new Error('invalid_board')

  const guessWords = Array.isArray(file.guesses)
    ? file.guesses
        .map((w) => String(w).toLowerCase())
        .filter((w) => isWordOfLen(w, wordLen))
    : []
  const guesses = rebuildGuesses(guessWords, answer)
  const currentRaw = String(file.current ?? '').toLowerCase()
  const current =
    currentRaw.length <= wordLen && /^[a-z]*$/.test(currentRaw)
      ? currentRaw
      : ''

  const diffId = isDiffId(file.game?.diffId)
    ? file.game.diffId
    : fallbackDiffId
  const preset = presetById(diffId)
  const maxGuesses =
    typeof file.game?.maxGuesses === 'number' &&
    file.game.maxGuesses >= 1 &&
    file.game.maxGuesses <= 8
      ? Math.floor(file.game.maxGuesses)
      : preset.maxGuesses
  const hardMode =
    typeof file.game?.hardMode === 'boolean'
      ? file.game.hardMode
      : preset.hardMode
  const hinted = Array.from({ length: wordLen }, (_, i) =>
    Array.isArray(file.game?.hinted) ? file.game.hinted[i] === true : false
  )
  const status = isStatus(file.game?.status)
    ? file.game.status
    : guesses.some((g) => g.word === answer)
      ? 'won'
      : guesses.length >= maxGuesses
        ? 'lost'
        : guesses.length > 0 || current.length > 0
          ? 'playing'
          : 'ready'

  const board: WordleGameBoard =
    file.game != null
      ? {
          diffId,
          wordLen,
          answer,
          guesses,
          current: status === 'won' || status === 'lost' ? '' : current,
          status,
          maxGuesses,
          hardMode,
          hinted
        }
      : {
          ...createBoard(diffId, wordLen),
          answer,
          guesses,
          current,
          status,
          hinted
        }

  const seconds =
    typeof file.game?.seconds === 'number'
      ? Math.max(0, Math.floor(file.game.seconds))
      : 0

  return { board, seconds: status === 'ready' ? 0 : seconds }
}
