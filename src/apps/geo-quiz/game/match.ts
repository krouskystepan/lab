import type { Country, Question } from './types'

/**
 * Strict 1:1 match after NFC + trim + collapse spaces + case fold.
 * Periods dropped so `U.K.` / `U.S.A.` still hit ISO-style shortcuts.
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

/** ISO 3166-1 exceptionally reserved codes that map to a real alpha-2. */
const ISO_RESERVED: Record<string, string[]> = {
  GB: ['UK'],
  GR: ['EL']
}

/** Extra locale names / abbreviations that are not in the English dataset. */
const EN_EXTRAS: Record<string, string[]> = {
  GB: ['Great Britain']
}

const CS_EXTRAS: Record<string, string[]> = {
  CZ: ['ČR', 'Česko', 'Cesko'],
  GB: ['Velká Británie'],
  US: ['Spojené státy americké']
}

function isShortCode(value: string): boolean {
  const n = normalizeAnswer(value)
  return n.length === 2 || n.length === 3
}

function countryAcceptedNames(country: Country, locale: string): string[] {
  const raw =
    locale === 'cs'
      ? [country.nameCs, country.officialCs, ...(CS_EXTRAS[country.code] ?? [])]
      : [
          country.nameEn,
          country.officialEn,
          ...country.altSpellings,
          ...(EN_EXTRAS[country.code] ?? [])
        ]
  return unique(raw.filter((s) => !isShortCode(s)))
}

export function countryAccepted(country: Country, locale: string): string[] {
  const codes = [country.code, ...(ISO_RESERVED[country.code] ?? [])]
  const shortExtras = (
    locale === 'cs' ? (CS_EXTRAS[country.code] ?? []) : []
  ).filter(isShortCode)
  return unique([
    ...countryAcceptedNames(country, locale),
    ...codes,
    ...shortExtras
  ])
}

export function capitalAccepted(country: Country): string[] {
  return unique([country.capital])
}

export function typedIsCorrect(
  question: Question,
  typed: string,
  locale: string,
  country: Country | undefined,
  live = false
): boolean {
  if (!country) return false
  const got = normalizeAnswer(typed)
  if (!got) return false
  const pool = isCapitalQuestion(question.kind)
    ? capitalAccepted(country)
    : live
      ? countryAcceptedNames(country, locale)
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
