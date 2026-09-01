export type ModeId = 'mix' | 'flags' | 'capitals'
export type GroupId =
  | 'world'
  | 'europe'
  | 'americas'
  | 'asia'
  | 'africa'
  | 'oceania'
export type AnswerId = 'choice' | 'type'
export type PaceId = 'train' | 'timed'
export type GameStatus = 'ready' | 'playing' | 'revealed' | 'won' | 'lost'
export type QuestionKind =
  | 'flagToCountry'
  | 'countryToCapital'
  | 'capitalToCountry'
  | 'flagToCapital'

export type Country = {
  code: string
  cca3: string
  nameEn: string
  nameCs: string
  officialEn: string
  officialCs: string
  altSpellings: string[]
  capital: string
  region: string
  area: number
  independent: boolean
}

export type Question = {
  kind: QuestionKind
  subject: string
  choices: string[]
}

export type BoardState = {
  modeId: ModeId
  groupId: GroupId
  answerId: AnswerId
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
  | { type: 'pick'; code: string; fromType?: boolean; typed?: string }
  | { type: 'goto'; index: number }
  | { type: 'timeUp' }

export const MODE_IDS: ModeId[] = ['mix', 'flags', 'capitals']
export const GROUP_IDS: GroupId[] = [
  'world',
  'europe',
  'americas',
  'asia',
  'africa',
  'oceania'
]
export const ANSWER_IDS: AnswerId[] = ['choice', 'type']

export function isModeId(v: unknown): v is ModeId {
  return v === 'mix' || v === 'flags' || v === 'capitals'
}

/** Old saves used a redundant `countries` topic (flag/capital → country). */
export function parseModeId(v: unknown): ModeId | null {
  if (v === 'countries') return 'mix'
  return isModeId(v) ? v : null
}

export function isGroupId(v: unknown): v is GroupId {
  return (
    v === 'world' ||
    v === 'europe' ||
    v === 'americas' ||
    v === 'asia' ||
    v === 'africa' ||
    v === 'oceania'
  )
}

export function isAnswerId(v: unknown): v is AnswerId {
  return v === 'choice' || v === 'type'
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

export function isQuestionKind(v: unknown): v is QuestionKind {
  return (
    v === 'flagToCountry' ||
    v === 'countryToCapital' ||
    v === 'capitalToCountry' ||
    v === 'flagToCapital'
  )
}
