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
    <ThemeScope theme={hubTheme} className="flex h-full min-h-0 flex-col overflow-auto">
      <div className="hub-page mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-5 pt-5 pb-6 sm:px-8 sm:pt-6">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] text-ink">
              {t('hub.brand')}
            </h1>
            <p className="m-0 text-[0.85rem] text-muted">{t('hub.tagline')}</p>
          </div>
          <LangSwitch />
        </header>

        <label className="flex items-center gap-2 border border-line bg-elevated px-3 py-2 focus-within:border-muted/60">
          <Search
            className="h-4 w-4 shrink-0 text-muted"
            strokeWidth={2.25}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('hub.search')}
            aria-label={t('hub.search')}
            className="min-w-0 flex-1 appearance-none bg-transparent text-[0.9rem] text-ink outline-none placeholder:text-muted"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        {empty ? (
          <p className="m-0 text-[0.9rem] text-muted">{t('hub.searchEmpty')}</p>
        ) : (
          <div className="flex flex-col gap-5">
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
