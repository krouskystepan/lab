import { RotateCcw } from 'lucide-react'
import { ANSWER_IDS, GROUP_IDS, MODE_IDS } from '../game/types'
import type {
  AnswerId,
  GameStatus,
  GroupId,
  ModeId,
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
  'min-w-0 truncate px-1 py-[0.4rem] text-center text-[0.8rem] max-[980px]:min-h-[2.35rem] max-[980px]:text-[0.9rem]'
)

const MODE_LABEL: Record<
  ModeId,
  | 'geoQuiz.mode.mix'
  | 'geoQuiz.mode.flags'
  | 'geoQuiz.mode.capitals'
> = {
  mix: 'geoQuiz.mode.mix',
  flags: 'geoQuiz.mode.flags',
  capitals: 'geoQuiz.mode.capitals'
}

const ANSWER_LABEL: Record<
  AnswerId,
  'geoQuiz.answer.choice' | 'geoQuiz.answer.type'
> = {
  choice: 'geoQuiz.answer.choice',
  type: 'geoQuiz.answer.type'
}

const GROUP_LABEL: Record<
  GroupId,
  | 'geoQuiz.group.world'
  | 'geoQuiz.group.europe'
  | 'geoQuiz.group.americas'
  | 'geoQuiz.group.asia'
  | 'geoQuiz.group.africa'
  | 'geoQuiz.group.oceania'
> = {
  world: 'geoQuiz.group.world',
  europe: 'geoQuiz.group.europe',
  americas: 'geoQuiz.group.americas',
  asia: 'geoQuiz.group.asia',
  africa: 'geoQuiz.group.africa',
  oceania: 'geoQuiz.group.oceania'
}

type ToolsBarProps = {
  seconds: number
  index: number
  total: number
  score: number
  paceId: PaceId
  timeLimit: number
  status: GameStatus
  onNew: () => void
  autoNext: boolean
  onToggleAutoNext: () => void
}

export function ToolsBar({
  seconds,
  index,
  total,
  score,
  paceId,
  timeLimit,
  status,
  onNew,
  autoNext,
  onToggleAutoNext
}: ToolsBarProps) {
  const { t } = useI18n()
  const qn = total === 0 ? 0 : Math.min(index + 1, total)
  const timed = paceId === 'timed' && timeLimit > 0
  const shown = timed ? Math.max(0, timeLimit - seconds) : seconds
  const low =
    timed &&
    shown <= 10 &&
    (status === 'playing' || status === 'revealed' || status === 'lost')

  return (
    <GamePanel
      title={t('geoQuiz.tools.title')}
      headerRight={
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 font-mono text-[0.85rem] font-bold tabular-nums text-ink">
          <HelpTip title={t('geoQuiz.help.title')}>
            <p className="m-0 mb-1.5">{t('geoQuiz.help.body')}</p>
            <p className="m-0 mb-1.5">{t('geoQuiz.help.data')}</p>
            <p className="m-0">{t('geoQuiz.help.controls')}</p>
          </HelpTip>
          <span
            title={t('geoQuiz.scoreTitle')}
            aria-label={t('geoQuiz.scoreTitle')}
          >
            <span className="text-muted">{t('geoQuiz.score')}</span> {score}
            <span className="text-muted">/{total || '—'}</span>
          </span>
          <span
            title={t('geoQuiz.roundTitle')}
            aria-label={t('geoQuiz.roundTitle')}
          >
            <span className="text-muted">{t('geoQuiz.round')}</span> {qn}
            <span className="text-muted">/{total || '—'}</span>
          </span>
          <span
            title={timed ? t('geoQuiz.timerLeft') : t('geoQuiz.timer')}
            aria-label={timed ? t('geoQuiz.timerLeft') : t('geoQuiz.timer')}
            className={low ? 'text-danger' : undefined}
          >
            <span className={low ? 'text-danger' : 'text-muted'}>
              {t('geoQuiz.time')}
            </span>{' '}
            {formatTime(shown)}
          </span>
          <button
            type="button"
            className={cn(
              gameBtn,
              'px-1.5 py-0.5 text-[0.68rem] font-bold',
              autoNext && gameBtnActive
            )}
            title={t('geoQuiz.autoNextTitle')}
            aria-pressed={autoNext}
            onClick={onToggleAutoNext}
          >
            {t('geoQuiz.autoNext')}
          </button>
          <button
            type="button"
            className={cn(
              gameBtn,
              'inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.68rem] font-bold'
            )}
            onClick={onNew}
            title={t('geoQuiz.newTitle')}
          >
            <RotateCcw className={iconCls} aria-hidden />
            {t('geoQuiz.new')}
          </button>
        </div>
      }
    />
  )
}

