import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react'
import { CircleHelp } from 'lucide-react'
import { cn } from '../../../shared/lib/cn'
import { LEGEND_TITLE_CLASS } from './LegendMark'

interface LegendTipProps {
  label: string
  swatchClass: string
  swatchContent?: ReactNode
  title: ReactNode
  children: ReactNode
  /** Wider popover for longer help (e.g. Interesting vs Safest). */
  wide?: boolean
  /** Stack children as separate blocks (not one inline paragraph). */
  stacked?: boolean
  /** Override default title color from swatchClass (e.g. when title is already colored). */
  titleClassName?: string
}

const SWATCH_VARIANTS: Record<string, string> = {
  mine: 'h-[1.15rem] w-[1.15rem] rounded font-mono text-[0.62rem] font-bold text-[#eef3ff] bg-[#2a4580] border-mine shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-mine)_35%,transparent)]',
  opp: 'h-[1.15rem] w-[1.15rem] rounded bg-[color-mix(in_srgb,var(--color-opp)_28%,#2a2218)] border-[color-mix(in_srgb,var(--color-opp)_70%,var(--color-line))] text-[color-mix(in_srgb,var(--color-opp)_92%,white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-opp)_40%,transparent)]',
  info: 'h-[1.15rem] w-[1.15rem] rounded font-mono text-[0.62rem] font-bold text-[#e8fffc] bg-[#0f4a48] border-info shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-info)_40%,transparent)]',
  flag: 'h-[1.15rem] w-[1.15rem] rounded bg-[color-mix(in_srgb,var(--color-flag)_22%,#2a1520)] border-[color-mix(in_srgb,var(--color-flag)_65%,var(--color-line))] text-flag shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-flag)_35%,transparent)]',
  hint: 'h-[1.15rem] w-[1.15rem] rounded border border-dashed border-[color-mix(in_srgb,var(--color-mine)_55%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-mine)_18%,var(--color-cell))] text-[#c8d6ff]',
  blank:
    'h-[1.15rem] w-[1.15rem] rounded font-mono text-[0.62rem] font-bold text-[#c5ced8] bg-[#4a5360] border-[#6a7585] shadow-[inset_0_0_0_1px_color-mix(in_srgb,#5c6775_40%,transparent)]',
  sure: 'bg-[rgba(45,180,110,0.92)] border-[rgba(45,180,110,0.95)]',
  chance: 'bg-[linear-gradient(90deg,transparent,rgba(45,180,110,0.95))]',
  best: 'bg-[rgba(45,180,110,0.7)] border border-best shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-best)_55%,transparent)]',
  safest:
    'bg-[rgba(45,180,110,0.7)] border border-safest shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-safest)_55%,transparent)]',
  unclued:
    'bg-[rgba(45,180,110,0.7)] border border-unclued shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-unclued)_55%,transparent)]',
  /** Orange / yellow / cyan - pick order of the three rings */
  vs: '!h-[0.7rem] !w-[0.7rem] !border-0 !shadow-none overflow-hidden bg-[linear-gradient(90deg,var(--color-safest)_0_33%,var(--color-best)_33%_66%,var(--color-unclued)_66%_100%)]'
}

const EDGE_PAD = 8

export function LegendTip({
  label,
  swatchClass,
  swatchContent,
  title,
  children,
  wide = false,
  stacked = false,
  titleClassName
}: LegendTipProps) {
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties | undefined>()
  const rootRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tipId = useId()
  const placed = panelStyle != null

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (
        !rootRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
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

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(undefined)
      return
    }

    const place = () => {
      const root = rootRef.current
      const panel = panelRef.current
      if (!root || !panel) return

      const trigger = root.getBoundingClientRect()
      const width = panel.offsetWidth
      const height = panel.offsetHeight
      const vw = window.innerWidth
      const vh = window.innerHeight

      let left = trigger.left
      let top = trigger.bottom + 6

      if (left + width > vw - EDGE_PAD) {
        left = trigger.right - width
      }
      if (left < EDGE_PAD) left = EDGE_PAD
      if (left + width > vw - EDGE_PAD) {
        left = Math.max(EDGE_PAD, vw - EDGE_PAD - width)
      }

      if (top + height > vh - EDGE_PAD) {
        top = trigger.top - height - 6
      }
      if (top < EDGE_PAD) top = EDGE_PAD

      setPanelStyle({
        position: 'fixed',
        top,
        left,
        right: 'auto',
        width: wide
          ? `min(20rem, calc(100vw - ${EDGE_PAD * 2}px))`
          : `min(16.5rem, calc(100vw - ${EDGE_PAD * 2}px))`,
        visibility: 'visible'
      })
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, wide])

  return (
    <span className="relative inline-flex items-center" ref={rootRef}>
      <button
        type="button"
        className={cn(
          'group m-0 inline-flex cursor-pointer appearance-none items-center gap-[0.3rem] border-none bg-transparent p-0 font-[inherit] text-inherit',
          open ? 'text-ink' : 'hover:text-ink'
        )}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => setOpen((v) => !v)}
      >
        <i
          className={cn(
            'inline-flex h-[0.7rem] w-[0.7rem] items-center justify-center rounded-[3px] border border-line not-italic leading-none',
            SWATCH_VARIANTS[swatchClass] ?? swatchClass
          )}
          aria-hidden
        >
          {swatchContent}
        </i>
        {label}
        <CircleHelp
          className={cn(
            'block h-[0.9rem] w-[0.9rem] shrink-0 text-muted group-hover:text-accent',
            open && 'text-accent'
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={tipId}
          ref={panelRef}
          className={cn(
            'z-50 w-[min(20rem,calc(100vw-1rem))] rounded-sm border border-line bg-elevated px-2.5 py-2 text-ink shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]',
            !wide && 'w-[min(16.5rem,calc(100vw-1rem))]',
            !placed && 'invisible absolute top-[calc(100%+0.4rem)] left-0'
          )}
          style={panelStyle}
          role="note"
        >
          {typeof children === 'string' || !stacked ? (
            <>
              <strong
                className={cn(
                  'mb-1.5 block text-[0.78rem] font-bold',
                  titleClassName ?? LEGEND_TITLE_CLASS[swatchClass]
                )}
              >
                {title}
              </strong>
              <p className="m-0 wrap-break-word text-[0.72rem] font-medium leading-[1.45] text-muted">
                {children}
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-1 wrap-break-word text-[0.72rem] font-medium leading-[1.45] text-muted">
              <strong
                className={cn(
                  'block text-[0.78rem] font-bold leading-[1.3]',
                  titleClassName ?? LEGEND_TITLE_CLASS[swatchClass]
                )}
              >
                {title}
              </strong>
              <div className="flex flex-col gap-2.5">{children}</div>
            </div>
          )}
        </div>
      )}
    </span>
  )
}
