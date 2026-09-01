import type { Country, Question } from './types'

/**
 * Strict 1:1 match after NFC + trim + collapse spaces + case fold.
 * Periods dropped so `U.K.` / `U.S.` still hit two-word shortcuts.
 * Diacritics stay (`Cesko` ≠ `Česko`).
 */
export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[.]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function isCapitalQuestion(kind: Question['kind']): boolean {
  return kind === 'countryToCapital' || kind === 'flagToCapital'
}

export function isCodeQuestion(kind: Question['kind']): boolean {
  return kind === 'countryToCode'
}

/** ISO 3166-1 exceptionally reserved codes that map to a real alpha-2. */
const ISO_RESERVED: Record<string, string[]> = {
  GB: ['UK'],
  GR: ['EL']
}

/** Extra locale names that are not in the English dataset. */
const EN_EXTRAS: Record<string, string[]> = {
  GB: ['Great Britain']
}

const CS_EXTRAS: Record<string, string[]> = {
  CZ: ['Česko', 'Cesko'],
  GB: ['Velká Británie'],
  US: ['Spojené státy americké', 'Spojené státy']
}

function isShortToken(value: string): boolean {
  const n = normalizeAnswer(value)
  return n.length === 2 || n.length === 3
}

function wordsOf(value: string): string[] {
  return normalizeAnswer(value)
    .split(' ')
    .filter(Boolean)
}

/** Initials only when the name is exactly two words (`United Kingdom` → `uk`). */
function twoWordShortcut(value: string): string | null {
  const words = wordsOf(value)
  if (words.length !== 2) return null
  const a = words[0]?.[0]
  const b = words[1]?.[0]
  if (!a || !b) return null
  return `${a}${b}`
}

function longNames(country: Country, locale: string): string[] {
  const en = [
    country.nameEn,
    country.officialEn,
    ...country.altSpellings,
    ...(EN_EXTRAS[country.code] ?? [])
  ]
  const cs = [
    country.nameCs,
    country.officialCs,
    ...(CS_EXTRAS[country.code] ?? [])
  ]
  const raw = locale === 'cs' ? [...cs, ...en] : en
  return unique(raw.filter((s) => !isShortToken(s)))
}

function countryShortcuts(country: Country, locale: string): string[] {
  const fromLocale = longNames(country, locale)
  const fromEn = longNames(country, 'en')
  const out: string[] = []
  for (const name of [...fromLocale, ...fromEn]) {
    const short = twoWordShortcut(name)
    if (short) out.push(short)
  }
  return unique(out)
}

export function countryAcceptedNames(country: Country, locale: string): string[] {
  return longNames(country, locale)
}

export function countryAccepted(country: Country, locale: string): string[] {
  return unique([
    ...countryAcceptedNames(country, locale),
    ...countryShortcuts(country, locale)
  ])
}

export function capitalAccepted(country: Country): string[] {
  return unique([country.capital])
}

export function codeAccepted(country: Country): string[] {
  return unique([
    country.code,
    country.cca3,
    ...(ISO_RESERVED[country.code] ?? [])
  ])
}

export function typedIsCorrect(
  question: Question,
  typed: string,
  locale: string,
  country: Country | undefined
): boolean {
  if (!country) return false
  const got = normalizeAnswer(typed)
  if (!got) return false
  const pool = isCodeQuestion(question.kind)
    ? codeAccepted(country)
    : isCapitalQuestion(question.kind)
      ? capitalAccepted(country)
      : countryAccepted(country, locale)
  return pool.some((item) => normalizeAnswer(item) === got)
}

function unique(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of items) {
    const s = raw.trim()
    if (!s) continue
    const key = normalizeAnswer(s)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  return out
}
