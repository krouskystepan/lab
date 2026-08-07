import { Link } from 'react-router-dom'
import type { CatalogEntry } from '../catalog/registry'
import { useI18n } from '../i18n'
import { cn } from '../shared/lib/cn'

type CatalogCardProps = {
  entry: CatalogEntry
}

export function CatalogCard({ entry }: CatalogCardProps) {
  const { t } = useI18n()
  const Icon = entry.icon
  const soon = entry.status === 'soon'
  const title = t(entry.titleKey)
  const blurb = t(entry.blurbKey)
  const { accent } = entry.theme

  const label = soon
    ? `${title} - ${t('hub.soon')}. ${blurb}`
    : `${title}. ${blurb}`

  const className = cn(
    'flex h-full w-full items-center gap-3 border border-line bg-elevated px-3.5 py-3 text-left no-underline',
    soon ? 'cursor-default opacity-50' : 'hover:bg-panel hover:border-muted/50'
  )

  const body = (
    <>
      <Icon
        className="h-5 w-5 shrink-0"
        strokeWidth={2.25}
        style={{ color: accent }}
        aria-hidden
      />
      <span className="min-w-0 flex flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-baseline gap-1.5 text-[1rem] font-semibold leading-tight text-ink">
          <span className="truncate" title={title}>
            {title}
          </span>
          {soon ? (
            <span className="shrink-0 text-[0.75rem] font-normal text-muted">
              {t('hub.soon')}
            </span>
          ) : null}
        </span>
        <span
          className="truncate text-[0.8rem] leading-snug text-muted"
          title={blurb}
        >
          {blurb}
        </span>
      </span>
    </>
  )

  if (soon) {
    return (
      <div className={className} aria-disabled aria-label={label} title={label}>
        {body}
      </div>
    )
  }

  return (
    <Link
      to={entry.path}
      className={className}
      aria-label={label}
      title={label}
    >
      {body}
    </Link>
  )
}