type ModeBarProps = {
  modeId: ModeId
  onModeChange: (id: ModeId) => void
}

export function ModeBar({ modeId, onModeChange }: ModeBarProps) {
  const { t } = useI18n()
  return (
    <GamePanel
      title={t('geoQuiz.mode.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('geoQuiz.mode.helpTitle')}>
          <p className="m-0">{t('geoQuiz.mode.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={3} desktopCols={3}>
        {MODE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={cn(chip, modeId === id && gameBtnActive)}
            title={t('geoQuiz.mode.applyTitle')}
            onClick={() => onModeChange(id)}
          >
            {t(MODE_LABEL[id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}

type AnswerBarProps = {
  answerId: AnswerId
  onAnswerChange: (id: AnswerId) => void
}

export function AnswerBar({ answerId, onAnswerChange }: AnswerBarProps) {
  const { t } = useI18n()
  return (
    <GamePanel
      title={t('geoQuiz.answer.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('geoQuiz.answer.helpTitle')}>
          <p className="m-0">{t('geoQuiz.answer.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={2} desktopCols={2}>
        {ANSWER_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={cn(chip, answerId === id && gameBtnActive)}
            title={t('geoQuiz.answer.applyTitle')}
            onClick={() => onAnswerChange(id)}
          >
            {t(ANSWER_LABEL[id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}

type PaceBarProps = {
  paceId: PaceId
  groupId: GroupId
  answerId: AnswerId
  onPaceChange: (paceId: PaceId) => void
}

export function PaceBar({
  paceId,
  groupId,
  answerId,
  onPaceChange
}: PaceBarProps) {
  const { t } = useI18n()
  const limit = timedSecondsFor(groupId, answerId)
  return (
    <GamePanel
      title={t('geoQuiz.timer.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('geoQuiz.timer.helpTitle')}>
          <p className="m-0">{t('geoQuiz.timer.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={2} desktopCols={2}>
        <button
          type="button"
          className={cn(chip, paceId !== 'timed' && gameBtnActive)}
          title={t('geoQuiz.timer.trainTitle')}
          onClick={() => onPaceChange('train')}
        >
          {t('geoQuiz.timer.train')}
        </button>
        <button
          type="button"
          className={cn(chip, paceId === 'timed' && gameBtnActive)}
          title={t('geoQuiz.timer.timedTitle', { time: formatTime(limit) })}
          onClick={() => onPaceChange('timed')}
        >
          {t('geoQuiz.timer.timed')} {formatTime(limit)}
        </button>
      </ToolRow>
    </GamePanel>
  )
}

type GroupBarProps = {
  groupId: GroupId
  onGroupChange: (id: GroupId) => void
}

export function GroupBar({ groupId, onGroupChange }: GroupBarProps) {
  const { t } = useI18n()
  return (
    <GamePanel
      title={t('geoQuiz.group.title')}
      headerRight={
        <HelpTip title={t('geoQuiz.group.helpTitle')}>
          <p className="m-0">{t('geoQuiz.group.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={3} desktopCols={6}>
        {GROUP_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={cn(chip, groupId === id && gameBtnActive)}
            title={t('geoQuiz.group.applyTitle')}
            onClick={() => onGroupChange(id)}
          >
            {t(GROUP_LABEL[id])}
          </button>
        ))}
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
