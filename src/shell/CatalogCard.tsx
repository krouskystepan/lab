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
    'group flex h-full w-full items-stretch gap-0 border border-line bg-elevated text-left no-underline transition-[border-color,background-color] duration-100',
    soon ? 'cursor-default opacity-50' : 'hover:border-ink/30 hover:bg-panel'
  )

  const body = (
    <>
      <span
        aria-hidden
        className="w-0.75 shrink-0 self-stretch opacity-80 transition-opacity duration-100 group-hover:opacity-100"
        style={{ background: accent }}
      />
      <span className="flex min-w-0 flex-1 items-start gap-3 px-3.5 py-3">
        <Icon
          className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 text-muted transition-colors duration-100 group-hover:text-ink"
          strokeWidth={2}
          aria-hidden
        />
        <span className="min-w-0 flex flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-baseline gap-2 text-[0.95rem] font-semibold leading-tight tracking-[-0.01em] text-ink">
            <span className="truncate" title={title}>
              {title}
            </span>
            {soon ? (
              <span className="shrink-0 font-mono text-[0.65rem] font-medium uppercase tracking-[0.1em] text-muted">
                {t('hub.soon')}
              </span>
            ) : null}
          </span>
          <span
            className="truncate text-[0.78rem] leading-snug text-muted"
            title={blurb}
          >
            {blurb}
          </span>
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
