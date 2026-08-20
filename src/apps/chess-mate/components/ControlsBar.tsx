import { FlipHorizontal2, Redo2, Sparkles, Undo2 } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'
import { PieceGlyph } from './PieceGlyph'
import type {
  MatePly,
  MateResult,
  Piece,
  PieceKind,
  Side
} from '../solver/types'
import { KINDS } from '../solver/types'
import type { Brush } from '../storage/prefs'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40'

const iconBtn = 'inline-flex size-9 shrink-0 items-center justify-center p-0'

const PIECE_NAME: Record<
  PieceKind,
  | 'chessMate.piece.k'
  | 'chessMate.piece.q'
  | 'chessMate.piece.r'
  | 'chessMate.piece.b'
  | 'chessMate.piece.n'
  | 'chessMate.piece.p'
> = {
  k: 'chessMate.piece.k',
  q: 'chessMate.piece.q',
  r: 'chessMate.piece.r',
  b: 'chessMate.piece.b',
  n: 'chessMate.piece.n',
  p: 'chessMate.piece.p'
}

const toolBtn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell px-2 py-1.5 text-sm font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

type ControlsBarProps = {
  brush: Brush
  onBrush: (b: Brush) => void
  searching: boolean
  canUndo: boolean
  canRedo: boolean
  result: MateResult | null
  mateN: number
  viewStep: number
  onViewStep: (step: number) => void
  onFlip: () => void
  onUndo: () => void
  onRedo: () => void
  onSolve: () => void
}

export function ControlsBar({
  brush,
  onBrush,
  searching,
  canUndo,
  canRedo,
  result,
  mateN,
  viewStep,
  onViewStep,
  onFlip,
  onUndo,
  onRedo,
  onSolve
}: ControlsBarProps) {
  const { t } = useI18n()

  return (
    <div className="flex min-w-0 w-full flex-col gap-1.5">
      <ResultStrip
        result={result}
        mateN={mateN}
        searching={searching}
        viewStep={viewStep}
        onViewStep={onViewStep}
      />
      <PieceRow
        side="w"
        brush={brush}
        onBrush={onBrush}
        label={t('chessMate.pad.white')}
      />
      <PieceRow
        side="b"
        brush={brush}
        onBrush={onBrush}
        label={t('chessMate.pad.black')}
      />

      <div className="flex min-w-0 w-full flex-wrap items-center gap-1.5">
        <HelpTip title={t('chessMate.help.title')}>
          <p className="m-0 mb-1.5">{t('chessMate.help.body')}</p>
          <p className="m-0">{t('chessMate.help.solve')}</p>
        </HelpTip>
        <button
          type="button"
          className={cn(toolBtn, iconBtn)}
          onClick={onFlip}
          title={t('chessMate.tools.flipTitle')}
          aria-label={t('chessMate.tools.flip')}
        >
          <FlipHorizontal2 className={iconCls} aria-hidden />
        </button>
        <button
          type="button"
          className={cn(toolBtn, iconBtn)}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('chessMate.tools.undoTitle')}
          aria-label={t('chessMate.tools.undo')}
        >
          <Undo2 className={iconCls} aria-hidden />
        </button>
        <button
          type="button"
          className={cn(toolBtn, iconBtn)}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('chessMate.tools.redoTitle')}
          aria-label={t('chessMate.tools.redo')}
        >
          <Redo2 className={iconCls} aria-hidden />
        </button>
        <button
          type="button"
          className={cn(
            toolBtn,
            'ml-auto inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 border-accent bg-accent px-3 font-bold text-white hover:border-accent-hover hover:bg-accent-hover max-[980px]:min-h-10 sm:flex-none'
          )}
          onClick={onSolve}
          disabled={searching}
          title={t('chessMate.tools.solveTitle')}
        >
          <Sparkles
            className={cn(iconCls, searching && 'animate-pulse')}
            aria-hidden
          />
          {t('chessMate.tools.solve')}
        </button>
      </div>
    </div>
  )
}

