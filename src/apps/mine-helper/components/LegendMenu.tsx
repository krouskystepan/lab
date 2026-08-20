import { useEffect, useRef, useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { LegendStrip } from './LegendStrip'

type LegendMenuProps = {
  goalMode: GoalMode
}

/** Header button that opens the mark legend on narrow screens. */
export function LegendMenu({ goalMode }: LegendMenuProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        className="inline-flex h-[1.7rem] shrink-0 cursor-pointer appearance-none items-center gap-1 rounded-sm border border-line bg-cell px-[0.45rem] text-[0.68rem] font-bold tracking-[0.04em] text-muted hover:bg-cell-hover hover:text-ink"
        title={t('legend.menuTitle')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <BookOpen className="h-[0.85em] w-[0.85em] shrink-0" aria-hidden />
        <span>{t('legend.menu')}</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-[rgba(8,12,16,0.62)] p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legend-menu-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[min(85dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-md border border-line bg-panel shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
              <h2
                id="legend-menu-title"
                className="m-0 text-[1rem] font-bold tracking-[-0.02em] text-ink"
              >
                {t('legend.menuTitle')}
              </h2>
              <button
                ref={closeRef}
                type="button"
                className="cursor-pointer appearance-none rounded-sm border border-line bg-cell px-2.5 py-[0.35rem] text-[0.75rem] font-bold text-muted hover:bg-cell-hover hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {t('legend.menuClose')}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
              <LegendStrip
                goalMode={goalMode}
                className="flex-col items-stretch gap-y-2.5"
              />
              <p className="mt-3 mb-0 text-[0.7rem] font-medium text-muted">
                {t('legend.menuHint')}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
