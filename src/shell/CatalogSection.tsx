import { useMemo, useState } from 'react'
import type { CatalogEntry } from '../catalog/registry'
import { useI18n } from '../i18n'
import { CatalogCard } from './CatalogCard'

const SOON_PREVIEW = 4

type CatalogSectionProps = {
  id?: string
  title: string
  entries: CatalogEntry[]
  /** When true (e.g. active search), show every match. */
  expandAll?: boolean
}

export function CatalogSection({
  id,
  title,
  entries,
  expandAll = false
}: CatalogSectionProps) {
  const { t } = useI18n()
  const [showMore, setShowMore] = useState(false)

  const { visible, hiddenSoonCount } = useMemo(() => {
    const live = entries.filter((e) => e.status === 'live')
    const soon = entries.filter((e) => e.status === 'soon')

    if (expandAll || showMore || soon.length <= SOON_PREVIEW) {
      return { visible: entries, hiddenSoonCount: 0 }
    }

    return {
      visible: [...live, ...soon.slice(0, SOON_PREVIEW)],
      hiddenSoonCount: soon.length - SOON_PREVIEW
    }
  }, [entries, expandAll, showMore])

  if (entries.length === 0) return null

  return (
    <section id={id} className="flex scroll-mt-4 flex-col gap-1.5">
      <h2 className="m-0 text-[0.85rem] font-medium text-muted">{title}</h2>
      <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((entry) => (
          <li key={entry.id} className="min-w-0">
            <CatalogCard entry={entry} />
          </li>
        ))}
      </ul>
      {!expandAll && (hiddenSoonCount > 0 || showMore) ? (
        <button
          type="button"
          className="mt-0.5 cursor-pointer appearance-none self-start border-0 bg-transparent px-0 py-1 text-[0.8rem] font-medium text-muted hover:text-ink"
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore
            ? t('hub.showLess')
            : t('hub.showMore', { count: hiddenSoonCount })}
        </button>
      ) : null}
    </section>
  )
}
