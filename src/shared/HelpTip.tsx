import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp } from 'lucide-react'
import { useI18n } from '../i18n'
import { cn } from './lib/cn'

type HelpTipProps = {
  title: string
  children: ReactNode
  /** Align popover to the end (e.g. last control near the edge). */
  alignEnd?: boolean
  /**
   * `desktop` - hidden below 981px (default; mobile uses MobileHelpCard).
   * `always` - show on all breakpoints (e.g. inside MobileHelpCard).
   */
  show?: 'desktop' | 'always'
}

type TipPos = { top: number; left: number }

/**
 * Compact help popover. Portaled to document.body so parent
 * overflow-hidden panels (DiffBar, ToolsBar, app shell) never clip it.
 */
export function HelpTip({
  title,
  children,
  alignEnd = false,
  show = 'desktop'
}: HelpTipProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<TipPos | null>(null)
  const rootRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const tipId = useId()

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPos(null)
      return
    }

    const place = () => {
      const btn = rootRef.current
      const tip = tipRef.current
      if (!btn) return
      const r = btn.getBoundingClientRect()
      const tipW = tip?.offsetWidth ?? Math.min(288, window.innerWidth * 0.75)
      const tipH = tip?.offsetHeight ?? 80
      const gap = 6
      const pad = 8

      let left = alignEnd ? r.right - tipW : r.left
      left = Math.max(pad, Math.min(left, window.innerWidth - tipW - pad))

      // Prefer above the button; flip below if clipped.
      let top = r.top - tipH - gap
      if (top < pad) {
        top = r.bottom + gap
      }
      top = Math.max(pad, Math.min(top, window.innerHeight - tipH - pad))

      setPos({ top, left })
    }

    place()
    // Re-measure once tip is mounted with real size
    requestAnimationFrame(place)

    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, alignEnd])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (tipRef.current?.contains(t)) return
      setOpen(false)
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
        'relative z-1 inline-flex shrink-0 items-center leading-none',
        show === 'desktop' && 'max-[980px]:hidden',
        open && 'z-60'
      )}
      ref={rootRef}
    >
      <button
        type="button"
        className={cn(
          'm-0 inline-flex size-[0.95rem] shrink-0 cursor-pointer appearance-none items-center justify-center border-none bg-transparent p-0 leading-none text-muted hover:text-accent',
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
      {open &&
        createPortal(
          <div
            ref={tipRef}
            id={tipId}
            className="fixed z-9999 w-[min(18rem,75vw)] rounded-sm border border-line bg-elevated px-2.5 py-2 text-ink shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]"
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
              zIndex: 9999
            }}
            role="note"
          >
            <strong className="mb-1 block text-[0.78rem] font-bold">
              {title}
            </strong>
            <div className="m-0 text-[0.72rem] font-medium leading-[1.4] text-muted">
              {children}
            </div>
          </div>,
          document.body
        )}
    </span>
  )
}
