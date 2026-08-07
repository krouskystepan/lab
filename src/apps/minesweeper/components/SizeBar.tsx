import {
  MAX_GRID,
  MIN_GRID,
  PRESETS,
  clampGrid,
  clampMines,
  maxMinesFor
} from '../game/presets'
import type { DiffId } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell px-2 py-1.5 text-sm font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] max-[720px]:min-h-[2.35rem] max-[720px]:px-[0.55rem] max-[720px]:py-1.5 max-[720px]:text-[0.9rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const panel =
  'flex min-w-0 flex-col gap-2 rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-[0.45rem]'

const panelTitle =
  'm-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden'

const input =
  'w-[3.4rem] rounded-md border border-line bg-cell px-[0.35rem] py-[0.3rem] font-mono text-[0.82rem] font-medium focus:outline focus:outline-offset-1 focus:outline-accent/70'

type SizeBarProps = {
  width: number
  height: number
  mines: number
  onSizeChange: (width: number, height: number) => void
  onMinesChange: (mines: number) => void
  onClassic: (id: DiffId) => void
}

/** Same shape as Mine Helper SizeBar: title + 2 rows. */
export function SizeBar({
  width,
  height,
  mines,
  onSizeChange,
  onMinesChange,
  onClassic
}: SizeBarProps) {
  const { t } = useI18n()

  return (
    <section className={panel}>
      <h2 className={panelTitle}>{t('minesweeper.size.title')}</h2>

      {/* Row 1: classic sizes stretch (like Helper presets) */}
      <div className="flex flex-nowrap items-center gap-[0.35rem]">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              btn,
              'min-w-0 flex-1 font-mono text-[0.78rem]',
              width === p.width && height === p.height && btnActive
            )}
            title={t('minesweeper.size.classicTitle', {
              w: String(p.width),
              h: String(p.height),
              mines: String(p.mines)
            })}
            onClick={() => onClassic(p.id)}
          >
            {p.width}×{p.height}
          </button>
        ))}
      </div>

      {/* Row 2: W×H×Mines (like Helper custom size row) */}
      <div className="flex flex-nowrap items-center gap-[0.45rem]">
        <label className="flex items-center gap-[0.3rem] text-[0.8rem] font-semibold text-muted">
          <span>{t('minesweeper.size.w')}</span>
          <input
            type="number"
            min={MIN_GRID}
            max={MAX_GRID}
            value={width}
            className={input}
            aria-label={t('minesweeper.size.wAria')}
            onChange={(e) => {
              onSizeChange(clampGrid(Number(e.target.value)), height)
            }}
          />
        </label>
        <span className="text-[0.85rem] text-muted">×</span>
        <label className="flex items-center gap-[0.3rem] text-[0.8rem] font-semibold text-muted">
          <span>{t('minesweeper.size.h')}</span>
          <input
            type="number"
            min={MIN_GRID}
            max={MAX_GRID}
            value={height}
            className={input}
            aria-label={t('minesweeper.size.hAria')}
            onChange={(e) => {
              onSizeChange(width, clampGrid(Number(e.target.value)))
            }}
          />
        </label>
        <label className="flex items-center gap-[0.3rem] text-[0.8rem] font-semibold text-muted">
          <span>{t('minesweeper.mines')}</span>
          <input
            type="number"
            min={1}
            max={maxMinesFor(width, height)}
            value={mines}
            className={cn(input, 'w-[3.8rem]')}
            aria-label={t('minesweeper.minesLeft')}
            onChange={(e) => {
              onMinesChange(clampMines(Number(e.target.value), width, height))
            }}
          />
        </label>
        <HelpTip title={t('minesweeper.size.helpTitle')}>
          <p className="m-0">{t('minesweeper.size.helpBody')}</p>
        </HelpTip>
      </div>
    </section>
  )
}
