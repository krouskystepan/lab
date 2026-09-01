import { byCode } from './catalog'
import type {
  BoardState,
  Country,
  GroupId,
  ModeId,
  AnswerId,
  Question,
  QuestionKind
} from './types'

const REGION: Record<Exclude<GroupId, 'world'>, string> = {
  europe: 'Europe',
  americas: 'Americas',
  asia: 'Asia',
  africa: 'Africa',
  oceania: 'Oceania'
}

/** Independent states in the group (territories only if that set is too small). */
export function poolFor(countries: Country[], groupId: GroupId): Country[] {
  const scoped = countries.filter((c) => {
    if (c.capital.length === 0) return false
    if (groupId === 'world') return true
    return c.region === REGION[groupId]
  })
  const sovereign = scoped.filter((c) => c.independent)
  return sovereign.length >= 4 ? sovereign : scoped
}

export function createRound(
  countries: Country[],
  modeId: ModeId,
  groupId: GroupId,
  answerId: AnswerId
): BoardState {
  const pool = poolFor(countries, groupId)
  const questions = buildQuestions(pool, modeId)
  const n = questions.length
  return {
    modeId,
    groupId,
    answerId,
    roundId: `gq-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    total: n,
    index: 0,
    score: 0,
    questions,
    picked: Array.from({ length: n }, () => null),
    misses: Array.from({ length: n }, () => []),
    status: n > 0 ? 'playing' : 'ready'
  }
}

export function emptyBoard(
  modeId: ModeId,
  groupId: GroupId = 'world',
  answerId: AnswerId = 'choice'
): BoardState {
  return {
    modeId,
    groupId,
    answerId,
    roundId: 'pending',
    total: 0,
    index: 0,
    score: 0,
    questions: [],
    picked: [],
    misses: [],
    status: 'ready'
  }
}

/** Next open item after `from` (wraps). Null if every item is answered. */
export function nextUnanswered(
  picked: readonly (string | null)[],
  from: number
): number | null {
  const n = picked.length
  if (n === 0) return null
  const start = ((from % n) + n) % n
  for (let s = 1; s <= n; s++) {
    const i = (start + s) % n
    if (picked[i] == null) return i
  }
  return null
}

function buildQuestions(pool: Country[], modeId: ModeId): Question[] {
  const kinds = kindsFor(modeId)
  const subjects = shuffle(pool.map((c) => c.code))
  const map = byCode(pool)
  const questions: Question[] = []
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i]
    const country = map.get(subject)
    if (!country) continue
    const kind = kinds[i % kinds.length]
    const choices = pickChoices(pool, country, subject)
    if (choices.length < 4) continue
    questions.push({
      kind,
      subject,
      choices: shuffle(choices)
    })
  }
  return questions
}

function kindsFor(modeId: ModeId): QuestionKind[] {
  if (modeId === 'flags') return ['flagToCountry']
  if (modeId === 'capitals') return ['countryToCapital', 'capitalToCountry']
  return [
    'flagToCountry',
    'countryToCapital',
    'capitalToCountry',
    'flagToCapital'
  ]
}

function pickChoices(
  pool: Country[],
  subject: Country,
  subjectCode: string
): string[] {
  const sameRegion = pool.filter(
    (c) => c.code !== subjectCode && c.region === subject.region
  )
  const rest = pool.filter(
    (c) => c.code !== subjectCode && c.region !== subject.region
  )
  const distractors: string[] = []
  for (const c of shuffle(sameRegion)) {
    if (distractors.length >= 3) break
    distractors.push(c.code)
  }
  for (const c of shuffle(rest)) {
    if (distractors.length >= 3) break
    distractors.push(c.code)
  }
  if (distractors.length < 3) return []
  return [subjectCode, ...distractors.slice(0, 3)]
}

function shuffle<T>(items: readonly T[]): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
