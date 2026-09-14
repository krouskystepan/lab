import type { Expr } from './expr'

export type OpId = 'mix' | 'add' | 'sub' | 'mul' | 'div'
export type ArithOp = Exclude<OpId, 'mix'>
export type DiffId = 'easy' | 'medium' | 'hard'
export type TermsId = '2' | '3' | '4'
export type LengthId = 'n20' | 'endless'
export type PaceId = 'train' | 'timed'
export type GameStatus = 'ready' | 'playing' | 'revealed' | 'won' | 'lost'

export type Extras = {
  termsId: TermsId
  powers: boolean
  roots: boolean
  facts: boolean
  parens: boolean
}

export type Question = {
  expr: Expr
  answer: number
}

export type BoardState = {
  opId: OpId
  diffId: DiffId
  termsId: TermsId
  powers: boolean
  roots: boolean
  facts: boolean
  parens: boolean
  lengthId: LengthId
  paceId: PaceId
  timeLimit: number
  roundId: string
  total: number
  index: number
  score: number
  questions: Question[]
  picked: (string | null)[]
  misses: string[][]
  status: GameStatus
}

export type Action =
  | { type: 'newGame'; board: BoardState }
  | { type: 'importBoard'; board: BoardState }
  | { type: 'submit'; value: number; typed: string }
  | { type: 'goto'; index: number }
  | { type: 'timeUp' }

export const OP_IDS: OpId[] = ['mix', 'add', 'sub', 'mul', 'div']
export const DIFF_IDS: DiffId[] = ['easy', 'medium', 'hard']
export const TERMS_IDS: TermsId[] = ['2', '3', '4']
export const LENGTH_IDS: LengthId[] = ['n20', 'endless']

export const ROUND_N = 20

export function isOpId(v: unknown): v is OpId {
  return (
    v === 'mix' || v === 'add' || v === 'sub' || v === 'mul' || v === 'div'
  )
}

export function isArithOp(v: unknown): v is ArithOp {
  return v === 'add' || v === 'sub' || v === 'mul' || v === 'div'
}

export function isDiffId(v: unknown): v is DiffId {
  return v === 'easy' || v === 'medium' || v === 'hard'
}

export function isTermsId(v: unknown): v is TermsId {
  return v === '2' || v === '3' || v === '4'
}

export function isLengthId(v: unknown): v is LengthId {
  return v === 'n20' || v === 'endless'
}

export function isPaceId(v: unknown): v is PaceId {
  return v === 'train' || v === 'timed'
}

export function isOver(status: GameStatus): boolean {
  return status === 'won' || status === 'lost'
}

export function isStatus(v: unknown): v is GameStatus {
  return (
    v === 'ready' ||
    v === 'playing' ||
    v === 'revealed' ||
    v === 'won' ||
    v === 'lost'
  )
}

export function extrasForDiff(diffId: DiffId): Extras {
  if (diffId === 'hard') {
    return {
      termsId: '3',
      powers: true,
      roots: true,
      facts: true,
      parens: true
    }
  }
  if (diffId === 'medium') {
    return {
      termsId: '2',
      powers: true,
      roots: true,
      facts: false,
      parens: false
    }
  }
  return {
    termsId: '2',
    powers: false,
    roots: false,
    facts: false,
    parens: false
  }
}
