import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from 'react'
import { detectLocale, persistLocale, type Locale } from './locale'
import {
  getLocale,
  setLocale as setLocaleCore,
  subscribeLocale,
  t as tCore,
  type MessageKey
} from './messages'
import type { Vars } from './locale'

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function subscribe(cb: () => void) {
  return subscribeLocale(cb)
}

function getSnapshot() {
  return getLocale()
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, detectLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleCore(next)
    persistLocale(next)
    document.documentElement.lang = next
  }, [])

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => tCore(key, vars),
    [locale]
  )

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

/** Init module locale before first render (call from main). */
export function initI18n(): Locale {
  const locale = detectLocale()
  setLocaleCore(locale)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
  return locale
}

export { tCore as t }
export type { MessageKey, Locale }
