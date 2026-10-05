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
  moves: number
  crossings: number
  why: string | null
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
  moves,
  crossings,
  why,
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
      title={t('untangle.tools.title')}
      className="h-full"
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[0.85rem] font-bold tabular-nums text-ink">
          <HelpTip title={t('untangle.help.title')}>
            <p className="m-0 mb-1.5">{t('untangle.help.body')}</p>
            <p className="m-0">{t('untangle.help.controls')}</p>
          </HelpTip>
          {why ? (
            <span
              className="max-w-64 truncate font-sans text-[0.72rem] font-medium normal-nums text-muted"
              title={why}
            >
              {why}
            </span>
          ) : null}
          <span title={t('untangle.movesTitle')} aria-label={t('untangle.movesTitle')}>
            <span className="text-muted">{t('untangle.moves')}</span> {moves}
          </span>
          <span
            title={t('untangle.crossingsTitle')}
            aria-label={t('untangle.crossingsTitle')}
          >
            <span className="text-muted">{t('untangle.crossings')}</span> {crossings}
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
          title={t('untangle.tools.undoTitle')}
          aria-label={t('untangle.tools.undo')}
        >
          <Undo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">{t('untangle.tools.undo')}</span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('untangle.tools.redoTitle')}
          aria-label={t('untangle.tools.redo')}
        >
          <Redo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">{t('untangle.tools.redo')}</span>
        </button>
        <div className="flex min-w-0 items-stretch gap-1">
          <button
            type="button"
            className={cn(
              btn,
              'min-w-0 flex-1 border-accent bg-accent font-bold text-on-accent hover:border-accent-hover hover:bg-accent-hover'
            )}
            onClick={onHint}
            disabled={!canHint}
            title={t('untangle.tools.hintTitle')}
          >
            <Sparkles className={iconCls} aria-hidden />
            <span className="truncate max-[980px]:hidden">{t('untangle.tools.hint')}</span>
          </button>
          <HelpTip title={t('untangle.tools.hintTipTitle')} alignEnd>
            {t('untangle.tools.hintTipBody')}
          </HelpTip>
        </div>
        <button
          type="button"
          className={btn}
          onClick={onReset}
          title={t('untangle.resetTitle')}
        >
          <span className="truncate leading-none">{t('untangle.reset')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
          )}
          onClick={onNew}
          title={t('untangle.newTitle')}
        >
          <RotateCcw className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">{t('untangle.new')}</span>
        </button>
      </ToolRow>
    </GamePanel>
  )
}
