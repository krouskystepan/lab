import {
  CircleCheck,
  Eraser,
  Pencil,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2
} from 'lucide-react'
import type { GameStatus, PointerMode } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel, ToolRow, gameBtn, gameBtnActive } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const btn = cn(
  gameBtn,
  'inline-flex min-w-0 items-center justify-center gap-1 px-1.5 py-1.5 text-[0.8rem] max-[980px]:min-h-[2.5rem]'
)

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

type ToolsBarProps = {
  mode: PointerMode
  emptyLeft: number
  seconds: number
  status: GameStatus
  canUndo: boolean
  canRedo: boolean
  canHint: boolean
  canCheck: boolean
  hasNotes: boolean
  onModeChange: (mode: PointerMode) => void
  onUndo: () => void
  onRedo: () => void
  onHint: () => void
  onCheck: () => void
  onClearNotes: () => void
  onNew: () => void
}

export function ToolsBar({
  mode,
  emptyLeft,
  seconds,
  status,
  canUndo,
  canRedo,
  canHint,
  canCheck,
  hasNotes,
  onModeChange,
  onUndo,
  onRedo,
  onHint,
  onCheck,
  onClearNotes,
  onNew
}: ToolsBarProps) {
  const { t } = useI18n()
  const statusLabel = status === 'won' ? t('sudoku.status.won') : null

  return (
    <GamePanel
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[0.85rem] font-bold tabular-nums text-ink">
          <HelpTip title={t('sudoku.help.title')}>
            <p className="m-0 mb-1.5">{t('sudoku.help.body')}</p>
            <p className="m-0 mb-1.5">{t('sudoku.help.controls')}</p>
            <p className="m-0">{t('sudoku.help.notes')}</p>
          </HelpTip>
          <span title={t('sudoku.emptyLeft')} aria-label={t('sudoku.emptyLeft')}>
            <span className="text-muted">{t('sudoku.empty')}</span>{' '}
            {String(emptyLeft).padStart(2, '0')}
          </span>
          <span title={t('sudoku.timer')} aria-label={t('sudoku.timer')}>
            <span className="text-muted">{t('sudoku.time')}</span>{' '}
            {formatTime(seconds)}
          </span>
          {statusLabel ? (
            <span className="text-[0.8rem] font-bold tracking-wide text-accent">
              {statusLabel}
            </span>
          ) : null}
        </div>
      }
    >
      <ToolRow mobileCols={4} desktopCols={8}>
        <button
          type="button"
          className={cn(btn, mode === 'digit' && gameBtnActive)}
          aria-pressed={mode === 'digit'}
          title={t('sudoku.tools.digitTitle')}
          onClick={() => onModeChange('digit')}
        >
          <span className="font-mono text-[0.95em] font-bold max-[980px]:inline min-[981px]:hidden">
            #
          </span>
          <span className="truncate max-[980px]:hidden">
            {t('sudoku.tools.digit')}
          </span>
        </button>
        <button
          type="button"
          className={cn(btn, mode === 'notes' && gameBtnActive)}
          aria-pressed={mode === 'notes'}
          title={
            mode === 'notes'
              ? t('sudoku.tools.notesClearTitle')
              : t('sudoku.tools.notesTitle')
          }
          onClick={() => onModeChange(mode === 'notes' ? 'digit' : 'notes')}
        >
          <Pencil className={iconCls} strokeWidth={2.25} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudoku.tools.notes')}
          </span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('sudoku.tools.undoTitle')}
        >
          <Undo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudoku.tools.undo')}
          </span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('sudoku.tools.redoTitle')}
        >
          <Redo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudoku.tools.redo')}
          </span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'border-accent bg-accent font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
          )}
          onClick={onHint}
          disabled={!canHint}
          title={t('sudoku.tools.hintTitle')}
        >
          <Sparkles className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudoku.tools.hint')}
          </span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={onCheck}
          disabled={!canCheck}
          title={t('sudoku.tools.checkTitle')}
        >
          <CircleCheck className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudoku.tools.check')}
          </span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={onClearNotes}
          disabled={!hasNotes || status === 'won'}
          title={t('sudoku.tools.clearNotesTitle')}
        >
          <Eraser className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudoku.tools.clearNotes')}
          </span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
          )}
          onClick={onNew}
          title={t('sudoku.newTitle')}
        >
          <RotateCcw className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">{t('sudoku.new')}</span>
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
