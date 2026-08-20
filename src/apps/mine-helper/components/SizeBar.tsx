import { CELL_ASPECTS, MAX_GRID, MIN_GRID, PRESETS, type CellAspect } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

export type GridEdge = 'left' | 'right' | 'top' | 'bottom'

interface SizeBarProps {
  width: number
  height: number
  cellAspect: CellAspect
  onSizeChange: (width: number, height: number) => void
  onCellAspectChange: (aspect: CellAspect) => void
}

const MIN = MIN_GRID
const MAX = MAX_GRID

const panel =
  'game-panel flex h-full min-w-0 flex-col gap-2 overflow-visible border border-line bg-panel shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]'

const panelTitle =
  'm-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden'

const btn =
  'game-panel-btn cursor-pointer appearance-none border border-line bg-cell px-2 py-1.5 text-sm font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] max-[720px]:min-h-[2.35rem] max-[720px]:px-[0.55rem] max-[720px]:py-1.5 max-[720px]:text-[0.9rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

export function SizeBar({
  width,
  height,
  cellAspect,
  onSizeChange,
  onCellAspectChange
}: SizeBarProps) {
  const { t } = useI18n()

  return (
    <section className={panel}>
      <h2 className={panelTitle}>{t('size.title')}</h2>
      {/* Row 1: presets stretch / wrap */}
      <div className="flex flex-wrap items-center gap-[0.35rem]">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={cn(
              btn,
              'min-w-0 flex-1 basis-18',
              width === p.width && height === p.height && btnActive
            )}
            onClick={() => onSizeChange(p.width, p.height)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Row 2: custom size + field aspect — wraps when tight */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex flex-wrap items-center gap-[0.45rem]">
          <label className="flex items-center gap-[0.3rem] text-[0.8rem] font-semibold text-muted">
            <span>{t('size.w')}</span>
            <input
              type="number"
              min={MIN}
              max={MAX}
              value={width}
              className="w-[3.4rem] rounded-md border border-line bg-cell px-[0.35rem] py-[0.3rem] font-mono text-[0.82rem] font-medium focus:outline focus:outline-offset-1 focus:outline-accent/70"
              onChange={(e) => {
                const w = clamp(Number(e.target.value), MIN, MAX)
                onSizeChange(w, height)
              }}
            />
          </label>
          <span className="text-[0.85rem] text-muted">×</span>
          <label className="flex items-center gap-[0.3rem] text-[0.8rem] font-semibold text-muted">
            <span>{t('size.h')}</span>
            <input
              type="number"
              min={MIN}
              max={MAX}
              value={height}
              className="w-[3.4rem] rounded-md border border-line bg-cell px-[0.35rem] py-[0.3rem] font-mono text-[0.82rem] font-medium focus:outline focus:outline-offset-1 focus:outline-accent/70"
              onChange={(e) => {
                const h = clamp(Number(e.target.value), MIN, MAX)
                onSizeChange(width, h)
              }}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-[0.35rem]">
          <span className="whitespace-nowrap text-[0.75rem] font-semibold text-muted">
            {t('size.field')}
          </span>
          {CELL_ASPECTS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={cn(btn, 'shrink-0', cellAspect === a.id && btnActive)}
              onClick={() => onCellAspectChange(a.id)}
              title={
                a.id === 'card' ? t('size.cardTitle') : t('size.squareTitle')
              }
            >
              {a.id === 'card' ? t('size.card') : t('size.square')}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, Math.floor(n)))
}
