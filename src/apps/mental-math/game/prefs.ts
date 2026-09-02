import { emptyBoard, timedSecondsFor } from './generate'
import { cloneBoard } from './engine'
import { parseQuestionExpr } from './expr'
import {
  extrasForDiff,
  isDiffId,
  isLengthId,
  isOpId,
  isPaceId,
  isStatus,
  isTermsId,
  type BoardState,
  type PaceId,
  type Question
} from './types'

const KEY = 'mental-math.game.v2'

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
  if (!isOpId(o.opId)) return null
  if (typeof o.roundId !== 'string') return null
  if (!isStatus(o.status)) return null
  if (typeof o.total !== 'number' || o.total < 0) return null
  if (typeof o.index !== 'number' || o.index < 0) return null
  if (typeof o.score !== 'number' || o.score < 0) return null
  if (!Array.isArray(o.questions) || !Array.isArray(o.picked)) return null
  const questions: Question[] = []
  for (const q of o.questions) {
    if (!q || typeof q !== 'object') return null
    const expr = parseQuestionExpr(q)
    if (!expr) return null
    if (!Number.isInteger(q.answer)) return null
    questions.push({ expr, answer: q.answer })
  }
  if (questions.length !== o.total) return null
  if (o.index >= questions.length && questions.length > 0) return null
  if (o.picked.length !== questions.length) return null
  const picked = o.picked.map((p) => (typeof p === 'string' ? p : null))
  const misses = parseMisses(o.misses, questions.length)
  const diffId = isDiffId(o.diffId) ? o.diffId : 'easy'
  const preset = extrasForDiff(diffId)
  const termsId = isTermsId(o.termsId) ? o.termsId : preset.termsId
  const legacy = o as { squares?: unknown }
  const powers =
    typeof o.powers === 'boolean'
      ? o.powers
      : typeof legacy.squares === 'boolean'
        ? legacy.squares
        : preset.powers
  const roots = typeof o.roots === 'boolean' ? o.roots : preset.roots
  const facts = typeof o.facts === 'boolean' ? o.facts : preset.facts
  const parens = typeof o.parens === 'boolean' ? o.parens : preset.parens
  const lengthId = isLengthId(o.lengthId) ? o.lengthId : 'n20'
  const paceId: PaceId = isPaceId(o.paceId) ? o.paceId : 'train'
  const extras = { termsId, powers, roots, facts, parens }
  const storedLimit =
    typeof o.timeLimit === 'number' && Number.isFinite(o.timeLimit)
      ? Math.max(0, Math.floor(o.timeLimit))
      : 0
  const timeLimit =
    paceId === 'timed'
      ? storedLimit > 0
        ? storedLimit
        : timedSecondsFor(lengthId, diffId, extras)
      : 0
  return {
    opId: o.opId,
    diffId,
    termsId,
    powers,
    roots,
    facts,
    parens,
    lengthId,
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
      const parsed = JSON.parse(raw) as { version?: number; board?: unknown; seconds?: unknown }
      if (parsed.version === 2 || parsed.version === 1) {
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
    const legacy = localStorage.getItem('mental-math.game.v1')
    if (legacy) {
      const parsed = JSON.parse(legacy) as {
        version?: number
        board?: unknown
        seconds?: unknown
      }
      const board = parseBoard(parsed.board)
      if (board) {
        return {
          board,
          seconds:
            typeof parsed.seconds === 'number'
              ? Math.max(0, Math.floor(parsed.seconds))
              : 0
        }
      }
    }
  } catch {
    /* ignore */
  }
  return { board: emptyBoard(), seconds: 0 }
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
