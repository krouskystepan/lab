import { RotateCcw } from 'lucide-react'
import { DIFF_IDS, LENGTH_IDS, OP_IDS } from '../game/types'
import type {
  DiffId,
  Extras,
  GameStatus,
  LengthId,
  OpId,
  PaceId
} from '../game/types'
import { timedSecondsFor } from '../game/generate'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  GamePanel,
  ToolRow,
  gameBtn,
  gameBtnActive
} from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0 block'

const chip = cn(
  gameBtn,
  'inline-flex min-w-0 items-center justify-center px-2 py-[0.4rem] text-center text-[0.8rem] leading-tight max-[980px]:min-h-[2.35rem] max-[980px]:text-[0.9rem]'
)

const OP_LABEL: Record<
  OpId,
  | 'mentalMath.op.mix'
  | 'mentalMath.op.add'
  | 'mentalMath.op.sub'
  | 'mentalMath.op.mul'
  | 'mentalMath.op.div'
> = {
  mix: 'mentalMath.op.mix',
  add: 'mentalMath.op.add',
  sub: 'mentalMath.op.sub',
  mul: 'mentalMath.op.mul',
  div: 'mentalMath.op.div'
}

const DIFF_LABEL: Record<
  DiffId,
  'mentalMath.diff.easy' | 'mentalMath.diff.medium' | 'mentalMath.diff.hard'
> = {
  easy: 'mentalMath.diff.easy',
  medium: 'mentalMath.diff.medium',
  hard: 'mentalMath.diff.hard'
}

const LENGTH_LABEL: Record<
  LengthId,
  'mentalMath.length.n20' | 'mentalMath.length.endless'
> = {
  n20: 'mentalMath.length.n20',
  endless: 'mentalMath.length.endless'
}

export function formatTime(seconds: number): string {
  const s = Math.min(9999, Math.max(0, Math.floor(seconds)))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m >= 100) return String(s).padStart(4, '0')
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

type ToolsBarProps = {
  seconds: number
  index: number
  total: number
  score: number
  lengthId: LengthId
  paceId: PaceId
  timeLimit: number
  status: GameStatus
  onNew: () => void
}

export function ToolsBar({
  seconds,
  index,
  total,
  score,
  lengthId,
  paceId,
  timeLimit,
  status,
  onNew
}: ToolsBarProps) {
  const { t } = useI18n()
  const endless = lengthId === 'endless'
  const qn = total === 0 ? 0 : Math.min(index + 1, total)
  const timed = paceId === 'timed' && timeLimit > 0
  const shown = timed ? Math.max(0, timeLimit - seconds) : seconds
  const low =
    timed &&
    shown <= 10 &&
    (status === 'playing' || status === 'revealed' || status === 'lost')

  return (
    <GamePanel
      title={t('mentalMath.tools.title')}
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 font-mono text-[0.85rem] font-bold tabular-nums text-ink">
          <HelpTip title={t('mentalMath.help.title')}>
            <p className="m-0 mb-1.5">{t('mentalMath.help.body')}</p>
            <p className="m-0">{t('mentalMath.help.controls')}</p>
          </HelpTip>
          <span
            title={t('mentalMath.scoreTitle')}
            aria-label={t('mentalMath.scoreTitle')}
          >
            <span className="text-muted">{t('mentalMath.score')}</span> {score}
            {endless ? null : (
              <span className="text-muted">/{total || '-'}</span>
            )}
          </span>
          {endless ? null : (
            <span
              title={t('mentalMath.roundTitle')}
              aria-label={t('mentalMath.roundTitle')}
            >
              <span className="text-muted">{t('mentalMath.round')}</span> {qn}
              <span className="text-muted">/{total || '-'}</span>
            </span>
          )}
          <span
            title={timed ? t('mentalMath.timerLeft') : t('mentalMath.timer')}
            aria-label={
              timed ? t('mentalMath.timerLeft') : t('mentalMath.timer')
            }
            className={low ? 'text-danger' : undefined}
          >
            <span className={low ? 'text-danger' : 'text-muted'}>
              {t('mentalMath.time')}
            </span>{' '}
            {formatTime(shown)}
          </span>
          <button
            type="button"
            className={cn(
              gameBtn,
              'inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.68rem] font-bold'
            )}
            onClick={onNew}
            title={t('mentalMath.newTitle')}
          >
            <RotateCcw className={iconCls} aria-hidden />
            {t('mentalMath.new')}
          </button>
        </div>
      }
    />
  )
}

type OpBarProps = {
  opId: OpId
  onOpChange: (id: OpId) => void
}

