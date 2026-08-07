import type { en } from './locales/en'

/** Keys must exist in every language (en merge is the source of truth). */
export type MessageKey = keyof typeof en

/** Add a new language: add `locales/xx/{common,hub,<app>}.ts`, merge in `index.ts`, register in `catalogs.ts`. */
export type Locale = 'en' | 'cs'
