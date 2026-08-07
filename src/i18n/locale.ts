import type { Locale } from './types'
import { catalogs, defaultLocale, LOCALES } from './catalogs'

export type { Locale }

const STORAGE_KEY = 'helper:locale'

function isLocale(value: string): value is Locale {
  return value in catalogs
}

export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isLocale(saved)) return saved
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
  const lower = nav.toLowerCase()
  for (const locale of LOCALES) {
    if (locale === defaultLocale) continue
    if (lower === locale || lower.startsWith(`${locale}-`)) return locale
  }
  return defaultLocale
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export type Vars = Record<string, string | number | boolean | undefined>

/** Simple `{name}` interpolation. */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key]
    return v === undefined || v === null ? '' : String(v)
  })
}

/** English plural: 1 → one, else many */
export function enPlural(n: number, one: string, many: string): string {
  return Math.abs(n) === 1 ? one : many
}

/** Czech plural: 1 → one, 2–4 → few, else many */
export function csPlural(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  const a = Math.abs(n)
  if (a === 1) return one
  if (a >= 2 && a <= 4) return few
  return many
}
