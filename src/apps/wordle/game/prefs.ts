import { createBoard } from './engine'
import { DEFAULT_WORD_LEN, isWordLen, isWordOfLen } from './words'
import { presetById } from './presets'
import { scoreGuess } from './score'
import type { BoardState, DiffId, GameStatus, Guess } from './types'

const KEY = 'wordle.game.v1'

export type SavedGame = {
  version: 1
  board: BoardState
  seconds: number
}

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

function isGuess(v: unknown, len: number): v is Guess {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.word !== 'string' || !isWordOfLen(o.word.toLowerCase(), len)) {
    return false
  }
  if (!Array.isArray(o.marks) || o.marks.length !== len) return false
  return o.marks.every(
    (m) => m === 'correct' || m === 'present' || m === 'absent'
  )
}

function parseBoard(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<BoardState>
  if (!isDiffId(o.diffId)) return null
  if (!isStatus(o.status)) return null
  if (typeof o.answer !== 'string') return null
  const wordLen = isWordLen(o.wordLen)
    ? o.wordLen
    : isWordLen(o.answer.length)
      ? o.answer.length
      : DEFAULT_WORD_LEN
  if (!isWordOfLen(o.answer.toLowerCase(), wordLen)) return null
  if (!Array.isArray(o.guesses) || !o.guesses.every((g) => isGuess(g, wordLen))) {
    return null
  }
  if (typeof o.current !== 'string') return null
  if (o.current.length > wordLen || !/^[a-z]*$/.test(o.current)) return null
  const preset = presetById(o.diffId)
  const maxGuesses =
    typeof o.maxGuesses === 'number' && o.maxGuesses >= 1 && o.maxGuesses <= 8
      ? Math.floor(o.maxGuesses)
      : preset.maxGuesses
  const hardMode = typeof o.hardMode === 'boolean' ? o.hardMode : preset.hardMode
  const hinted = Array.from({ length: wordLen }, (_, i) =>
    Array.isArray(o.hinted) ? o.hinted[i] === true : false
  )
  const answer = o.answer.toLowerCase()
  const guesses = o.guesses.map((g) => ({
    word: g.word.toLowerCase(),
    marks: scoreGuess(g.word.toLowerCase(), answer)
  }))

  return {
    diffId: o.diffId,
    wordLen,
    answer,
    guesses,
    current: o.current.toLowerCase(),
    status: o.status,
    maxGuesses,
    hardMode,
    hinted
  }
}

export type LoadedGame = {
  board: BoardState
  seconds: number
}

export function loadGame(): LoadedGame {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedGame>
      if (parsed.version === 1) {
        const board = parseBoard(parsed.board)
        if (board) {
          const seconds =
            typeof parsed.seconds === 'number'
              ? Math.max(0, Math.floor(parsed.seconds))
              : 0
          return {
            board,
            seconds: board.status === 'ready' ? 0 : seconds
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  return {
    board: createBoard('easy'),
    seconds: 0
  }
}

export function saveGame(board: BoardState, seconds: number): void {
  try {
    const payload: SavedGame = {
      version: 1,
      board: {
        ...board,
        guesses: board.guesses.map((g) => ({
          word: g.word,
          marks: g.marks.slice()
        })),
        hinted: board.hinted.slice()
      },
      seconds: Math.max(0, Math.floor(seconds))
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
