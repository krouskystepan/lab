import { emptyBoard, timedSecondsFor } from './generate'
import { cloneBoard } from './engine'
import {
  isAnswerId,
  isGroupId,
  isPaceId,
  isQuestionKind,
  isStatus,
  parseModeId,
  type BoardState,
  type PaceId,
  type Question
} from './types'

const KEY = 'geo-quiz.game.v2'
const AUTO_KEY = 'geo-quiz.autoNext.v2'

export type SavedGame = {
  version: 2
  board: BoardState
  seconds: number
}

export type LoadedGame = {
  board: BoardState
  seconds: number
}

export function parseBoard(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<BoardState>
  const modeId = parseModeId(o.modeId)
  if (!modeId) return null
  if (typeof o.roundId !== 'string') return null
  if (!isStatus(o.status)) return null
  if (typeof o.total !== 'number' || o.total < 0) return null
  if (typeof o.index !== 'number' || o.index < 0) return null
  if (typeof o.score !== 'number' || o.score < 0) return null
  if (!Array.isArray(o.questions) || !Array.isArray(o.picked)) return null
  const questions: Question[] = []
  for (const q of o.questions) {
    if (!q || typeof q !== 'object') return null
    if (!isQuestionKind(q.kind)) return null
    if (typeof q.subject !== 'string') return null
    if (!Array.isArray(q.choices) || q.choices.length !== 4) return null
    if (!q.choices.every((c) => typeof c === 'string')) return null
    if (!q.choices.includes(q.subject)) return null
    questions.push({
      kind: q.kind,
      subject: q.subject,
      choices: q.choices.slice()
    })
  }
  if (questions.length !== o.total) return null
  if (o.index >= questions.length && questions.length > 0) return null
  if (o.picked.length !== questions.length) return null
  const picked = o.picked.map((p) => (typeof p === 'string' ? p : null))
  const misses = parseMisses(o.misses, questions.length)
  const groupId = isGroupId(o.groupId) ? o.groupId : 'world'
  const answerId = isAnswerId(o.answerId) ? o.answerId : 'choice'
  const paceId: PaceId = isPaceId(o.paceId) ? o.paceId : 'train'
  const storedLimit =
    typeof o.timeLimit === 'number' && Number.isFinite(o.timeLimit)
      ? Math.max(0, Math.floor(o.timeLimit))
      : 0
  const timeLimit =
    paceId === 'timed'
      ? storedLimit > 0
        ? storedLimit
        : timedSecondsFor(groupId, answerId)
      : 0
  return {
    modeId,
    groupId,
    answerId,
    paceId,
    timeLimit,
    roundId: o.roundId,
    total: questions.length,
    index: Math.floor(o.index),
    score: Math.floor(o.score),
    questions,
    picked,
    misses,
    status: o.status
  }
}

function parseMisses(raw: unknown, n: number): string[][] {
  const empty = Array.from({ length: n }, () => [] as string[])
  if (!Array.isArray(raw) || raw.length !== n) return empty
  return raw.map((row) =>
    Array.isArray(row)
      ? row.filter((x): x is string => typeof x === 'string' && x.length > 0)
      : []
  )
}

export function loadGame(): LoadedGame {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedGame>
      if (parsed.version === 2) {
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
  return { board: emptyBoard('mix'), seconds: 0 }
}

export function loadAutoNext(): boolean {
  try {
    return localStorage.getItem(AUTO_KEY) !== '0'
  } catch {
    return true
  }
}

export function saveAutoNext(on: boolean): void {
  try {
    localStorage.setItem(AUTO_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function saveGame(board: BoardState, seconds: number): void {
  try {
    const payload: SavedGame = {
      version: 2,
      board: cloneBoard(board),
      seconds: Math.max(0, Math.floor(seconds))
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
