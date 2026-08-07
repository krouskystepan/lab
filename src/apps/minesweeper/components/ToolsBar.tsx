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
import { HelpTip } from './HelpTip'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell px-2 py-1.5 text-sm font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40 max-[720px]:min-h-[2.35rem] max-[720px]:text-[0.9rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

const panel =
  'flex min-w-0 flex-col gap-2 rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-[0.45rem]'

const panelTitle =
  'm-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden'

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

/** Same shape as Mine Helper Toolbar: title + 2 rows. */
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
    <section className={panel}>
      <h2 className={panelTitle}>{t('minesweeper.tools.title')}</h2>

      {/* Row 1: modes left, status right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex shrink-0 flex-nowrap items-center gap-[0.35rem]">
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex items-center gap-1.5',
              mode === 'dig' && btnActive
            )}
            aria-pressed={mode === 'dig'}
            title={t('minesweeper.tools.digTitle')}
            onClick={() => onModeChange('dig')}
          >
            <Pickaxe className={iconCls} strokeWidth={2.25} aria-hidden />
            {t('minesweeper.tools.dig')}
          </button>
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex items-center gap-1.5',
              mode === 'flag' && btnActive
            )}
            aria-pressed={mode === 'flag'}
            title={t('minesweeper.tools.flagTitle')}
            onClick={() => onModeChange('flag')}
          >
            <Flag className={iconCls} strokeWidth={2.25} aria-hidden />
            {t('minesweeper.tools.flag')}
          </button>
          <HelpTip title={t('minesweeper.help.title')}>
            <p className="m-0 mb-1.5">{t('minesweeper.help.body')}</p>
            <p className="m-0 mb-1.5">{t('minesweeper.help.controls')}</p>
            <p className="m-0 mb-1.5">{t('minesweeper.help.chord')}</p>
            <p className="m-0">{t('minesweeper.help.firstClick')}</p>
          </HelpTip>
        </div>

        <div className="flex shrink-0 items-center gap-[0.45rem] font-mono text-[0.9rem] font-bold tabular-nums text-ink">
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
      </div>

      {/* Row 2: history left, actions right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-[0.35rem]">
          <button
            type="button"
            className={cn(btn, 'inline-flex shrink-0 items-center gap-1.5')}
            onClick={onUndo}
            disabled={!canUndo}
            title={t('minesweeper.tools.undoTitle')}
          >
            <Undo2 className={iconCls} aria-hidden />
            {t('minesweeper.tools.undo')}
          </button>
          <button
            type="button"
            className={cn(btn, 'inline-flex shrink-0 items-center gap-1.5')}
            onClick={onRedo}
            disabled={!canRedo}
            title={t('minesweeper.tools.redoTitle')}
          >
            <Redo2 className={iconCls} aria-hidden />
            {t('minesweeper.tools.redo')}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-[0.35rem]">
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className={cn(
                btn,
                'inline-flex shrink-0 items-center gap-1.5 border-accent bg-accent px-[0.9rem] font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
              )}
              onClick={onHint}
              disabled={!canHint}
              title={t('minesweeper.tools.hintTitle')}
            >
              <Sparkles className={iconCls} aria-hidden />
              {t('minesweeper.tools.hint')}
            </button>
            <HelpTip title={t('minesweeper.tools.hintTipTitle')} alignEnd>
              {t('minesweeper.tools.hintTipBody')}
            </HelpTip>
          </div>
          <button
            type="button"
            className={cn(btn, 'inline-flex shrink-0 items-center gap-1.5')}
            onClick={onClearFlags}
            disabled={!hasFlags || status === 'won' || status === 'lost'}
            title={t('minesweeper.tools.clearFlagsTitle')}
          >
            <FlagOff className={iconCls} aria-hidden />
            {t('minesweeper.tools.clearFlags')}
          </button>
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex shrink-0 items-center gap-1.5 border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
            )}
            onClick={onNew}
            title={t('minesweeper.newTitle')}
          >
            <RotateCcw className={iconCls} aria-hidden />
            {t('minesweeper.new')}
          </button>
        </div>
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
