import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'
import { PRESETS, type MatePreset } from '../solver/presets'
import { MATE_NS, type Castling, type MateN, type Position } from '../solver/types'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] max-[720px]:min-h-[2.2rem]'

const PRESET_LABEL: Record<
  MatePreset['id'],
  | 'chessMate.preset.backRank'
  | 'chessMate.preset.queenMate'
  | 'chessMate.preset.rookRoll'
  | 'chessMate.preset.smothered'
> = {
  backRank: 'chessMate.preset.backRank',
  queenMate: 'chessMate.preset.queenMate',
  rookRoll: 'chessMate.preset.rookRoll',
  smothered: 'chessMate.preset.smothered'
}

const CASTLE_LABEL: Record<
  keyof Castling,
  | 'chessMate.castle.K'
  | 'chessMate.castle.Q'
  | 'chessMate.castle.k'
  | 'chessMate.castle.q'
> = {
  K: 'chessMate.castle.K',
  Q: 'chessMate.castle.Q',
  k: 'chessMate.castle.k',
  q: 'chessMate.castle.q'
}

type SetupBarProps = {
  pos: Position
  fenDraft: string
  mateN: MateN
  onFenDraft: (v: string) => void
  onLoadFen: () => void
  onMateN: (n: MateN) => void
  onCastle: (flag: keyof Castling, on: boolean) => void
  onPreset: (preset: MatePreset) => void
}

export function SetupBar({
  pos,
  fenDraft,
  mateN,
  onFenDraft,
  onLoadFen,
  onMateN,
  onCastle,
  onPreset
}: SetupBarProps) {
  const { t } = useI18n()
  const castleFlags: (keyof Castling)[] = ['K', 'Q', 'k', 'q']

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase">
          {t('chessMate.n.title')}
          <HelpTip title={t('chessMate.n.helpTitle')}>
            <p className="m-0">{t('chessMate.n.helpBody')}</p>
          </HelpTip>
        </span>
        <div className="inline-flex overflow-hidden rounded-sm border border-line">
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
        <div className="grid w-full min-w-0 grid-cols-2 gap-1 sm:ml-auto sm:flex sm:w-auto sm:flex-1 sm:flex-wrap sm:items-center sm:justify-end">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cn(btn, 'min-w-0 px-2 py-[0.4rem] text-[0.75rem] max-[980px]:min-h-[2.4rem]')}
              title={t(PRESET_LABEL[p.id])}
              onClick={() => onPreset(p)}
            >
              {t(PRESET_LABEL[p.id])}
            </button>
          ))}
        </div>
      </div>
      <form
        className="flex min-w-0 flex-wrap items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          onLoadFen()
        }}
      >
        <span className="inline-flex shrink-0 items-center gap-1 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase">
          {t('chessMate.fen.label')}
          <HelpTip title={t('chessMate.fen.helpTitle')}>
            <p className="m-0">{t('chessMate.fen.helpBody')}</p>
          </HelpTip>
        </span>
        <input
          id="chess-fen"
          value={fenDraft}
          onChange={(e) => onFenDraft(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={t('chessMate.fen.label')}
          className="min-w-0 flex-1 rounded-sm border border-line bg-cell px-2 py-[0.32rem] font-mono text-[0.72rem] text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          className={cn(btn, 'shrink-0 px-2.5 py-[0.32rem] text-[0.75rem]')}
          title={t('chessMate.fen.applyTitle')}
        >
          {t('chessMate.fen.apply')}
        </button>
        <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase">
          {t('chessMate.castle.title')}
          <HelpTip title={t('chessMate.castle.helpTitle')}>
            <p className="m-0">{t('chessMate.castle.helpBody')}</p>
          </HelpTip>
        </span>
        <div
          className="inline-flex overflow-hidden rounded-sm border border-line"
          aria-label={t('chessMate.castle.title')}
        >
          {castleFlags.map((flag) => (
            <label
              key={flag}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1 px-1.5 py-[0.32rem] text-[0.68rem] font-bold',
                pos.castling[flag] ? 'bg-accent/25 text-on-accent' : 'bg-cell text-muted'
              )}
              title={t(CASTLE_LABEL[flag])}
            >
              <input
                type="checkbox"
                className="accent-accent"
                checked={pos.castling[flag]}
                onChange={(e) => onCastle(flag, e.target.checked)}
              />
              {flag}
            </label>
          ))}
        </div>
      </form>
    </div>
  )
}
