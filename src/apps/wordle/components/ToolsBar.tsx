import { RotateCcw, Sparkles } from 'lucide-react'
import type { GameStatus } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel, gameBtn } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const btn = cn(
  gameBtn,
  'px-1.5 py-1.5 text-[0.8rem] leading-none max-[980px]:min-h-[2.35rem] max-[980px]:text-[0.85rem]'
)

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0 block'

type ToolsBarProps = {
  seconds: number
  status: GameStatus
  answer: string
  canHint: boolean
  onHint: () => void
  onNew: () => void
}

export function ToolsBar({
  seconds,
  status,
  answer,
  canHint,
  onHint,
  onNew
}: ToolsBarProps) {
  const { t } = useI18n()

  const statusLabel =
    status === 'won'
      ? t('wordle.status.won')
      : status === 'lost'
        ? t('wordle.status.lost', { word: answer.toUpperCase() })
        : null

  return (
    <GamePanel
      title={t('wordle.tools.title')}
      className="h-full"
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <HelpTip title={t('wordle.help.title')}>
            <p className="m-0 mb-1.5">{t('wordle.help.body')}</p>
            <p className="m-0 mb-1.5">{t('wordle.help.lang')}</p>
            <p className="m-0 mb-1.5">{t('wordle.help.controls')}</p>
            <p className="m-0">{t('wordle.help.hard')}</p>
          </HelpTip>
          <div className="flex shrink-0 items-center gap-3 font-mono text-[0.9rem] font-bold tabular-nums text-ink">
            <span
              className="inline-block min-w-22 text-right"
              title={t('wordle.timer')}
              aria-label={t('wordle.timer')}
            >
              <span className="text-muted">{t('wordle.time')}</span>{' '}
              {formatTime(seconds)}
            </span>
            {statusLabel ? (
              <span className="max-w-40 truncate text-[0.8rem] font-bold tracking-wide text-accent">
                {statusLabel}
              </span>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-0 w-full flex-col justify-center">
        <div className="grid w-full grid-cols-2 gap-1.5">
          <div className="flex min-w-0 items-stretch gap-1">
            <button
              type="button"
              className={cn(
                btn,
                'inline-flex min-w-0 flex-1 items-center justify-center gap-1 border-accent bg-accent font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
              )}
              onClick={onHint}
              disabled={!canHint}
              title={t('wordle.tools.hintTitle')}
            >
              <Sparkles className={iconCls} aria-hidden />
              <span className="truncate leading-none">{t('wordle.tools.hint')}</span>
            </button>
            <HelpTip title={t('wordle.tools.hintTipTitle')} alignEnd>
              {t('wordle.tools.hintTipBody')}
            </HelpTip>
          </div>
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex min-w-0 items-center justify-center gap-1 border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
            )}
            onClick={onNew}
            title={t('wordle.newTitle')}
          >
            <RotateCcw className={iconCls} aria-hidden />
            <span className="truncate leading-none">{t('wordle.new')}</span>
          </button>
        </div>
      </div>
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
