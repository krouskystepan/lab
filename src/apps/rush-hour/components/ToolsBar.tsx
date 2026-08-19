import { Redo2, RotateCcw, Sparkles, Undo2 } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell px-1.5 py-1.5 text-[0.8rem] font-semibold leading-none transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40 max-[720px]:min-h-[2.35rem] max-[720px]:text-[0.85rem]'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0 block'

const panel =
  'relative z-10 flex min-w-0 w-full flex-col gap-2.5 overflow-visible rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-2'

const panelTitle =
  'm-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase'

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
    <section className={panel}>
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            className={cn(
              panelTitle,
              'max-[720px]:hidden [@media(max-height:700px)]:hidden'
            )}
          >
            {t('rushHour.tools.title')}
          </h2>
          <HelpTip title={t('rushHour.help.title')}>
            <p className="m-0 mb-1.5">{t('rushHour.help.body')}</p>
            <p className="m-0">{t('rushHour.help.controls')}</p>
          </HelpTip>
        </div>
        <div className="flex shrink-0 items-center gap-3 font-mono text-[0.9rem] font-bold tabular-nums text-ink">
          <span
            className="inline-block min-w-22 text-right"
            title={t('rushHour.movesTitle')}
            aria-label={t('rushHour.movesTitle')}
          >
            <span className="text-muted">{t('rushHour.moves')}</span>{' '}
            {moves}
            <span className="text-muted">/{minMoves}</span>
          </span>
          <span
            className="inline-block min-w-22 text-right"
            title={t('rushHour.timer')}
            aria-label={t('rushHour.timer')}
          >
            <span className="text-muted">{t('rushHour.time')}</span>{' '}
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-5 gap-1.5">
        <button
          type="button"
          className={cn(btn, 'inline-flex min-w-0 items-center justify-center gap-1')}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('rushHour.tools.undoTitle')}
          aria-label={t('rushHour.tools.undo')}
        >
          <Undo2 className={iconCls} aria-hidden />
          <span className="truncate leading-none max-[520px]:hidden">
            {t('rushHour.tools.undo')}
          </span>
        </button>
        <button
          type="button"
          className={cn(btn, 'inline-flex min-w-0 items-center justify-center gap-1')}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('rushHour.tools.redoTitle')}
          aria-label={t('rushHour.tools.redo')}
        >
          <Redo2 className={iconCls} aria-hidden />
          <span className="truncate leading-none max-[520px]:hidden">
            {t('rushHour.tools.redo')}
          </span>
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
            title={t('rushHour.tools.hintTitle')}
          >
            <Sparkles className={iconCls} aria-hidden />
            <span className="truncate leading-none">{t('rushHour.tools.hint')}</span>
          </button>
          <HelpTip title={t('rushHour.tools.hintTipTitle')} alignEnd>
            {t('rushHour.tools.hintTipBody')}
          </HelpTip>
        </div>
        <button
          type="button"
          className={cn(btn, 'inline-flex min-w-0 items-center justify-center gap-1')}
          onClick={onReset}
          title={t('rushHour.resetTitle')}
        >
          <span className="truncate leading-none">{t('rushHour.reset')}</span>
        </button>
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex min-w-0 items-center justify-center gap-1 border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
          )}
          onClick={onNew}
          title={t('rushHour.newTitle')}
        >
          <RotateCcw className={iconCls} aria-hidden />
          <span className="truncate leading-none">{t('rushHour.new')}</span>
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
