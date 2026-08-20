import {
  Flag,
  FlagOff,
  Pickaxe,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2
} from 'lucide-react'
import type { GameStatus, PointerMode } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  GamePanel,
  ToolRow,
  gameBtnActive,
  gameToolBtn
} from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

type ToolsBarProps = {
  mode: PointerMode
  minesLeft: number
  seconds: number
  status: GameStatus
  canUndo: boolean
  canRedo: boolean
  canHint: boolean
  hasFlags: boolean
  onModeChange: (mode: PointerMode) => void
  onUndo: () => void
  onRedo: () => void
  onHint: () => void
  onClearFlags: () => void
  onNew: () => void
}

export function ToolsBar({
  mode,
  minesLeft,
  seconds,
  status,
  canUndo,
  canRedo,
  canHint,
  hasFlags,
  onModeChange,
  onUndo,
  onRedo,
  onHint,
  onClearFlags,
  onNew
}: ToolsBarProps) {
  const { t } = useI18n()

  const statusLabel =
    status === 'won'
      ? t('minesweeper.status.won')
      : status === 'lost'
        ? t('minesweeper.status.lost')
        : null

  return (
    <GamePanel
      title={t('minesweeper.tools.title')}
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[0.85rem] font-bold tabular-nums text-ink">
          <span
            title={t('minesweeper.minesLeft')}
            aria-label={t('minesweeper.minesLeft')}
          >
            <span className="text-muted">{t('minesweeper.mines')}</span>{' '}
            {String(minesLeft).padStart(3, '0')}
          </span>
          <span title={t('minesweeper.timer')} aria-label={t('minesweeper.timer')}>
            <span className="text-muted">{t('minesweeper.time')}</span>{' '}
            {formatTime(seconds)}
          </span>
          {statusLabel ? (
            <span
              className={cn(
                'text-[0.8rem] font-bold tracking-wide',
                status === 'won' ? 'text-accent' : 'text-[#ffb0b0]'
              )}
            >
              {statusLabel}
            </span>
          ) : null}
        </div>
      }
    >
      <ToolRow mobileCols={4} desktopCols={8}>
        <button
          type="button"
          className={cn(gameToolBtn, mode === 'dig' && gameBtnActive)}
          aria-pressed={mode === 'dig'}
          title={t('minesweeper.tools.digTitle')}
          onClick={() => onModeChange('dig')}
        >
          <Pickaxe className={iconCls} strokeWidth={2.25} aria-hidden />
          <span className="truncate">{t('minesweeper.tools.dig')}</span>
        </button>
        <button
          type="button"
          className={cn(gameToolBtn, mode === 'flag' && gameBtnActive)}
          aria-pressed={mode === 'flag'}
          title={t('minesweeper.tools.flagTitle')}
          onClick={() => onModeChange('flag')}
        >
          <Flag className={iconCls} strokeWidth={2.25} aria-hidden />
          <span className="truncate">{t('minesweeper.tools.flag')}</span>
        </button>
        <button
          type="button"
          className={gameToolBtn}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('minesweeper.tools.undoTitle')}
        >
          <Undo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('minesweeper.tools.undo')}
          </span>
        </button>
        <button
          type="button"
          className={gameToolBtn}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('minesweeper.tools.redoTitle')}
        >
          <Redo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('minesweeper.tools.redo')}
          </span>
        </button>
        <button
          type="button"
          className={cn(
            gameToolBtn,
            'border-accent bg-accent font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
          )}
          onClick={onHint}
          disabled={!canHint}
          title={t('minesweeper.tools.hintTitle')}
        >
          <Sparkles className={iconCls} aria-hidden />
          <span className="truncate">{t('minesweeper.tools.hint')}</span>
        </button>
        <button
          type="button"
          className={gameToolBtn}
          onClick={onClearFlags}
          disabled={!hasFlags || status === 'won' || status === 'lost'}
          title={t('minesweeper.tools.clearFlagsTitle')}
        >
          <FlagOff className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('minesweeper.tools.clearFlags')}
          </span>
        </button>
        <button
          type="button"
          className={cn(
            gameToolBtn,
            'border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
          )}
          onClick={onNew}
          title={t('minesweeper.newTitle')}
        >
          <RotateCcw className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('minesweeper.new')}
          </span>
        </button>
        <div className="flex min-w-0 items-center justify-center gap-1">
          <HelpTip title={t('minesweeper.help.title')}>
            <p className="m-0 mb-1.5">{t('minesweeper.help.body')}</p>
            <p className="m-0 mb-1.5">{t('minesweeper.help.controls')}</p>
            <p className="m-0 mb-1.5">{t('minesweeper.help.chord')}</p>
            <p className="m-0">{t('minesweeper.help.firstClick')}</p>
          </HelpTip>
          <HelpTip title={t('minesweeper.tools.hintTipTitle')} alignEnd>
            {t('minesweeper.tools.hintTipBody')}
          </HelpTip>
        </div>
      </ToolRow>
    </GamePanel>
  )
}

function formatTime(seconds: number): string {
  const s = Math.min(9999, Math.max(0, Math.floor(seconds)))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m >= 100) return String(s).padStart(4, '0')
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
