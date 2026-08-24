import { FlipHorizontal2, Redo2, Sparkles, Undo2 } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel, gameBtn } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'
import { PieceGlyph } from './PieceGlyph'
import type {
  MateN,
  MatePly,
  MateResult,
  Piece,
  PieceKind,
  Side
} from '../solver/types'
import { KINDS, MATE_NS } from '../solver/types'
import type { Brush } from '../storage/prefs'

const toolBtn = cn(gameBtn, 'text-sm')

const iconBtn = 'inline-flex size-9 shrink-0 items-center justify-center p-0'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

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

type ControlsBarProps = {
  brush: Brush
  onBrush: (b: Brush) => void
  searching: boolean
  canUndo: boolean
  canRedo: boolean
  result: MateResult | null
  mateN: MateN
  viewStep: number
  onViewStep: (step: number) => void
  onMateN: (n: MateN) => void
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
  onMateN,
  onFlip,
  onUndo,
  onRedo,
  onSolve
}: ControlsBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('chessMate.pad.title')}
      className="h-full w-full"
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
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
              'inline-flex h-9 min-w-0 items-center justify-center gap-1.5 border-accent bg-accent px-3 font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
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
      }
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <ResultStrip
          result={result}
          mateN={mateN}
          searching={searching}
          viewStep={viewStep}
          onViewStep={onViewStep}
        />
        <PiecePalette brush={brush} onBrush={onBrush} />
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase">
            {t('chessMate.n.title')}
            <HelpTip title={t('chessMate.n.helpTitle')}>
              <p className="m-0">{t('chessMate.n.helpBody')}</p>
            </HelpTip>
          </span>
          <div className="inline-flex overflow-hidden rounded-[var(--panel-btn-r)] border border-line">
            {MATE_NS.map((n) => (
              <button
                key={n}
                type="button"
                className={cn(
                  'cursor-pointer appearance-none border-0 px-2.5 py-[0.32rem] text-[0.8rem] font-bold',
                  mateN === n
                    ? 'bg-accent text-white'
                    : 'bg-cell text-muted hover:bg-cell-hover hover:text-ink'
                )}
                aria-pressed={mateN === n}
                onClick={() => onMateN(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GamePanel>
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
        'flex min-w-0 flex-col justify-center gap-1 rounded-sm border px-2.5 py-1.5',
        line.length > 0 ? 'min-h-[3.2rem]' : 'min-h-0',
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
      {line.length > 0 ? (
      <div
        className="flex h-8 min-w-0 items-center gap-1 overflow-x-auto"
        role="group"
        aria-label={t('chessMate.steps.title')}
      >
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
      </div>
      ) : null}
    </div>
  )
}

function PiecePalette({
  brush,
  onBrush
}: {
  brush: Brush
  onBrush: (b: Brush) => void
}) {
  const { t } = useI18n()

  return (
    <div className="flex w-fit max-w-full flex-wrap items-center gap-1.5">
      <PieceSwatch
        side="w"
        brush={brush}
        onBrush={onBrush}
        label={t('chessMate.pad.white')}
      />
      <span
        className="mx-0.5 hidden h-7 w-px bg-line sm:block"
        aria-hidden
      />
      <PieceSwatch
        side="b"
        brush={brush}
        onBrush={onBrush}
        label={t('chessMate.pad.black')}
      />
    </div>
  )
}

function PieceSwatch({
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
      className="flex shrink-0 items-center gap-0.5"
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
              'inline-flex h-8 w-8 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-md border p-0 transition-[background,box-shadow] duration-100',
              side === 'w'
                ? 'border-[#c9c0b0] bg-[#efe8da] hover:bg-[#f6f0e4]'
                : 'border-[#4a4a4a] bg-[#1f1f1f] hover:bg-[#2a2a2a]',
              active && 'shadow-[0_0_0_2px_var(--color-accent)]'
            )}
            aria-pressed={active}
            title={t('chessMate.pad.pieceTitle', {
              side: label,
              piece: t(PIECE_NAME[kind])
            })}
            onClick={() => onBrush(active ? null : piece)}
          >
            <PieceGlyph kind={kind} side={side} className="h-6 w-6" />
          </button>
        )
      })}
    </div>
  )
}
