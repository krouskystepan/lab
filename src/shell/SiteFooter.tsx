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
    <footer className="mt-auto shrink-0 border-t border-line bg-elevated/90">
      <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <nav aria-label={t('hub.breadcrumb')} className="min-w-0">
          <ol className="m-0 flex list-none items-center gap-1.5 overflow-x-auto p-0 text-[0.75rem]">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1
              return (
                <Fragment key={`${crumb.label}-${i}`}>
                  {i > 0 ? (
                    <li aria-hidden className="shrink-0 text-muted/50">
                      /
                    </li>
                  ) : null}
                  <li className="min-w-0 shrink-0">
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
                            ? 'font-medium text-ink'
                            : 'font-medium text-ink/75'
                        }
                        aria-current={last ? 'page' : undefined}
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
          className="shrink-0 text-[0.75rem] font-medium text-ink/75 no-underline hover:text-ink"
          title={t('author.title')}
        >
          {t('author.by')}
        </a>
      </div>
    </footer>
  )
}
