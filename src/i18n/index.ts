export {
  t,
  getLocale,
  setLocale,
  subscribeLocale,
  minesWord,
  targetsWord,
  emptyNeighborsWord,
  neighborsWord,
  valMinesWord,
  valNeighborsWord,
  type MessageKey,
  type Locale
} from './messages'
export { I18nProvider, useI18n, initI18n } from './I18nProvider'
export type { Vars } from './locale'
export { detectLocale, persistLocale } from './locale'
export { LOCALES, catalogs } from './catalogs'