function ResultStrip({
  result,
  mateN,
  searching,
  viewStep,
  onViewStep
}: {
  result: MateResult | null
  mateN: number
  searching: boolean
  viewStep: number
  onViewStep: (step: number) => void
}) {
  const { t } = useI18n()
  const ok = result?.ok === true
  const failed = result != null && !result.ok
  const line: MatePly[] = ok && result.ok ? result.line : []

  let body: string
  if (searching) {
    body = t('chessMate.result.searching')
  } else if (ok && result.ok) {
    body = t('chessMate.result.mate', { n: result.mateIn })
  } else if (failed && result && !result.ok) {
    body =
      result.reason === 'none'
        ? t('chessMate.result.none', { n: mateN })
        : result.reason === 'timeout'
          ? t('chessMate.result.timeout')
          : result.reason === 'invalid'
            ? t('chessMate.result.invalid')
            : result.reason === 'stalemate'
              ? t('chessMate.result.stalemate')
              : t('chessMate.result.already')
  } else {
    body = t('chessMate.result.idle')
  }

  return (
    <div
      className={cn(
        'flex min-h-[3.4rem] min-w-0 flex-col justify-center gap-1 rounded-sm border px-2.5 py-1.5',
        ok
          ? 'border-accent/50 bg-accent/15 text-ink'
          : failed
            ? 'border-danger/40 bg-danger/10 text-[#ffb0b0]'
            : 'border-line bg-cell/60 text-muted'
      )}
      role="status"
      aria-live="polite"
    >
      <span className="block w-full min-w-0 truncate text-[0.8rem] font-semibold leading-none">
        {body}
      </span>
      <div
        className={cn(
          'flex h-8 min-w-0 items-center gap-1 overflow-x-auto',
          line.length > 0 ? 'visible' : 'invisible'
        )}
        role="group"
        aria-label={t('chessMate.steps.title')}
      >
        {line.length > 0 ? (
          <>
            <button
              type="button"
              className={cn(
                'inline-flex h-8 shrink-0 cursor-pointer appearance-none items-center gap-1.5 rounded-sm border px-2 text-[0.78rem] font-bold leading-none',
                viewStep === 0
                  ? 'border-accent bg-accent text-white'
                  : 'border-line bg-cell text-ink hover:bg-cell-hover'
              )}
              aria-pressed={viewStep === 0}
              title={t('chessMate.steps.startTitle')}
              onClick={() => onViewStep(0)}
            >
              <span
                className={cn(
                  'tabular-nums',
                  viewStep === 0 ? 'text-white/70' : 'text-muted'
                )}
              >
                0
              </span>
              <span>{t('chessMate.steps.start')}</span>
            </button>
            {line.map((ply, i) => {
              const step = i + 1
              const active = viewStep === step
              return (
                <button
                  key={`${step}-${ply.san}`}
                  type="button"
                  className={cn(
                    'inline-flex h-8 shrink-0 cursor-pointer appearance-none items-center gap-1.5 rounded-sm border px-2 text-[0.78rem] font-bold leading-none',
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-line bg-cell text-ink hover:bg-cell-hover'
                  )}
                  aria-pressed={active}
                  title={t('chessMate.steps.item', { n: step, san: ply.san })}
                  onClick={() => onViewStep(step)}
                >
                  <span
                    className={cn(
                      'tabular-nums',
                      active ? 'text-white/70' : 'text-muted'
                    )}
                  >
                    {step}
                  </span>
                  <span className="font-mono">{ply.san}</span>
                </button>
              )
            })}
          </>
        ) : null}
      </div>
    </div>
  )
}

function PieceRow({
  side,
  brush,
  onBrush,
  label
}: {
  side: Side
  brush: Brush
  onBrush: (b: Brush) => void
  label: string
}) {
  const { t } = useI18n()
  return (
    <div
      className="grid w-full min-w-0 grid-cols-6 gap-1"
      role="group"
      aria-label={label}
    >
      {KINDS.map((kind) => {
        const piece: Piece = { kind, side }
        const active =
          brush !== null && brush.kind === kind && brush.side === side
        return (
          <button
            key={`${side}${kind}`}
            type="button"
            className={cn(
              btn,
              'inline-flex aspect-square min-h-10 w-full items-center justify-center p-0 max-[980px]:min-h-11',
              side === 'w'
                ? 'border-[#c9c0b0] bg-[#efe8da] hover:bg-[#f6f0e4]'
                : 'border-[#4a4a4a] bg-[#1f1f1f] hover:bg-[#2a2a2a]',
              active && 'border-accent bg-accent/35'
            )}
            aria-pressed={active}
            title={t('chessMate.pad.pieceTitle', {
              side: label,
              piece: t(PIECE_NAME[kind])
            })}
            onClick={() => onBrush(active ? null : piece)}
          >
            <PieceGlyph kind={kind} side={side} />
          </button>
        )
      })}
    </div>
  )
}
