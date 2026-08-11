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
import { HelpTip } from './HelpTip'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell px-1.5 py-1.5 text-[0.8rem] font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40 max-[720px]:min-h-[2.35rem] max-[720px]:text-[0.85rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

const panel =
  'relative z-10 flex min-w-0 w-full flex-col gap-2.5 overflow-visible rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-2'

const panelTitle =
  'm-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase'

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
    <section className={panel}>
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            className={cn(
              panelTitle,
              'max-[720px]:hidden [@media(max-height:700px)]:hidden'
            )}
          >
            {t('sudoku.tools.title')}
          </h2>
          <HelpTip title={t('sudoku.help.title')}>
            <p className="m-0 mb-1.5">{t('sudoku.help.body')}</p>
            <p className="m-0 mb-1.5">{t('sudoku.help.controls')}</p>
            <p className="m-0">{t('sudoku.help.notes')}</p>
          </HelpTip>
        </div>
        <div className="flex shrink-0 items-center gap-3 font-mono text-[0.9rem] font-bold tabular-nums text-ink">
          <span
            className="inline-block min-w-[5.5rem] text-right"
            title={t('sudoku.emptyLeft')}
            aria-label={t('sudoku.emptyLeft')}
          >
            <span className="text-muted">{t('sudoku.empty')}</span>{' '}
            {String(emptyLeft).padStart(2, '0')}
          </span>
          <span
            className="inline-block min-w-[5.5rem] text-right"
            title={t('sudoku.timer')}
            aria-label={t('sudoku.timer')}
          >
            <span className="text-muted">{t('sudoku.time')}</span>{' '}
            {formatTime(seconds)}
          </span>
          {statusLabel ? (
            <span className="text-[0.8rem] font-bold tracking-wide text-accent">
              {statusLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid w-full grid-cols-8 gap-1.5">
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1',
            mode === 'digit' && btnActive
          )}
          aria-pressed={mode === 'digit'}
          title={t('sudoku.tools.digitTitle')}
          onClick={() => onModeChange('digit')}
        >
          <span className="truncate">{t('sudoku.tools.digit')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1',
            mode === 'notes' && btnActive
          )}
          aria-pressed={mode === 'notes'}
          title={
            mode === 'notes'
              ? t('sudoku.tools.notesClearTitle')
              : t('sudoku.tools.notesTitle')
          }
          onClick={() => onModeChange(mode === 'notes' ? 'digit' : 'notes')}
        >
          <Pencil className={iconCls} strokeWidth={2.25} aria-hidden />
          <span className="truncate">{t('sudoku.tools.notes')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1'
          )}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('sudoku.tools.undoTitle')}
        >
          <Undo2 className={iconCls} aria-hidden />
          <span className="truncate">{t('sudoku.tools.undo')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1'
          )}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('sudoku.tools.redoTitle')}
        >
          <Redo2 className={iconCls} aria-hidden />
          <span className="truncate">{t('sudoku.tools.redo')}</span>
        </button>
        <div className="flex min-w-0 items-stretch gap-1">
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex min-w-0 flex-1 items-center justify-center gap-1 border-accent bg-accent font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
            )}
            onClick={onHint}
            disabled={!canHint}
            title={t('sudoku.tools.hintTitle')}
          >
            <Sparkles className={iconCls} aria-hidden />
            <span className="truncate">{t('sudoku.tools.hint')}</span>
          </button>
          <HelpTip title={t('sudoku.tools.hintTipTitle')} alignEnd>
            {t('sudoku.tools.hintTipBody')}
          </HelpTip>
        </div>
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1'
          )}
          onClick={onCheck}
          disabled={!canCheck}
          title={t('sudoku.tools.checkTitle')}
        >
          <CircleCheck className={iconCls} aria-hidden />
          <span className="truncate">{t('sudoku.tools.check')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1'
          )}
          onClick={onClearNotes}
          disabled={!hasNotes || status === 'won'}
          title={t('sudoku.tools.clearNotesTitle')}
        >
          <Eraser className={iconCls} aria-hidden />
          <span className="truncate">{t('sudoku.tools.clearNotes')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1 border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
          )}
          onClick={onNew}
          title={t('sudoku.newTitle')}
        >
          <RotateCcw className={iconCls} aria-hidden />
          <span className="truncate">{t('sudoku.new')}</span>
        </button>
      </div>
    </section>
  )
}

function formatTime(seconds: number): string {
  const s = Math.min(9999, Math.max(0, Math.floor(seconds)))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m >= 100) return String(s).padStart(4, '0')
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
