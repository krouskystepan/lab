import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import {
  type CatalogEntry,
  entriesByKind,
  hubTheme
} from '../catalog/registry'
import { useI18n } from '../i18n'
import { CatalogSection } from '../shell/CatalogSection'
import { LangSwitch } from '../shell/LangSwitch'
import { ThemeScope } from '../shell/ThemeScope'

function matchesQuery(
  entry: CatalogEntry,
  q: string,
  t: (key: CatalogEntry['titleKey']) => string
): boolean {
  if (!q) return true
  const haystack = [
    entry.id,
    entry.kind,
    t(entry.titleKey),
    t(entry.blurbKey)
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function HomePage() {
  const { t, locale } = useI18n()
  const { hash } = useLocation()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const games = useMemo(
    () => entriesByKind('game').filter((e) => matchesQuery(e, q, t)),
    [q, t]
  )
  const solvers = useMemo(
    () => entriesByKind('solver').filter((e) => matchesQuery(e, q, t)),
    [q, t]
  )
  const empty = games.length === 0 && solvers.length === 0

  useEffect(() => {
    document.title = t('hub.brand')
  }, [t, locale])

  useEffect(() => {
    const id = hash.replace(/^#/, '')
    if (id !== 'games' && id !== 'solvers') return
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, empty])

  return (
    <ThemeScope theme={hubTheme} className="flex min-h-0 w-full flex-1 flex-col">
      <div className="hub-page mx-auto flex w-full max-w-5xl flex-1 flex-col gap-7 px-5 pt-7 pb-8 sm:px-8 sm:pt-9">
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex flex-col gap-2">
              <p className="hub-kicker">{t('hub.eyebrow')}</p>
              <h1 className="m-0 text-[1.65rem] font-semibold leading-none tracking-[-0.04em] text-ink sm:text-[1.85rem]">
                {t('hub.brand')}
              </h1>
              <p className="m-0 max-w-md text-[0.95rem] leading-snug text-muted">
                {t('hub.tagline')}
              </p>
            </div>
            <LangSwitch />
          </div>
          <div className="hub-rule" aria-hidden />
        </header>

        <label className="flex items-center gap-2.5 border border-line bg-elevated px-3 py-2.5 focus-within:border-ink/35">
          <Search
            className="h-3.5 w-3.5 shrink-0 text-muted"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('hub.search')}
            aria-label={t('hub.search')}
            className="min-w-0 flex-1 appearance-none bg-transparent font-mono text-[0.82rem] tracking-wide text-ink outline-none placeholder:text-muted/80"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        {empty ? (
          <p className="m-0 font-mono text-[0.82rem] text-muted">
            {t('hub.searchEmpty')}
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            <CatalogSection
              id="games"
              title={t('hub.games')}
              entries={games}
              expandAll={q.length > 0}
            />
            <CatalogSection
              id="solvers"
              title={t('hub.solvers')}
              entries={solvers}
              expandAll={q.length > 0}
            />
          </div>
        )}
      </div>
    </ThemeScope>
  )
}
