import { Redo2, RotateCcw, Sparkles, Undo2 } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel, ToolRow, gameBtn } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const btn = cn(
  gameBtn,
  'inline-flex min-w-0 items-center justify-center gap-1 px-1.5 py-1.5 text-[0.8rem] max-[980px]:min-h-[2.5rem]'
)

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0 block'

type ToolsBarProps = {
  seconds: number
  moves: number
  minMoves: number
  canUndo: boolean
  canRedo: boolean
  canHint: boolean
  onUndo: () => void
  onRedo: () => void
  onHint: () => void
  onReset: () => void
  onNew: () => void
}

export function ToolsBar({
  seconds,
  moves,
  minMoves,
  canUndo,
  canRedo,
  canHint,
  onUndo,
  onRedo,
  onHint,
  onReset,
  onNew
}: ToolsBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('lightsOut.tools.title')}
      className="h-full"
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[0.85rem] font-bold tabular-nums text-ink">
          <HelpTip title={t('lightsOut.help.title')}>
            <p className="m-0 mb-1.5">{t('lightsOut.help.body')}</p>
            <p className="m-0">{t('lightsOut.help.controls')}</p>
          </HelpTip>
          <span
            title={t('lightsOut.movesTitle')}
            aria-label={t('lightsOut.movesTitle')}
          >
            <span className="text-muted">{t('lightsOut.moves')}</span>{' '}
            {moves}
            <span className="text-muted">/{minMoves}</span>
          </span>
          <span title={t('lightsOut.timer')} aria-label={t('lightsOut.timer')}>
            <span className="text-muted">{t('lightsOut.time')}</span>{' '}
            {formatTime(seconds)}
          </span>
        </div>
      }
    >
      <ToolRow mobileCols={5} desktopCols={5}>
        <button
          type="button"
          className={btn}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('lightsOut.tools.undoTitle')}
          aria-label={t('lightsOut.tools.undo')}
        >
          <Undo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('lightsOut.tools.undo')}
          </span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('lightsOut.tools.redoTitle')}
          aria-label={t('lightsOut.tools.redo')}
        >
          <Redo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('lightsOut.tools.redo')}
          </span>
        </button>
        <div className="flex min-w-0 items-stretch gap-1">
          <button
            type="button"
            className={cn(
              btn,
              'min-w-0 flex-1 border-accent bg-accent font-bold text-[#1a1808] hover:border-accent-hover hover:bg-accent-hover'
            )}
            onClick={onHint}
            disabled={!canHint}
            title={t('lightsOut.tools.hintTitle')}
          >
            <Sparkles className={iconCls} aria-hidden />
            <span className="truncate max-[980px]:hidden">
              {t('lightsOut.tools.hint')}
            </span>
          </button>
          <HelpTip title={t('lightsOut.tools.hintTipTitle')} alignEnd>
            {t('lightsOut.tools.hintTipBody')}
          </HelpTip>
        </div>
        <button
          type="button"
          className={btn}
          onClick={onReset}
          title={t('lightsOut.resetTitle')}
        >
          <span className="truncate leading-none">{t('lightsOut.reset')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
          )}
          onClick={onNew}
          title={t('lightsOut.newTitle')}
        >
          <RotateCcw className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">{t('lightsOut.new')}</span>
        </button>
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
