import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { entryByPath } from '../catalog/registry'
import { useI18n } from '../i18n'

type Crumb = {
  label: string
  to?: string
}

export function SiteFooter() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const entry = entryByPath(pathname)

  const crumbs: Crumb[] = [{ label: t('hub.brand'), to: entry ? '/' : undefined }]

  if (entry) {
    crumbs.push({
      label: entry.kind === 'game' ? t('hub.games') : t('hub.solvers'),
      to: entry.kind === 'game' ? '/#games' : '/#solvers'
    })
    crumbs.push({ label: t(entry.titleKey) })
  }

  return (
    <footer className="relative z-40 w-full shrink-0 border-t border-line bg-elevated/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-2.5">
        <nav aria-label={t('hub.breadcrumb')} className="min-w-0 w-full sm:flex-1">
          <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-0.5 p-0 text-[0.75rem] leading-snug">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1
              return (
                <Fragment key={`${crumb.label}-${i}`}>
                  {i > 0 ? (
                    <li aria-hidden className="shrink-0 text-muted/50">
                      /
                    </li>
                  ) : null}
                  <li className={last ? 'min-w-0' : 'shrink-0'}>
                    {crumb.to && !last ? (
                      <Link
                        to={crumb.to}
                        className="font-medium text-ink/75 no-underline hover:text-ink"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={
                          last
                            ? 'block truncate font-medium text-ink'
                            : 'font-medium text-ink/75'
                        }
                        aria-current={last ? 'page' : undefined}
                        title={last ? crumb.label : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                </Fragment>
              )
            })}
          </ol>
        </nav>
        <a
          href="https://krouskystepan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start text-[0.75rem] font-medium text-ink/75 no-underline hover:text-ink sm:self-auto"
          title={t('author.title')}
        >
          {t('author.by')}
        </a>
      </div>
    </footer>
  )
}
