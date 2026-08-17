import type { DiffId } from './types'
import list4 from './lists/4.json'
import list5 from './lists/5.json'
import list6 from './lists/6.json'
import list7 from './lists/7.json'

export const WORD_LENS = [4, 5, 6, 7] as const
export type WordLen = (typeof WORD_LENS)[number]
export const DEFAULT_WORD_LEN: WordLen = 5
/** Grid sizing always pretends there are this many rows so tiles don't jump. */
export const LAYOUT_ROWS = 6

type WordListFile = {
  easy: string[]
  medium: string[]
  hard: string[]
  extra?: string[]
}

type Bucket = {
  easy: string[]
  medium: string[]
  hard: string[]
  allowed: Set<string>
}

function sanitize(words: readonly string[], len: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of words) {
    const w = raw.trim().toLowerCase()
    if (w.length !== len || !/^[a-z]+$/.test(w) || seen.has(w)) continue
    seen.add(w)
    out.push(w)
  }
  return out
}

function build(file: WordListFile, len: number): Bucket {
  const easy = sanitize(file.easy, len)
  const easySet = new Set(easy)
  const medium = sanitize(file.medium, len).filter((w) => !easySet.has(w))
  const mediumSet = new Set(medium)
  const hard = sanitize(file.hard, len).filter(
    (w) => !easySet.has(w) && !mediumSet.has(w)
  )
  const extra = sanitize(file.extra ?? [], len)
  const allowed = new Set([...easy, ...medium, ...hard, ...extra])
  return { easy, medium, hard, allowed }
}

const BY_LEN: Record<WordLen, Bucket> = {
  4: build(list4, 4),
  5: build(list5, 5),
  6: build(list6, 6),
  7: build(list7, 7)
}

export function isWordLen(v: unknown): v is WordLen {
  return v === 4 || v === 5 || v === 6 || v === 7
}

export function answersFor(diffId: DiffId, len: WordLen): string[] {
  const b = BY_LEN[len]
  if (diffId === 'easy') return b.easy
  if (diffId === 'medium') return [...b.easy, ...b.medium]
  if (diffId === 'hard') return [...b.medium, ...b.hard]
  if (diffId === 'expert') return b.hard.length > 0 ? b.hard : b.medium
  return [...b.easy, ...b.medium, ...b.hard]
}

export function isAllowedWord(word: string, answer?: string): boolean {
  const w = word.toLowerCase()
  if (!/^[a-z]+$/.test(w)) return false
  if (answer) {
    if (w.length !== answer.length) return false
    if (w === answer.toLowerCase()) return true
  }
  if (!isWordLen(w.length)) return false
  return BY_LEN[w.length].allowed.has(w)
}

export function pickAnswer(pool: string[], avoid?: string): string {
  const opts =
    avoid && pool.length > 1 ? pool.filter((w) => w !== avoid) : pool
  const list = opts.length > 0 ? opts : BY_LEN[DEFAULT_WORD_LEN].easy
  return list[Math.floor(Math.random() * list.length)]
}

export function isWordOfLen(word: string, len: number): boolean {
  return word.length === len && /^[a-z]+$/.test(word)
}
