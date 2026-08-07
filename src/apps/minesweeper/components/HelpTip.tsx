import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { CircleHelp } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

type HelpTipProps = {
  title: string
  children: ReactNode
  alignEnd?: boolean
}

/** Compact help popover (same pattern as Mine Helper). */
export function HelpTip({ title, children, alignEnd = false }: HelpTipProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const tipId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span
      className={cn(
        'relative z-1 inline-flex h-[1.85rem] shrink-0 items-center self-center leading-none',
        open && 'z-60'
      )}
      ref={rootRef}
    >
      <button
        type="button"
        className={cn(
          'm-0 inline-flex size-[1.1rem] shrink-0 cursor-pointer appearance-none items-center justify-center border-none bg-transparent p-0 leading-none text-muted hover:text-accent',
          open && 'text-accent'
        )}
        aria-expanded={open}
        aria-controls={tipId}
        aria-label={t('help.about', { title })}
        title={title}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <CircleHelp
          className="block size-full"
          strokeWidth={2.25}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={tipId}
          className={cn(
            'absolute bottom-[calc(100%+0.35rem)] z-50 w-[min(18rem,75vw)] rounded-sm border border-line bg-elevated px-2.5 py-2 text-ink shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]',
            alignEnd ? 'right-0 left-auto' : 'left-0'
          )}
          role="note"
        >
          <strong className="mb-1 block text-[0.78rem] font-bold">{title}</strong>
          <div className="m-0 text-[0.72rem] font-medium leading-[1.4] text-muted">
            {children}
          </div>
        </div>
      )}
    </span>
  )
}
