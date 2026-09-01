import { byCode } from './catalog'
import type {
  AnswerId,
  BoardState,
  Country,
  GroupId,
  ModeId,
  PaceId,
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

/** UN region is Asia; still counted in the Europe quiz. */
const EUROPE_ALSO = new Set(['TR'])

/** UN region is Europe; counted in the Asia quiz (49-state list). */
const ASIA_ALSO = new Set(['CY'])

/** Dataset omits or unsets `independent` (Kosovo, Taiwan, Palestine). */
const COUNT_AS_INDEPENDENT = new Set(['XK', 'TW', 'PS'])

/** Independent states in the group (territories only if that set is too small). */
export function poolFor(countries: Country[], groupId: GroupId): Country[] {
  const scoped = countries.filter((c) => {
    if (c.capital.length === 0) return false
    if (groupId === 'world') return true
    if (c.region === REGION[groupId]) return true
    if (groupId === 'europe' && EUROPE_ALSO.has(c.code)) return true
    return groupId === 'asia' && ASIA_ALSO.has(c.code)
  })
  const sovereign = scoped.filter(
    (c) => c.independent || COUNT_AS_INDEPENDENT.has(c.code)
  )
  return sovereign.length >= 4 ? sovereign : scoped
}

/**
 * Fixed timed budgets per group.
 * Type is slower than choice, so it gets a longer clock.
 */
export const TIMED_SECONDS: Record<GroupId, number> = {
  oceania: 2 * 60,
  americas: 4 * 60,
  europe: 5 * 60,
  asia: 6 * 60,
  africa: 6 * 60,
  world: 18 * 60
}

export const TIMED_SECONDS_TYPE: Record<GroupId, number> = {
  oceania: 2 * 60,
  americas: 8 * 60,
  europe: 8 * 60,
  asia: 10 * 60,
  africa: 10 * 60,
  world: 22 * 60
}

export function timedSecondsFor(
  groupId: GroupId,
  answerId: AnswerId = 'choice'
): number {
  return answerId === 'type'
    ? TIMED_SECONDS_TYPE[groupId]
    : TIMED_SECONDS[groupId]
}

export function createRound(
  countries: Country[],
  modeId: ModeId,
  groupId: GroupId,
  answerId: AnswerId,
  paceId: PaceId = 'train'
): BoardState {
  const pool = poolFor(countries, groupId)
  const questions = buildQuestions(pool, modeId)
  const n = questions.length
  const timed = paceId === 'timed'
  return {
    modeId,
    groupId,
    answerId,
    paceId: timed ? 'timed' : 'train',
    timeLimit: timed ? timedSecondsFor(groupId, answerId) : 0,
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
  answerId: AnswerId = 'choice',
  paceId: PaceId = 'train'
): BoardState {
  const timed = paceId === 'timed'
  return {
    modeId,
    groupId,
    answerId,
    paceId: timed ? 'timed' : 'train',
    timeLimit: timed ? timedSecondsFor(groupId, answerId) : 0,
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
  if (modeId === 'codes') return ['countryToCode']
  return [
    'flagToCountry',
    'countryToCapital',
    'capitalToCountry',
    'flagToCapital',
    'countryToCode'
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