export function OpBar({ opId, onOpChange }: OpBarProps) {
  const { t } = useI18n()
  return (
    <GamePanel
      title={t('mentalMath.op.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('mentalMath.op.helpTitle')}>
          <p className="m-0">{t('mentalMath.op.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={5} desktopCols={5}>
        {OP_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={cn(chip, opId === id && gameBtnActive)}
            title={t('mentalMath.op.applyTitle')}
            onClick={() => onOpChange(id)}
          >
            {t(OP_LABEL[id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}

type DiffBarProps = {
  diffId: DiffId
  onDiffChange: (id: DiffId) => void
}

export function DiffBar({ diffId, onDiffChange }: DiffBarProps) {
  const { t } = useI18n()
  return (
    <GamePanel
      title={t('mentalMath.diff.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('mentalMath.diff.helpTitle')}>
          <p className="m-0">{t('mentalMath.diff.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={3} desktopCols={3}>
        {DIFF_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={cn(chip, diffId === id && gameBtnActive)}
            title={t('mentalMath.diff.applyTitle')}
            onClick={() => onDiffChange(id)}
          >
            {t(DIFF_LABEL[id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}

type LengthBarProps = {
  lengthId: LengthId
  onLengthChange: (id: LengthId) => void
}

export function LengthBar({ lengthId, onLengthChange }: LengthBarProps) {
  const { t } = useI18n()
  return (
    <GamePanel
      title={t('mentalMath.length.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('mentalMath.length.helpTitle')}>
          <p className="m-0">{t('mentalMath.length.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={2} desktopCols={2}>
        {LENGTH_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={cn(chip, lengthId === id && gameBtnActive)}
            title={t('mentalMath.length.applyTitle')}
            onClick={() => onLengthChange(id)}
          >
            {t(LENGTH_LABEL[id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}

type ExtraBarProps = {
  powers: boolean
  roots: boolean
  facts: boolean
  parens: boolean
  onPowers: (on: boolean) => void
  onRoots: (on: boolean) => void
  onFacts: (on: boolean) => void
  onParens: (on: boolean) => void
}

export function ExtraBar({
  powers,
  roots,
  facts,
  parens,
  onPowers,
  onRoots,
  onFacts,
  onParens
}: ExtraBarProps) {
  const { t } = useI18n()
  return (
    <GamePanel
      title={t('mentalMath.extra.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('mentalMath.extra.helpTitle')}>
          <p className="m-0">{t('mentalMath.extra.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={2} desktopCols={4}>
        <button
          type="button"
          className={cn(chip, powers && gameBtnActive)}
          title={t('mentalMath.extra.powersTitle')}
          aria-pressed={powers}
          onClick={() => onPowers(!powers)}
        >
          {t('mentalMath.extra.powers')}
        </button>
        <button
          type="button"
          className={cn(chip, roots && gameBtnActive)}
          title={t('mentalMath.extra.rootsTitle')}
          aria-pressed={roots}
          onClick={() => onRoots(!roots)}
        >
          {t('mentalMath.extra.roots')}
        </button>
        <button
          type="button"
          className={cn(chip, facts && gameBtnActive)}
          title={t('mentalMath.extra.factsTitle')}
          aria-pressed={facts}
          onClick={() => onFacts(!facts)}
        >
          {t('mentalMath.extra.facts')}
        </button>
        <button
          type="button"
          className={cn(chip, parens && gameBtnActive)}
          title={t('mentalMath.extra.parensTitle')}
          aria-pressed={parens}
          onClick={() => onParens(!parens)}
        >
          {t('mentalMath.extra.parens')}
        </button>
      </ToolRow>
    </GamePanel>
  )
}

type PaceBarProps = {
  paceId: PaceId
  lengthId: LengthId
  diffId: DiffId
  extras: Extras
  onPaceChange: (paceId: PaceId) => void
}

export function PaceBar({
  paceId,
  lengthId,
  diffId,
  extras,
  onPaceChange
}: PaceBarProps) {
  const { t } = useI18n()
  const limit = timedSecondsFor(lengthId, diffId, extras)
  return (
    <GamePanel
      title={t('mentalMath.timer.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('mentalMath.timer.helpTitle')}>
          <p className="m-0">{t('mentalMath.timer.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={2} desktopCols={2}>
        <button
          type="button"
          className={cn(chip, paceId !== 'timed' && gameBtnActive)}
          title={t('mentalMath.timer.trainTitle')}
          onClick={() => onPaceChange('train')}
        >
          {t('mentalMath.timer.train')}
        </button>
        <button
          type="button"
          className={cn(chip, paceId === 'timed' && gameBtnActive)}
          title={t('mentalMath.timer.timedTitle', { time: formatTime(limit) })}
          onClick={() => onPaceChange('timed')}
        >
          {t('mentalMath.timer.timed')} {formatTime(limit)}
        </button>
      </ToolRow>
    </GamePanel>
  )
}
