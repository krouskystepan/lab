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
import { GamePanel, ToolRow, gameBtnActive, gameToolBtn } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const input =
  'w-[3.4rem] min-h-[2.35rem] rounded-md border border-line bg-cell px-[0.35rem] py-[0.3rem] font-mono text-[0.82rem] font-medium focus:outline focus:outline-offset-1 focus:outline-accent/70 max-[980px]:min-h-[2.5rem]'

type SizeBarProps = {
  width: number
  height: number
  mines: number
  onSizeChange: (width: number, height: number) => void
  onMinesChange: (mines: number) => void
  onClassic: (id: DiffId) => void
}

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
    <GamePanel
      title={t('minesweeper.size.title')}
      headerRight={
        <HelpTip title={t('minesweeper.size.helpTitle')}>
          <p className="m-0">{t('minesweeper.size.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={2} desktopCols={4}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              gameToolBtn,
              'font-mono text-[0.8rem]',
              width === p.width && height === p.height && gameBtnActive
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
      </ToolRow>

      <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
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
      </div>
    </GamePanel>
  )
}
