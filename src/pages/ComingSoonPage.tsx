import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import {
  catalog,
  entryByPath,
  hubTheme,
  type CatalogEntry
} from '../catalog/registry'
import { useI18n } from '../i18n'
import { cn } from '../shared/lib/cn'
import { LangSwitch } from '../shell/LangSwitch'
import { ThemeScope } from '../shell/ThemeScope'

const RANDOM_COUNT = 6

function pickRandom<T>(items: readonly T[], n: number): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

/** Placeholder for catalog entries that are not live yet, and unknown URLs. */
export function ComingSoonPage() {
  const { t, locale } = useI18n()
  const { pathname } = useLocation()
  const entry = entryByPath(pathname)
  const theme = entry?.theme ?? hubTheme
  const title = entry ? t(entry.titleKey) : t('hub.notFoundTitle')
  const Icon = entry?.icon ?? SearchX
  const alts = useMemo(
    () =>
      pickRandom(
        catalog.filter((e) => e.path !== pathname),
        RANDOM_COUNT
      ),
    [pathname]
  )

  useEffect(() => {
    document.title = `${title} · ${t('hub.brand')}`
  }, [t, locale, title])

  return (
    <ThemeScope theme={theme} className="flex h-full min-h-0 flex-col overflow-auto">
      <div className="hub-page mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-5 pt-5 pb-6 sm:px-8 sm:pt-6">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-3">
          <Link
            to="/"
            className="min-w-0 text-[1.15rem] font-bold tracking-[-0.03em] text-ink no-underline hover:text-accent"
          >
            {t('hub.brand')}
          </Link>
          <LangSwitch />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div className="relative w-full max-w-md">
            <AccentGrid />
            <section className="relative rounded-md border border-line bg-panel px-5 py-5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-[0.68rem] font-semibold tracking-[0.12em] text-muted uppercase">
                  {entry ? t('hub.comingSoonKicker') : t('hub.notFoundCode')}
                </p>
                <Link
                  to="/"
                  className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-accent bg-accent px-2.5 py-1 text-[0.75rem] font-semibold text-white no-underline hover:border-accent-hover hover:bg-accent-hover"
                >
                  <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
                  {t('hub.backHomeCta')}
                </Link>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-accent/35 bg-accent/15 text-accent"
                  aria-hidden
                >
                  <Icon className="size-5" strokeWidth={2.25} />
                </span>
                <h1 className="m-0 min-w-0 text-[1.35rem] font-bold tracking-[-0.04em] text-ink">
                  {title}
                </h1>
              </div>

              <p className="mt-3 mb-0 text-[0.88rem] leading-relaxed text-muted">
                {entry
                  ? `${t(entry.blurbKey)} ${t('hub.comingSoonBody')}`
                  : t('hub.notFoundBody')}
              </p>

              {alts.length > 0 ? (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="m-0 mb-2 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase">
                    {t('hub.playInstead')}
                  </p>
                  <ul className="m-0 grid list-none grid-cols-2 gap-1.5 p-0">
                    {alts.map((alt) => (
                      <li key={alt.id} className="min-w-0">
                        <AltCard entry={alt} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </ThemeScope>
  )
}

function AltCard({ entry }: { entry: CatalogEntry }) {
  const { t } = useI18n()
  const Icon = entry.icon
  const title = t(entry.titleKey)
  const soon = entry.status === 'soon'

  return (
    <Link
      to={entry.path}
      className={cn(
        'flex h-full w-full min-w-0 items-center gap-1.5 border border-line bg-elevated px-2 py-1.5 text-left no-underline hover:border-muted/50 hover:bg-cell-hover',
        soon && 'opacity-55'
      )}
      title={soon ? `${title} — ${t('hub.soon')}` : title}
    >
      <Icon
        className="size-3.5 shrink-0"
        strokeWidth={2.25}
        style={{ color: entry.theme.accent }}
        aria-hidden
      />
      <span className="min-w-0 truncate text-[0.78rem] font-semibold text-ink">
        {title}
      </span>
    </Link>
  )
}

/** Small 5×5 silhouette peeking behind the top-right of the card. */
function AccentGrid() {
  const cells = [
    0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0
  ]
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-8 -right-6 w-36"
    >
      <div className="grid grid-cols-5 gap-0.75 opacity-[0.22]">
        {cells.map((on, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-[3px]',
              on ? 'bg-accent' : 'bg-line'
            )}
          />
        ))}
      </div>
    </div>
  )
}
