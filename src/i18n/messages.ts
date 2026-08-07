import {
  csPlural,
  enPlural,
  interpolate,
  type Vars
} from './locale'
import { catalogs, defaultLocale } from './catalogs'
import type { Locale, MessageKey } from './types'

export type { MessageKey, Locale }

let currentLocale: Locale = defaultLocale
let currentCatalog = catalogs[defaultLocale]
const listeners = new Set<() => void>()

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale): void {
  if (!(locale in catalogs)) return
  currentLocale = locale
  currentCatalog = catalogs[locale]
  listeners.forEach((l) => l())
}

export function subscribeLocale(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function t(key: MessageKey, vars?: Vars): string {
  const template =
    currentCatalog[key] ?? catalogs.en[key] ?? String(key)
  return interpolate(template, vars)
}

function plural3(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  if (currentLocale === 'cs') return csPlural(n, one, few, many)
  return enPlural(n, one, many)
}

export function minesWord(n: number): string {
  return plural3(
    n,
    t('ex.word.mine'),
    t('ex.word.minesFew'),
    t('ex.word.mines')
  )
}

/** "mines" in safe mode, "your cards" in hunt mode */
export function targetsWord(n: number, goalMode: 'safe' | 'hunt' = 'safe'): string {
  if (goalMode === 'hunt') {
    return plural3(
      n,
      t('ex.word.target'),
      t('ex.word.targetsFew'),
      t('ex.word.targets')
    )
  }
  return minesWord(n)
}

export function emptyNeighborsWord(n: number): string {
  return plural3(
    n,
    t('ex.word.emptyNeighbor'),
    t('ex.word.emptyNeighborsFew'),
    t('ex.word.emptyNeighbors')
  )
}

export function neighborsWord(n: number): string {
  return plural3(
    n,
    t('ex.word.neighbor'),
    t('ex.word.neighborsFew'),
    t('ex.word.neighbors')
  )
}

export function valMinesWord(n: number): string {
  return plural3(n, t('val.mine'), t('val.minesFew'), t('val.mines'))
}

export function valNeighborsWord(n: number): string {
  return plural3(
    n,
    t('val.neighbor'),
    t('val.neighborsFew'),
    t('val.neighbors')
  )
}
