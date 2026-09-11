import {
  CELL_ASPECTS,
  MAX_GRID,
  MIN_GRID,
  PRESETS,
  type CellAspect
} from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'
import { ctrl, ctrlActive, ctrlInput } from './ctrl'

interface SizeBarProps {
  width: number
  height: number
  cellAspect: CellAspect
  onSizeChange: (width: number, height: number) => void
  onCellAspectChange: (aspect: CellAspect) => void
}

export function SizeBar({
  width,
  height,
  cellAspect,
  onSizeChange,
  onCellAspectChange
}: SizeBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('mirrorHelper.size.title')}
      headerRight={
        <HelpTip title={t('mirrorHelper.size.helpTitle')}>
          <p className="m-0">{t('mirrorHelper.size.helpBody')}</p>
        </HelpTip>
      }
      className="h-full"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={cn(
              ctrl,
              width === p.width && height === p.height && ctrlActive
            )}
            onClick={() => onSizeChange(p.width, p.height)}
          >
            {p.label}
          </button>
        ))}
        <span className="mx-0.5 hidden h-5 w-px bg-line sm:inline" aria-hidden />
        <label className="inline-flex h-9 items-center gap-1 text-[0.75rem] font-semibold text-muted max-[980px]:h-10">
          <span>{t('mirrorHelper.size.w')}</span>
          <input
            type="number"
            min={MIN_GRID}
            max={MAX_GRID}
            value={width}
            className={ctrlInput}
            onChange={(e) => {
              const w = clamp(Number(e.target.value), MIN_GRID, MAX_GRID)
              onSizeChange(w, height)
            }}
          />
        </label>
        <span className="text-[0.85rem] text-muted">×</span>
        <label className="inline-flex h-9 items-center gap-1 text-[0.75rem] font-semibold text-muted max-[980px]:h-10">
          <span>{t('mirrorHelper.size.h')}</span>
          <input
            type="number"
            min={MIN_GRID}
            max={MAX_GRID}
            value={height}
            className={ctrlInput}
            onChange={(e) => {
              const h = clamp(Number(e.target.value), MIN_GRID, MAX_GRID)
              onSizeChange(width, h)
            }}
          />
        </label>
        <span className="mx-0.5 hidden h-5 w-px bg-line sm:inline" aria-hidden />
        {CELL_ASPECTS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={cn(ctrl, cellAspect === a.id && ctrlActive)}
            onClick={() => onCellAspectChange(a.id)}
            title={
              a.id === 'card'
                ? t('mirrorHelper.size.cardTitle')
                : t('mirrorHelper.size.squareTitle')
            }
          >
            {a.id === 'card'
              ? t('mirrorHelper.size.card')
              : t('mirrorHelper.size.square')}
          </button>
        ))}
      </div>
    </GamePanel>
  )
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, Math.floor(n)))
}
