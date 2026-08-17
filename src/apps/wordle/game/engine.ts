import {
  answersFor,
  DEFAULT_WORD_LEN,
  isAllowedWord,
  isWordLen,
  isWordOfLen,
  pickAnswer,
  type WordLen
} from './words'
import { presetById } from './presets'
import { hardModeViolation, scoreGuess } from './score'
import type { Action, BoardState, DiffId, Guess } from './types'

function emptyHinted(len: number): boolean[] {
  return Array.from({ length: len }, () => false)
}

function cloneGuesses(guesses: Guess[]): Guess[] {
  return guesses.map((g) => ({ word: g.word, marks: g.marks.slice() }))
}

function asWordLen(n: number): WordLen {
  return isWordLen(n) ? n : DEFAULT_WORD_LEN
}

export function createBoard(
  diffId: DiffId,
  wordLen: WordLen = DEFAULT_WORD_LEN,
  avoid?: string
): BoardState {
  const preset = presetById(diffId)
  const pool = answersFor(diffId, wordLen)
  return {
    diffId,
    wordLen,
    answer: pickAnswer(pool, avoid),
    guesses: [],
    current: '',
    status: 'ready',
    maxGuesses: preset.maxGuesses,
    hardMode: preset.hardMode,
    hinted: emptyHinted(wordLen)
  }
}

function ended(state: BoardState): boolean {
  return state.status === 'won' || state.status === 'lost'
}

export function reduce(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'setDiff':
      return createBoard(action.id, asWordLen(state.wordLen), state.answer)
    case 'setWordLen':
      return createBoard(
        state.diffId,
        asWordLen(action.wordLen),
        state.answer
      )
    case 'newGame':
      return createBoard(state.diffId, asWordLen(state.wordLen), state.answer)
    case 'restore':
      return {
        ...state,
        guesses: cloneGuesses(action.guesses),
        current: action.current,
        status: action.status,
        hinted: action.hinted.slice()
      }
    case 'importBoard':
      return {
        ...action.board,
        guesses: cloneGuesses(action.board.guesses),
        hinted: action.board.hinted.slice()
      }
    case 'typeLetter': {
      if (ended(state)) return state
      const letter = action.letter.toLowerCase()
      if (!/^[a-z]$/.test(letter)) return state
      if (state.current.length >= state.wordLen) return state
      return {
        ...state,
        current: state.current + letter,
        status: 'playing'
      }
    }
    case 'backspace': {
      if (ended(state)) return state
      if (state.current.length === 0) return state
      return { ...state, current: state.current.slice(0, -1) }
    }
    case 'submit': {
      if (ended(state)) return state
      const word = state.current
      if (word.length !== state.wordLen) return state
      if (!isAllowedWord(word, state.answer)) return state
      if (state.hardMode && hardModeViolation(word, state.guesses)) {
        return state
      }
      const marks = scoreGuess(word, state.answer)
      const guesses = [...state.guesses, { word, marks }]
      let status: BoardState['status'] = 'playing'
      if (word === state.answer) status = 'won'
      else if (guesses.length >= state.maxGuesses) status = 'lost'
      return { ...state, guesses, current: '', status }
    }
    case 'hint': {
      if (ended(state)) return state
      if (action.index < 0 || action.index >= state.wordLen) return state
      if (state.hinted[action.index]) return state
      const hinted = state.hinted.slice()
      hinted[action.index] = true
      return {
        ...state,
        hinted,
        status: state.status === 'ready' ? 'playing' : state.status
      }
    }
    default:
      return state
  }
}

export function rebuildGuesses(words: string[], answer: string): Guess[] {
  return words
    .map((w) => w.toLowerCase())
    .filter((w) => isWordOfLen(w, answer.length))
    .map((word) => ({ word, marks: scoreGuess(word, answer) }))
}
