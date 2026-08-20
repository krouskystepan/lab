import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  FlipHorizontal2,
  FlipVertical2,
  Minus,
  Plus,
  Scissors
} from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { gameBtn, gamePanel } from '../../../shared/gameUi'
import { MAX_GRID, MIN_GRID } from '../solver/types'
import type { GridEdge } from './SizeBar'

const MIN = MIN_GRID
const MAX = MAX_GRID

type MenuId = 'edges' | 'shift' | 'flip' | null

interface BoardToolsProps {
  width: number
  height: number
  onPadEdge: (edge: GridEdge, delta: 1 | -1) => void
  onShift: (dx: number, dy: number) => void
  onFlipHorizontal: () => void
  onFlipVertical: () => void
  onTrimEmpty: () => void
}

const EDGES = ['left', 'right', 'top', 'bottom'] as const

const trigger = cn(
  gameBtn,
  'inline-flex w-full min-w-0 items-center justify-center gap-1 whitespace-nowrap px-[0.65rem] py-[0.35rem] text-[0.8rem] text-ink max-[980px]:min-h-[2.45rem]'
)

const triggerOpen = 'border-accent bg-accent/25 text-on-accent'

const menuPanel =
  'absolute bottom-[calc(100%+0.35rem)] left-0 z-20 flex min-w-[9.5rem] flex-col gap-[0.3rem] rounded-sm border border-line bg-elevated px-[0.6rem] py-[0.55rem] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]'

const menuBtn =
  'inline-flex min-w-[1.7rem] cursor-pointer items-center justify-center rounded-md border border-line bg-cell px-1.5 py-[0.22rem] text-[0.78rem] font-semibold leading-[1.1] text-muted hover:bg-cell-hover hover:text-ink disabled:cursor-default disabled:opacity-35'

const chevron = 'h-3.5 w-3.5 shrink-0 opacity-70'

export function BoardTools({
  width,
  height,
  onPadEdge,
  onShift,
  onFlipHorizontal,
  onFlipVertical,
  onTrimEmpty
}: BoardToolsProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState<MenuId>(null)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      const openMenu = rootRef.current?.querySelector('[data-menu-open]')
      if (openMenu && !openMenu.contains(target)) {
        setOpen(null)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = (id: Exclude<MenuId, null>) => {
    setOpen((prev) => (prev === id ? null : id))
  }

  const edgeLabel = (edge: (typeof EDGES)[number]) =>
    t(
      edge === 'left'
        ? 'board.left'
        : edge === 'right'
          ? 'board.right'
          : edge === 'top'
            ? 'board.top'
            : 'board.bottom'
    )

  return (
    <section
      className={cn(
        gamePanel,
        'h-full w-fit max-w-full max-[980px]:w-full'
      )}
      ref={rootRef}
    >
      <h2 className="m-0 shrink-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[980px]:hidden [@media(max-height:700px)]:hidden">
        {t('board.title')}
      </h2>
      <div className="grid w-full min-w-0 grid-cols-2 gap-1.5 min-[700px]:grid-cols-4">
        <div
          className="relative min-w-0"
          data-menu-open={open === 'edges' ? '' : undefined}
        >
            <button
              type="button"
              className={cn(trigger, open === 'edges' && triggerOpen)}
              aria-expanded={open === 'edges'}
              aria-haspopup="true"
              onClick={() => toggle('edges')}
            >
              <span className="truncate">{t('board.addEdges')}</span>
              <ChevronDown className={chevron} aria-hidden />
            </button>
            {open === 'edges' && (
              <div
                className={cn(menuPanel, 'min-w-40')}
                role="group"
                aria-label={t('board.padAria')}
              >
                {EDGES.map((edge) => {
                  const label = edgeLabel(edge)
                  return (
                    <div
                      key={edge}
                      className="flex items-center gap-[0.35rem] text-[0.75rem] font-semibold text-muted"
                    >
                      <span className="min-w-13 flex-1">{label}</span>
                      <button
                        type="button"
                        className={menuBtn}
                        title={t('board.removeEdge', { edge: label })}
                        disabled={
                          edge === 'left' || edge === 'right'
                            ? width <= MIN
                            : height <= MIN
                        }
                        onClick={() => onPadEdge(edge, -1)}
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={menuBtn}
                        title={t('board.addEdge', { edge: label })}
                        disabled={
                          edge === 'left' || edge === 'right'
                            ? width >= MAX
                            : height >= MAX
                        }
                        onClick={() => onPadEdge(edge, 1)}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div
            className="relative min-w-0"
            data-menu-open={open === 'shift' ? '' : undefined}
          >
            <button
              type="button"
              className={cn(trigger, open === 'shift' && triggerOpen)}
              aria-expanded={open === 'shift'}
              aria-haspopup="true"
              onClick={() => toggle('shift')}
            >
              <span className="truncate">{t('board.shift')}</span>
              <ChevronDown className={chevron} aria-hidden />
            </button>
            {open === 'shift' && (
              <div
                className={cn(menuPanel, 'min-w-0 items-center')}
                role="group"
                aria-label={t('board.shiftAria')}
              >
                <button
                  type="button"
                  className={menuBtn}
                  title={t('board.shiftUp')}
                  onClick={() => onShift(0, -1)}
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                </button>
                <div className="flex gap-[0.35rem]">
                  <button
                    type="button"
                    className={menuBtn}
                    title={t('board.shiftLeft')}
                    onClick={() => onShift(-1, 0)}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={menuBtn}
                    title={t('board.shiftRight')}
                    onClick={() => onShift(1, 0)}
                  >
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  className={menuBtn}
                  title={t('board.shiftDown')}
                  onClick={() => onShift(0, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            )}
          </div>

          <div
            className="relative min-w-0"
            data-menu-open={open === 'flip' ? '' : undefined}
          >
            <button
              type="button"
              className={cn(trigger, open === 'flip' && triggerOpen)}
              aria-expanded={open === 'flip'}
              aria-haspopup="true"
              onClick={() => toggle('flip')}
            >
              <span className="truncate">{t('board.flip')}</span>
              <ChevronDown className={chevron} aria-hidden />
            </button>
            {open === 'flip' && (
              <div
                className={cn(menuPanel, 'min-w-32')}
                role="group"
                aria-label={t('board.flipAria')}
              >
                <button
                  type="button"
                  className={cn(
                    menuBtn,
                    'w-full min-w-0 justify-start gap-1.5 px-[0.55rem] py-[0.35rem] text-left text-ink'
                  )}
                  onClick={() => {
                    onFlipHorizontal()
                    setOpen(null)
                  }}
                >
                  <FlipHorizontal2 className="h-3.5 w-3.5" aria-hidden />
                  {t('board.horizontal')}
                </button>
                <button
                  type="button"
                  className={cn(
                    menuBtn,
                    'w-full min-w-0 justify-start gap-1.5 px-[0.55rem] py-[0.35rem] text-left text-ink'
                  )}
                  onClick={() => {
                    onFlipVertical()
                    setOpen(null)
                  }}
                >
                  <FlipVertical2 className="h-3.5 w-3.5" aria-hidden />
                  {t('board.vertical')}
                </button>
              </div>
            )}
          </div>

        <button
          type="button"
          className={cn(trigger, 'gap-1.5')}
          title={t('board.trimTitle')}
          onClick={() => {
            setOpen(null)
            onTrimEmpty()
          }}
        >
          <Scissors className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{t('board.trim')}</span>
        </button>
      </div>
    </section>
  )
}
