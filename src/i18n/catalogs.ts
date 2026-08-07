import type { Locale } from './types'
import { en } from './locales/en'
import { cs } from './locales/cs'
import type { MessageKey } from './types'

export type Catalog = Record<MessageKey, string>

/**
 * Register new languages here.
 * 1. Add matching files under `locales/xx/` (+ each app’s `i18n/xx.ts`)
 * 2. Import and put them in this map
 * 3. Extend `Locale` in `types.ts`
 *
 * App strings live as `locales/<lang>/<app>.ts` (e.g. `mine-helper.ts`).
 * Shared hub/common strings live as `locales/<lang>/hub.ts` and `common.ts`.
 */
export const catalogs: Record<Locale, Catalog> = {
  en: en as Catalog,
  cs
}

export const LOCALES: Locale[] = Object.keys(catalogs) as Locale[]

export const defaultLocale: Locale = 'en'
