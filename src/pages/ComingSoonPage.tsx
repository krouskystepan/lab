import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { entryByPath, hubTheme } from '../catalog/registry'
import { useI18n } from '../i18n'
import { ThemeScope } from '../shell/ThemeScope'

/** Placeholder for catalog entries that are not live yet. */
export function ComingSoonPage() {
  const { t, locale } = useI18n()
  const { pathname } = useLocation()
  const entry = entryByPath(pathname)
  const theme = entry?.theme ?? hubTheme
  const title = entry ? t(entry.titleKey) : t('hub.soon')

  useEffect(() => {
    document.title = `${title} · ${t('hub.brand')}`
  }, [t, locale, title])

  return (
    <ThemeScope theme={theme} className="flex h-full min-h-0 flex-col overflow-auto">
      <div className="hub-page mx-auto flex min-h-full max-w-lg flex-col justify-center gap-6 px-5 py-12">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 text-[0.85rem] font-medium text-muted no-underline hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          {t('hub.backHome')}
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[2rem] font-bold tracking-[-0.04em] text-ink">
            {title}
          </h1>
          <p className="m-0 text-[1rem] leading-relaxed text-muted">
            {t('hub.comingSoonBody')}
          </p>
        </div>
      </div>
    </ThemeScope>
  )
}
